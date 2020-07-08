import { Command, Client, CommandoMessage } from "discord.js-commando";
import { Message } from "discord.js";
import InputListener from "../objects/InputListener";
import embedBuilders from "../utils/embedBuilders";
import Validation from "../../utils/Validation";
import fetchDbMember from "../objects/DbMember";
import StringBuilders from "../utils/StringBuilders";
import { logger } from "../../app";
import { config } from "../../utils/Config";

export default class Join extends Command {
  constructor(client: Client) {
    super(client, {
      name: "edit-member",
      aliases: [],
      group: "management",
      memberName: "edit-member",
      description: "Edits a particular member's details.",
      userPermissions: [ config.permissions["edit-member"] ],
      guildOnly: true,
      throttling: { usages: 2, duration: 10 }
    });
  }

  run(commandoMessage: CommandoMessage) {

    new Promise(async () => {

      const guild = commandoMessage.guild;
      const guildMember = commandoMessage.member;
    
      const promptMessage1 = <Message> await commandoMessage.say("Loading...");
      const inputListener1 = new InputListener(this.client, promptMessage1, guildMember);

      inputListener1.start("@ the member whose details you would like to edit.", async (listenerMessage?: Message) => {
        if(!listenerMessage) return promptMessage1.edit("\`Cancelled\`");

        const listenerMentions = listenerMessage.mentions.members;
        if(!listenerMentions) return inputListener1.start("You must @ a member.");

        const listenerMention = listenerMentions.first();
        if(!listenerMention) return inputListener1.start("You must @ a member.");

        const targetGuildMember = guild.members.resolve(listenerMention.id);
        if(!targetGuildMember) return inputListener1.start(`${targetGuildMember} isn't in the server.`);

        const targetDbMember = await fetchDbMember(targetGuildMember.id);
        if(!targetDbMember) return promptMessage1.edit(`${targetGuildMember} was not found in the database.\nTry using the \`check\` command to add them.`);

        if(targetDbMember.applicationStatus.stage === 3) return promptMessage1.edit(`${targetGuildMember}'s application has already been completed.`);

        let embed = embedBuilders.applicationInfo(targetGuildMember.user, targetDbMember);
        await promptMessage1.edit({ content: "", embed });

        const boolConversion: { [key: string]: boolean } = { yes: true, no: false }

        const promptMessage2 = <Message> await commandoMessage.say("Loading...");
        const inputListener2 = new InputListener(this.client, promptMessage2, guildMember);

        inputListener2.start("Type out a new 'In-Game Name.'\n\`Cancel to skip\`", (listenerMessage?: Message) => {
          if(listenerMessage) {
            const error = Validation.inGameName(listenerMessage.content);
            if(error.length !== 0) return inputListener2.start(`${error}\n\`Cancel to skip\``);
            targetDbMember.inGameName = listenerMessage.content;
          }

          inputListener2.start("Type out a new 'Inara Name'.\n\`Cancel to skip\`", (listenerMessage?: Message) => {
            if(listenerMessage) {
              const error = Validation.inaraName(listenerMessage.content);
              if(error.length !== 0) return inputListener2.start(`${error}\n\`Cancel to skip\``);
              targetDbMember.inaraName = listenerMessage.content;
            }

            inputListener2.start("Has the user joined the squadron? (yes/no)\n\`Cancel to skip\`", (listenerMessage?: Message) => {
              if(listenerMessage) {
                const error = Validation.joinedSquadron(boolConversion[listenerMessage.content]);
                if(error.length !== 0) return inputListener2.start(`${error}\n\`Cancel to skip\``);
                targetDbMember.joinedSquadron = boolConversion[listenerMessage.content];
              }

              inputListener2.start("Has the user joined the Inara squadron? (yes/no)\n\`Cancel to skip\`", async (listenerMessage?: Message) => {
                if(listenerMessage) {
                  const error = Validation.joinedInaraSquadron(boolConversion[listenerMessage.content]);
                  if(error.length !== 0) return inputListener2.start(`${error}\n\`Cancel to skip\``);
                  targetDbMember.joinedInaraSquadron = boolConversion[listenerMessage.content];
                }
                promptMessage2.delete();

                const success = await targetDbMember.edit(guildMember.id, targetDbMember);
                if(!success) return promptMessage1.edit(StringBuilders.internalError());

                let embed = embedBuilders.applicationInfo(targetGuildMember.user, targetDbMember);
                promptMessage1.edit({ content: `${targetGuildMember}'s details have been updated.`, embed });
              });
            });
          });
        });
      });
    }).catch((err: Error) => {
      commandoMessage.reply(StringBuilders.internalError());
      logger.error(err);
    });

    return null;
  }
}
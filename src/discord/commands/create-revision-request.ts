import { Command, Client, CommandoMessage } from "discord.js-commando";
import { Message } from "discord.js";
import InputListener from "../objects/InputListener";
import embedBuilders from "../utils/embedBuilders";
import Validation from "../../utils/Validation";
import fetchDbMember from "../objects/DbMember";
import StringBuilders from "../utils/StringBuilders";
import { logger } from "../../app";
import { config } from "../../utils/Config";

export default class CreateRevisionRequest extends Command {
  constructor(client: Client) {
    super(client, {
      name: "create-revision-request",
      aliases: [],
      group: "management",
      memberName: "create-revision-request",
      description: "Creates and sends a revision request to a specific member.",
      userPermissions: [ config.permissions["create-revision-request"] ],
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

      inputListener1.start("@ the member whose details you would like to send a revision request to.", async (listenerMessage?: Message) => {
        if(!listenerMessage) return promptMessage1.edit("\`Cancelled\`");

        const listenerMentions = listenerMessage.mentions.members;
        if(!listenerMentions) return inputListener1.start("You must @ a member.");

        const listenerMention = listenerMentions.first();
        if(!listenerMention) return inputListener1.start("You must @ a member.");

        const targetGuildMember = guild.members.resolve(listenerMention.id);
        if(!targetGuildMember) return inputListener1.start(`${targetGuildMember} isn't in the server.`);

        const targetDbMember = await fetchDbMember(targetGuildMember.id);
        if(!targetDbMember) return promptMessage1.edit(`${targetGuildMember} was not found in the database.\nTry using the \`check\` command to add them.`);

        if(targetDbMember.applicationStatus.stage === 0) return promptMessage1.edit(`${targetGuildMember}'s application has not started.`);
        if(targetDbMember.applicationStatus.stage === 3) return promptMessage1.edit(`${targetGuildMember}'s application has already been completed.`);

        let embed = embedBuilders.applicationInfo(targetGuildMember.user, targetDbMember);
        await promptMessage1.edit({ content: "", embed });

        const promptMessage2 = <Message> await commandoMessage.say("Loading...");
        const inputListener2 = new InputListener(this.client, promptMessage2, guildMember);

        inputListener2.start("Type out a message to be sent with the request.'\n\`Cancel to skip\`", async (listenerMessage?: Message) => {
          if(!listenerMessage) return promptMessage2.edit(StringBuilders.internalError());

          const message = listenerMessage.content;
          const error = Validation.message(message);
          if(error.length !== 0) return inputListener2.start(`${error}\n\`Cancel to skip\``);

          const success = targetDbMember.createRevisionRequest(guildMember.id, { message });
          if(!success) return promptMessage1.edit(StringBuilders.internalError());

          let embed = embedBuilders.applicationInfo(targetGuildMember.user, targetDbMember);
          promptMessage1.edit({ content: `A revision request has been sent to ${targetGuildMember}.`, embed });

        });
      });
    }).catch((err: Error) => {
      commandoMessage.reply(StringBuilders.internalError());
      logger.error(err);
    });

    return null;
  }
}
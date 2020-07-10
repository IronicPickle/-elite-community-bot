import { Command, Client, CommandoMessage } from "discord.js-commando";
import HTTPMembers from "../../http_utils/HTTPMembers";
import { Message } from "discord.js";
import InputListener from "../objects/InputListener";
import EmbedBuilders from "../utils/EmbedBuilders";
import fetchDbMember from "../objects/DBMember";
import StringBuilder from "../utils/StringBuilders";
import { logger } from "../../app";
import { config } from "../../utils/Config";

export default class Join extends Command {
  constructor(client: Client) {
    super(client, {
      name: "check",
      aliases: [],
      group: "management",
      memberName: "check",
      description: "Displays the application details of a member.",
      userPermissions: [ config.permissions["check"] ],
      guildOnly: true,
      throttling: { usages: 2, duration: 10 }
    });
  }

  run(commandoMessage: CommandoMessage) {

    new Promise(async () => {

      const guild = commandoMessage.guild;
      const guildMember = commandoMessage.member;

      const promptMessage = <Message> await commandoMessage.say("Loading...");
      const inputListener = new InputListener(this.client, promptMessage, guildMember);

      inputListener.start("@ the member who you would like to check.", async (listenerMessage?: Message) => {
        if(!listenerMessage) return promptMessage.edit("\`Cancelled\`");

        const listenerMentions = listenerMessage.mentions.members;
        if(!listenerMentions) return inputListener.start("You must @ a member.");

        const listenerMention = listenerMentions.first();
        if(!listenerMention) return inputListener.start("You must @ a member.");

        const targetGuildMember = guild.members.resolve(listenerMention.id);
        if(!targetGuildMember) return inputListener.start(`${targetGuildMember} isn't in the server.`);

        const targetDbMember = await fetchDbMember(targetGuildMember.id);
        
        if(targetDbMember) {
          let embed = EmbedBuilders.applicationInfo(guildMember.user, targetDbMember);
          await promptMessage.edit({ content: "", embed });
          targetDbMember.update();
        } else {
          inputListener.start(`${guildMember} was not found in the database, do you want to add them? (yes/no)`, async (listenerMessage?: Message) => {
            if(!listenerMessage) return promptMessage.edit("\`Cancelled\`");
            if(listenerMessage.content !== "yes") return promptMessage.edit("\`Cancelled\`");

            await promptMessage.edit(`Loading... [Adding ${guildMember} to the database]`);
            const res = await HTTPMembers.create({ discordId: guildMember.id });
            if(!res.success) return promptMessage.edit(StringBuilder.internalError());
            promptMessage.edit(`Successfully added ${guildMember} to the database.`);
          });
        }
      });

    }).catch((err: Error) => {
      commandoMessage.reply(StringBuilder.internalError());
      logger.error(err);
    });

    return null;
  }
}
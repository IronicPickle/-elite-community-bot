import { Command, Client, CommandoMessage } from "discord.js-commando";
import HTTPMembers from "../../http_utils/HTTPMembers";
import { Message } from "discord.js";
import InputListener from "../objects/InputListener";
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
      description: "Checks if a member tracked, allowing you to track them if not.",
      userPermissions: [ config.permissions["check"] ],
      guildOnly: true,
      throttling: { usages: 2, duration: 10 }
    });
  }

  run(commandoMessage: CommandoMessage) {

    new Promise(async () => {

      const guild = commandoMessage.guild;
      const guildMember = commandoMessage.member;
      if(guildMember == null) return null;

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
        
        if(targetDbMember == null) {
          inputListener.start(`${guildMember} was not found in the database, do you want to add them? (yes/no)`, async (listenerMessage?: Message) => {
            if(!listenerMessage) return promptMessage.edit("\`Cancelled\`");
            if(listenerMessage.content !== "yes") return promptMessage.edit("\`Cancelled\`");

            await promptMessage.edit(`Loading... [Adding ${guildMember} to the database]`);
            const res = await HTTPMembers.create({ discordId: targetGuildMember.id });
            if(!res.success) return promptMessage.edit(StringBuilder.internalError());
            promptMessage.edit(`Successfully added ${targetGuildMember} to the database.`);
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
import { Command, Client, CommandoMessage } from "discord.js-commando";
import { GuildMember } from "discord.js";
import EmbedBuilders from "../utils/EmbedBuilders";
import fetchDbMember from "../objects/DBMember";
import StringBuilders from "../utils/StringBuilders";
import { logger } from "../../app";
import { config } from "../../utils/Config";

export default class ApplicationInfo extends Command {
  constructor(client: Client) {
    super(client, {
      name: "application-info",
      aliases: [],
      group: "main",
      memberName: "application-info",
      description: "Displays your application details.",
      userPermissions: [ config.permissions["application-info"] ],
      guildOnly: true,
      throttling: { usages: 2, duration: 10 }
    });
  }

  async run(message: CommandoMessage) {
    const guildMember: GuildMember = message.member;

    new Promise(async (resolve: () => any, reject: (err: Error) => any) => {

      const dbMember = await fetchDbMember(guildMember.id);
      if(!dbMember) return message.reply(StringBuilders.internalError());
      
      message.reply("\n> I've sent you a DM with your application info.");
      return guildMember.send(EmbedBuilders.applicationInfo(guildMember.user, dbMember));

    }).catch((err: Error) => {
      message.reply(StringBuilders.internalError());
      logger.error(err);
    });

    return null;
  }
}
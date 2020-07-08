import { Command, Client, CommandoMessage } from "discord.js-commando";
import StringBuilders from "../utils/StringBuilders";
import fetchDbMember from "../objects/DbMember";
import { logger } from "../../app";
import { config } from "../../utils/Config";

export default class Join extends Command {
  constructor(client: Client) {
    super(client, {
      name: "join",
      aliases: [],
      group: "main",
      memberName: "join",
      description: "Starts your application.",
      userPermissions: [ config.permissions["join"] ],
      guildOnly: true,
      throttling: { usages: 2, duration: 10 }
    });
  }

  async run(commandoMessage: CommandoMessage) {

    new Promise(async () => {

      const guildMember = commandoMessage.member;

      if(!config.application.roleId) return commandoMessage.reply(StringBuilders.internalError());
      const role = commandoMessage.guild.roles.resolve(config.application.roleId);
      if(!role) return StringBuilders.internalError();

      const dbMember = await fetchDbMember(guildMember.id);
      if(!dbMember) return commandoMessage.reply(StringBuilders.internalError());

      if(dbMember.applicationStatus.stage !== 0) return commandoMessage.reply("You have already started your application.");

      const success = dbMember.startApplication();
      if(!success) return commandoMessage.reply(StringBuilders.internalError());

      commandoMessage.reply("Check your DMs for info on how to complete your application.");

    }).catch((err: Error) => {
      commandoMessage.reply(StringBuilders.internalError());
      logger.error(err);
    });

    return null;
  }
}
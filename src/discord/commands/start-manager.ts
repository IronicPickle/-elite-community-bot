import { Command, Client, CommandoMessage } from "discord.js-commando";
import ApplicationManager from "../objects/ApplicationManager";
import { logger } from "../../app";
import { TextChannel } from "discord.js";
import StringBuilder from "../utils/StringBuilders";
import { config } from "../../utils/Config";

export default class ViewApplications extends Command {
  constructor(client: Client) {
    super(client, {
      name: "start-manager",
      aliases: [],
      group: "management",
      memberName: "start-manager",
      description: "Starts the application manager.",
      userPermissions: [ config.permissions["start-manager"] ],
      guildOnly: true,
      throttling: { usages: 2, duration: 10 }
    });
  }

  run(commandoMessage: CommandoMessage) {

    new Promise(() => {

      const guildMember = commandoMessage.member;
      const channel = <TextChannel> commandoMessage.channel;
    
      new ApplicationManager(this.client, guildMember, channel);

    }).catch((err: Error) => {
      commandoMessage.reply(StringBuilder.internalError());
      logger.error(err);
    });

    return null;
  }
}
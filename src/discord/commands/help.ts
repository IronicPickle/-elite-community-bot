import { Command, Client, CommandoMessage } from "discord.js-commando";
import StringBuilder from "../utils/StringBuilders";
import { logger } from "../../app";
import { config } from "../../utils/Config";

export default class Help extends Command {

  constructor(client: Client) {
    super(client, {
      name: "help",
      aliases: [],
      group: "help",
      memberName: "help",
      description: "Displays this help menu.",
      userPermissions: [ config.permissions["help"] ],
      guildOnly: true,
      throttling: { usages: 5, duration: 10 }
    });
  }

  async run(commandoMessage: CommandoMessage) {

    new Promise(async () => {

      const channel = commandoMessage.channel;
      const guildMember = commandoMessage.member;

      commandoMessage.reply("I've sent you a DM with the help menu.");
      guildMember.send(StringBuilder.help(guildMember), { split: true });

    }).catch((err: Error) => {
      commandoMessage.reply(StringBuilder.internalError());
      logger.error(err);
    });

    return null;
  }
}
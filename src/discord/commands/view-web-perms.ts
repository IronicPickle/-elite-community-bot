import { Command, Client, CommandoMessage } from "discord.js-commando";
import StringBuilders from "../utils/StringBuilders";
import HTTPConfig from "../../http_utils/HTTPConfig";
import { logger } from "../../app";
import { config } from "../../utils/Config";

export default class ViewWebPerms extends Command {

  constructor(client: Client) {
    super(client, {
      name: "view-web-perms",
      aliases: [],
      group: "config",
      memberName: "view-web-perms",
      description: "Displays the current permission configuration for web panel actions.",
      userPermissions: [ config.permissions["view-web-perms"] ],
      guildOnly: true,
      throttling: { usages: 5, duration: 10 }
    });
  }

  async run(commandoMessage: CommandoMessage) {

    new Promise(async () => {

      const res = await HTTPConfig.query();
      if(!res.success || !res.data) return commandoMessage.reply(StringBuilders.internalError());

      commandoMessage.say(StringBuilders.webPerms(res.data.config.permissions));

    }).catch((err: Error) => {
      commandoMessage.reply(StringBuilders.internalError());
      logger.error(err);
    });

    return null;
  }
}
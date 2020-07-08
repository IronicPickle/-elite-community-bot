import { Command, Client, CommandoMessage } from "discord.js-commando";
import StringBuilders from "../utils/StringBuilders";
import { logger } from "../../app";
import { config } from "../../utils/Config";
import { backendConfig } from "../../utils/BackendConfig";

export default class Link extends Command {

  constructor(client: Client) {
    super(client, {
      name: "link",
      aliases: [],
      group: "main",
      memberName: "link",
      description: "Supplies the link to the web portal.",
      userPermissions: [ config.permissions["link"] ],
      guildOnly: true,
      throttling: { usages: 5, duration: 10 }
    });
  }

  async run(commandoMessage: CommandoMessage) {

    new Promise(async () => {

      let publicUrl = backendConfig.master.publicUrl;
      if(!publicUrl) publicUrl = backendConfig.master.url;
      commandoMessage.reply(`Here you go ${publicUrl}.`);

    }).catch((err: Error) => {
      commandoMessage.reply(StringBuilders.internalError());
      logger.error(err);
    });

    return null;
  }
}
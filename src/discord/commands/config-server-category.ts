import { Command, Client, CommandoMessage } from "discord.js-commando";
import Config, { config } from "../../utils/Config";
import { Message } from "discord.js";
import InputListener from "../objects/InputListener";
import StringBuilders from "../utils/StringBuilders";
import { logger } from "../../app";

export default class ConfigServerCategory extends Command {

  constructor(client: Client) {

    super(client, {
      name: "config-server-category",
      aliases: [],
      group: "config",
      memberName: "config-server-category",
      description: "Configures a category to be used for server channels.",
      userPermissions: [ config.permissions["config-server-category"] ],
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

      inputListener.start("Input the ID of the category you would like to use for servers.", async (listenerMessage?: Message) => {
        if(listenerMessage == null) return promptMessage.edit("\`Cancelled\`");
        const category = commandoMessage.guild.channels.resolve(listenerMessage.content);
        if(category == null) return inputListener.start("You must use a category ID.");
        if(category.type != "category") return inputListener.start("You reference use a category.");
        
        config.serverCategoryId = category.id;
        Config.save();

        await promptMessage.edit(`${category} will now be used as the category for servers.`);
      });

    }).catch((err: Error) => {
      commandoMessage.reply(StringBuilders.internalError());
      logger.error(err);
    });

    return null;
  }
}
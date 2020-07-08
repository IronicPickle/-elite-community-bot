import { Command, Client, CommandoMessage } from "discord.js-commando";
import Config, { config } from "../../utils/Config";
import { Message } from "discord.js";
import InputListener from "../objects/InputListener";
import StringBuilders from "../utils/StringBuilders";
import { logger } from "../../app";

export default class ConfigLogChannel extends Command {

  constructor(client: Client) {

    super(client, {
      name: "config-log-channel",
      aliases: [],
      group: "config",
      memberName: "config-log-channel",
      description: "Configures a channel to be used for event logging. e.g. users joining",
      userPermissions: [ config.permissions["config-log-channel"] ],
      guildOnly: true,
      throttling: { usages: 2, duration: 10 }
    });
  }

  run(commandoMessage: CommandoMessage) {

    new Promise(async () => {

      const guildMember = commandoMessage.member;

      const promptMessage = <Message> await commandoMessage.say("Loading...");
      const inputListener = new InputListener(this.client, promptMessage, guildMember);

      inputListener.start("# the channel you could like to use for logging.", async (listenerMessage?: Message) => {
        if(!listenerMessage) return promptMessage.edit("\`Cancelled\`");
        const channel = listenerMessage.mentions.channels.first();
        if(!channel) return inputListener.start("You must # a channel.");
        
        config.logChannelId = channel.id;
        Config.save();

        await promptMessage.edit(`${channel} will now be used as the log channel.`);
      });

    }).catch((err: Error) => {
      commandoMessage.reply(StringBuilders.internalError());
      logger.error(err);
    });

    return null;
  }
}
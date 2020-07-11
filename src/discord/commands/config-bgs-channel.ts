import { Command, Client, CommandoMessage } from "discord.js-commando";
import Config, { config } from "../../utils/Config";
import { Message } from "discord.js";
import InputListener from "../objects/InputListener";
import StringBuilders from "../utils/StringBuilders";
import { logger } from "../../app";

export default class ConfigBgsChannel extends Command {

  constructor(client: Client) {

    super(client, {
      name: "config-bgs-channel",
      aliases: [],
      group: "config",
      memberName: "config-bgs-channel",
      description: "Configures a channel to be used for background simulation broadcasts.",
      userPermissions: [ config.permissions["config-bgs-channel"] ],
      guildOnly: true,
      throttling: { usages: 2, duration: 10 }
    });
  }

  run(commandoMessage: CommandoMessage) {

    new Promise(async () => {

      const guildMember = commandoMessage.member;

      const promptMessage = <Message> await commandoMessage.say("Loading...");
      const inputListener = new InputListener(this.client, promptMessage, guildMember);

      inputListener.start("# the channel you could like to use for BGS broadcasts.", async (listenerMessage?: Message) => {
        if(!listenerMessage) return promptMessage.edit("\`Cancelled\`");

        const channel = listenerMessage.mentions.channels.first();
        if(!channel) return inputListener.start("You must # a channel.");
        
        config.bgsChannelId = channel.id;
        Config.save();

        await promptMessage.edit(`${channel} will now be used as the BGS channel.`);
      });

    }).catch((err: Error) => {
      commandoMessage.reply(StringBuilders.internalError());
      logger.error(err);
    });

    return null;
  }
}
import { Command, Client, CommandoMessage } from "discord.js-commando";
import Config, { config } from "../../utils/Config";
import { Message } from "discord.js";
import InputListener from "../objects/InputListener";
import StringBuilders from "../utils/StringBuilders";
import { logger } from "../../app";

export default class ConfigApplicationRole extends Command {

  constructor(client: Client) {

    super(client, {
      name: "config-application-role",
      aliases: [],
      group: "config",
      memberName: "config-application-role",
      description: "Configures the role given to users during and after the application process.",
      userPermissions: [ config.permissions["config-application-role"] ],
      guildOnly: true,
      throttling: { usages: 2, duration: 10 }
    });
  }

  run(commandoMessage: CommandoMessage) {

    new Promise(async () => {

      const guildMember = commandoMessage.member;

      const promptMessage = <Message> await commandoMessage.say("Loading...");
      const inputListener = new InputListener(this.client, promptMessage, guildMember);

      inputListener.start("@ the role you would like to use for the application process.", async (listenerMessage?: Message) => {
        if(!listenerMessage) return promptMessage.edit("\`Cancelled\`");
        const role = listenerMessage.mentions.roles.first();
        if(!role) return inputListener.start("> You must @ a role.");
        
        config.application.roleId = role.id;
        Config.save();

        await promptMessage.edit(`${role} will now be used in the application process.`);

      });

    }).catch((err: Error) => {
      commandoMessage.reply(StringBuilders.internalError());
      logger.error(err);
    });

    return null;
  }
}
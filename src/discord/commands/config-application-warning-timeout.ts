import { Command, Client, CommandoMessage } from "discord.js-commando";
import Config, { config } from "../../utils/Config";
import { Message } from "discord.js";
import InputListener from "../objects/InputListener";
import StringBuilders from "../utils/StringBuilders";
import { logger } from "../../app";

export default class ConfigApplicationRole extends Command {

  constructor(client: Client) {

    super(client, {
      name: "config-application-warning-timeout",
      aliases: [],
      group: "config",
      memberName: "config-application-warning-timeout",
      description: "Configures number of days it takes to send a member an application timeout warning.",
      userPermissions: [ config.permissions["config-application-warning-timeout"] ],
      guildOnly: true,
      throttling: { usages: 2, duration: 10 }
    });
  }

  run(commandoMessage: CommandoMessage) {

    new Promise(async (resolve: () => any, reject: (err: Error) => any) => {

      const guildMember = commandoMessage.member;

      const promptMessage = <Message> await commandoMessage.say("Loading...");
      const inputListener = new InputListener(this.client, promptMessage, guildMember);

      inputListener.start("Type the number of days after which, a warning should be sent for the application process.", async (listenerMessage?: Message) => {
        if(!listenerMessage) return promptMessage.edit("\`Cancelled\`");

        const warningTimeoutNumber = parseInt(listenerMessage.content);
        const timeoutNumber = config.application.timeout / 1000 / 60 / 60 / 12;
        if(isNaN(warningTimeoutNumber)) return inputListener.start("You must enter a number.");
        if(warningTimeoutNumber <= 0 || warningTimeoutNumber > 999999999) return inputListener.start("The number of days must be greater than 0 but less than 999,999,999.");
        if(warningTimeoutNumber > timeoutNumber) return inputListener.start(`The **warning timeout** cannot be greater than the **application timeout**. (${timeoutNumber} days)`);
        
        config.application.warningTimeout = warningTimeoutNumber * 12 * 60 * 60 * 1000;
        Config.save();

        await promptMessage.edit(`The application process will now send a warning after **${warningTimeoutNumber} days**.`);

      });
    }).catch((err: Error) => {
      commandoMessage.reply(StringBuilders.internalError());
      logger.error(err);
    });

    return null;
  }
}
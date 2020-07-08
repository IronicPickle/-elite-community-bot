import { Command, Client, CommandoMessage } from "discord.js-commando";
import Config, { config } from "../../utils/Config";
import { Message } from "discord.js";
import InputListener from "../objects/InputListener";
import StringBuilders from "../utils/StringBuilders";
import { logger } from "../../app";

export default class ConfigApplicationRole extends Command {

  constructor(client: Client) {

    super(client, {
      name: "config-application-timeout",
      aliases: [],
      group: "config",
      memberName: "config-application-timeout",
      description: "Configures the number of days it takes for an application to timeout.",
      userPermissions: [ config.permissions["config-application-timeout"] ],
      guildOnly: true,
      throttling: { usages: 2, duration: 10 }
    });
  }

  run(commandoMessage: CommandoMessage) {

    new Promise(async () => {

      const guildMember = commandoMessage.member;

      const promptMessage = <Message> await commandoMessage.say("Loading...");
      const inputListener = new InputListener(this.client, promptMessage, guildMember);

      inputListener.start("Type the number of days after which, the application process should timeout.", async (listenerMessage?: Message) => {
        if(!listenerMessage) return promptMessage.edit("\`Cancelled\`");

        const timeoutNumber = parseInt(listenerMessage.content);
        const warningTimeoutNumber = config.application.warningTimeout / 1000 / 60 / 60 / 12;
        if(isNaN(timeoutNumber)) return inputListener.start("You must enter a number.");
        if(timeoutNumber <= 0 || timeoutNumber > 999999999) return inputListener.start("The number of days must be greater than 0 but less than 999,999,999.");
        if(warningTimeoutNumber > timeoutNumber) return inputListener.start(`The **application timeout** cannot be less than the **warning timeout**. (${warningTimeoutNumber} days)`);
        
        config.application.timeout = timeoutNumber * 12 * 60 * 60 * 1000;
        Config.save();

        await promptMessage.edit(`The application process will now timeout after **${timeoutNumber} days**.`);

      });
    }).catch((err: Error) => {
      commandoMessage.reply(StringBuilders.internalError());
      logger.error(err);
    });

    return null;
  }
}
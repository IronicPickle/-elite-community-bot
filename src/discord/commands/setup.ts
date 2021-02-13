import { Command, Client, CommandoMessage } from "discord.js-commando";
import Config, { config } from "../../utils/Config";
import StringBuilders from "../utils/StringBuilders";
import CommandRegister from "../utils/CommandRegister";
import { Message } from "discord.js";
import InputListener from "../objects/InputListener";
import { logger } from "../../app";

export default class Setup extends Command {
  constructor(client: Client) {
    super(client, {
      name: "setup",
      aliases: [],
      group: "config",
      memberName: "setup",
      description: "Intiates the first time setup process.",
      userPermissions: [ config.permissions["setup"] ],
      guildOnly: true,
      throttling: { usages: 2, duration: 10 }
    });
  }

  run(commandoMessage: CommandoMessage) {

    new Promise(async () => {

      const guild = commandoMessage.guild;
      const guildMember = commandoMessage.member;
      if(guildMember == null) return null;

      let string = "> Are you sure you want to perform a first time setup? (yes/no)";
      string += "\n> [WARNING] This will reset all configuration options.";

      const promptMessage = <Message> await commandoMessage.say("Loading...");

      const inputListener = new InputListener(this.client, promptMessage, guildMember);

      inputListener.start(string, async (listenerMessage?: Message) => {
        if(!listenerMessage) return promptMessage.edit("\`Cancelled\`");
        if(listenerMessage.content != "yes") return promptMessage.edit("\`Cancelled\`");

        string = "> ⏳ **Performing First Time Setup**\n";
        await promptMessage.edit(string);

        if(config.guildId) {
          Config.reset();
          string += "\n`- Reset configuration`";
          await promptMessage.edit(string);
        }
  
        if(!CommandRegister.registerAll(this.client)) await promptMessage.edit("> An internal server error occurred.");
        string += "\n`- Registered all commands`";
        await promptMessage.edit(string);
  
        config.guildId = guild.id;
        Config.save();
        string += "\n`- Bound bot to current server`";
        await promptMessage.edit(string);

        string += `\n\n${StringBuilders.setup()}`;
        await promptMessage.edit(string);
      });
    }).catch((err: Error) => {
      commandoMessage.reply(StringBuilders.internalError());
      logger.error(err);
    });

    return null
  }
}
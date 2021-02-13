import { Command, Client, CommandoMessage } from "discord.js-commando";
import Config, { config } from "../../utils/Config";
import { Permissions, Message, PermissionString } from "discord.js";
import CommandRegister from "../utils/CommandRegister";
import InputListener from "../objects/InputListener";
import StringBuilders from "../utils/StringBuilders";
import { logger } from "../../app";

export default class ConfigDiscordPerm extends Command {

  constructor(client: Client) {

    super(client, {
      name: "config-discord-perm",
      aliases: [],
      group: "config",
      memberName: "config-discord-perm",
      description: "Binds a specific permission to a discord command.",
      userPermissions: [ config.permissions["config-discord-perm"] ],
      guildOnly: true,
      throttling: { usages: 2, duration: 10 }
    });
  }

  run(commandoMessage: CommandoMessage) {

    new Promise(async () => {

      const guildMember = commandoMessage.member;
      if(guildMember == null) return;

      const whitelisted: string[] = Object.keys(config.permissions);
      const whitelistedParsed: string = "```Configurable Commands:\n> " + whitelisted.toString().replace(/,/g, "\n> ") + "```";
      const permissionsParsed: string = "```User Permissions:\n> " + Object.keys(Permissions.FLAGS).toString().replace(/,/g, "\n> ") + "```";

      const promptMessage = <Message> await commandoMessage.say("Loading...");

      const inputListener = new InputListener(this.client, promptMessage, guildMember);

      inputListener.start(`Provide the command you would like to configure.\n${whitelistedParsed}`, async (listenerMessage?: Message) => {
        if(!listenerMessage) return promptMessage.edit("\`Cancelled\`");
        const command = listenerMessage.content;
        if(!whitelisted.includes(command)) return inputListener.start(`You can only configure the permissions of the following commands:\n${whitelistedParsed}`);

        inputListener.start(`Provide the user permission you would like to bind.\n${permissionsParsed}`, async (listenerMessage?: Message) => {
          if(!listenerMessage) return promptMessage.edit("\`Cancelled\`");
          const permission = listenerMessage.content.toUpperCase();
          if(!Object.keys(Permissions.FLAGS).includes(permission)) return inputListener.start(`You must provide one of the following user permissions.\n${permissionsParsed}`);

          config.permissions[command] = <PermissionString> permission;
          Config.save();

          if(!CommandRegister.register(this.client, command)) return promptMessage.edit(StringBuilders.internalError());

          await promptMessage.edit(`Users will now require the '${permission}' permission to use the \`${command}\` command.`);

        });
      });

    }).catch((err: Error) => {
      commandoMessage.reply(StringBuilders.internalError());
      logger.error(err);
    });

    return null;
  }
}
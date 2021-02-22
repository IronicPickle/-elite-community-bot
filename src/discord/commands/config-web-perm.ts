import { Command, Client, CommandoMessage } from "discord.js-commando";
import { Permissions, Message } from "discord.js";
import InputListener from "../objects/InputListener";
import HTTPConfig from "../../http_utils/HTTPConfig";
import StringBuilders from "../utils/StringBuilders";
import { logger } from "../../app";
import { config } from "../../utils/Config";

export default class ConfigWebPerm extends Command {

  constructor(client: Client) {

    super(client, {
      name: "config-web-perm",
      aliases: [],
      group: "config",
      memberName: "config-web-perm",
      description: "Binds a specific permission to an action on the web panel.",
      userPermissions: [ config.permissions["config-web-perm"] ],
      guildOnly: true,
      throttling: { usages: 2, duration: 10 }
    });
  }

  run(commandoMessage: CommandoMessage) {

    new Promise(async () => {

      const guildMember = commandoMessage.member;
      if(guildMember == null) return null;

      const promptMessage = <Message> await commandoMessage.say("Loading...");

      const res = await HTTPConfig.query();
      if(!res.success || !res.data) return promptMessage.edit(StringBuilders.internalError());

      const whitelisted: string[] = Object.keys(res.data.config.permissions);
      const whitelistedParsed: string = "```Configurable Actions:\n> " + whitelisted.toString().replace(/,/g, "\n> ") + "```";
      const permissions = [ ...Object.keys(Permissions.FLAGS), "ANYONE" ];
      const permissionsParsed: string = "```User Permissions:\n> " + permissions.toString().replace(/,/g, "\n> ") + "```";

      const inputListener = new InputListener(this.client, promptMessage, guildMember);

      inputListener.start(`Provide the action you would like to configure.\n${whitelistedParsed}`, async (listenerMessage?: Message) => {
        if(!listenerMessage) return promptMessage.edit("\`Cancelled\`");
        const action = listenerMessage.content;
        if(!whitelisted.includes(action)) return inputListener.start(`You can only configure the permissions of the following actions:\n${whitelistedParsed}`);

        inputListener.start(`Provide the user permission you would like to bind.\n${permissionsParsed}`, async (listenerMessage?: Message) => {
          if(!listenerMessage) return promptMessage.edit("\`Cancelled\`");
          const permission = listenerMessage.content.toUpperCase();
          if(!permissions.includes(permission)) return inputListener.start(`You must provide one of the following user permissions.\n${permissionsParsed}`);

          const res = await HTTPConfig.edit(action, permission);
          if(!res.success) return promptMessage.edit(StringBuilders.internalError());

          promptMessage.edit(`Users will now require the '${permission}' permission to perform actions bound to \`${action}\` on the Web UI.`);

        });
      });

    }).catch((err: Error) => {
      commandoMessage.reply(StringBuilders.internalError());
      logger.error(err);
    });

    return null;
  }
}
import { Command, Client, CommandoMessage } from "discord.js-commando";
import StringBuilders from "../utils/StringBuilders";
import { config } from "../../utils/Config";

export default class ViewDiscordPerms extends Command {

  constructor(client: Client) {
    super(client, {
      name: "view-discord-perms",
      aliases: [],
      group: "config",
      memberName: "view-discord-perms",
      description: "Displays the current permission configuration for discord commands.",
      userPermissions: [ config.permissions["view-discord-perms"] ],
      guildOnly: true,
      throttling: { usages: 5, duration: 10 }
    });
  }

  run(commandoMessage: CommandoMessage) {

    return commandoMessage.say(StringBuilders.perms(config.permissions));
  }
}
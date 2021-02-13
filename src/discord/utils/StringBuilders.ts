import { GuildMember } from "discord.js";
import { Command, CommandGroup } from "discord.js-commando";
import { DBMember } from "../objects/DBMember";
import { discordBot } from "../../app";
import { config } from "../../utils/Config";

export default class StringBuilder {

  public static help(member: GuildMember): string {

    const prefix = discordBot.prefix;
    const client = discordBot.client;
    const groups = client.registry.groups;

    let string = "> ⁉️ **Help Menu**";

    string += "\n\nThis menu contains a list of commands that you have access to.";

    groups.forEach((group: CommandGroup, i: string) => {
      const commands = group.commands;
      const permissedCommands = commands.filter((command: Command) => member.hasPermission(command.userPermissions))
      if(commands.size === 0 || permissedCommands.size === 0) return;
      string += `\n\n❗ __${group.name}__`;
      commands.forEach((command: Command, ii: string) => {
        if(!member.hasPermission(command.userPermissions)) return;
        string += `\n\`${prefix}${command.name}\` - ${command.description}`;
      });
    });

    string += `\n\n***Note:** You can use ${client.user} to call a command as well as \`${prefix}\`.*`;
    string += "\n***Note:** All commands must be used in the server chat.*";

    return string;

  }

  public static perms(perms: { [key: string]: any }): string {

    let string = "```Permission Configuration:";

    for(const i in perms) {
      string += `\n${i} - ${ perms[i] }`;
    }
  
    string += "```";
  
    return string;

  }

  public static webPerms(perms: { [key: string]: any }): string {

    let string = "```Web Permission Configuration:";

    for(const i in perms) {
      string += `\n${i} - ${ perms[i] }`;
    }

    string += "```";

    return string;

  }

  public static setup(): string {

    let string = "> ✅ **First Time Setup Complete**";

    string += "\n\n__We would **recommend** you do the following before using the bot__";
    string += `\n- Use \`config-log-channel\` to configure a log channel. (Optional)`;
    string += `\n  This channel is used to log events such as users joining, applications starting and applications completing.`;

    string += "\n\n__It is also **helpful** to do the following too__";
    string += `\n- Use \`view-discord-perms\` to view a list of discord permissions.`;
    string += `\n  These can be configured using \`config-discord-perms\`.`;
    string += `\n- Use \`view-web-perms\` to view a list of web portal permissions.`;
    string += `\n  These can be configured using \`config-web-perms\`.`;

    string += `\n\n*To view a list of all available commands, use \`help\`.*`;

    return string;

  }

  public static welcomeFirstTime(guildMember: GuildMember): string {

    const guild = guildMember.guild;

    let string = `> 🚪 **Welcome to ${guild.name}**`;

    string += `\n\nWe've noticed that this is your first time around here ${guildMember}.`;

    string += "\n\nPlease give our rules a read and enjoy your stay.";

    return string;

  }

  public static welcomeBack(guildMember: GuildMember, dbMember: DBMember): string {

    const guild = guildMember.guild;

    let string = `> 🚪 **Welcome back to ${guild.name}**`;

    string += `\n\nIt's good to have you back ${guildMember}.`;

    return string;

  }

  public static internalError(): string {

    let string = "An internal error has occurred!";

    string += "\n*You should not see this error, please contact an admin.*";

    return string;

  }

}
import { GuildMember } from "discord.js";
import { CommandoClient, Command, CommandGroup } from "discord.js-commando";
import { DBMember } from "../objects/DbMember";
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

    string += "\n\n__You **need** to do the following before using the bot__";
    string += `\n- Use \`config-application-role\` to configure an application role.`;
    string += `\n  This role is given to users who start their application process.`;
    string += `\n  It is taken away if a user's application times out.`;

    string += "\n\n__We would **recommend** you do the following before using the bot__";
    string += `\n- Use \`config-log-channel\` to configure a log channel. (Optional)`;
    string += `\n  This channel is used to log events such as users joining, applications starting and applications completing.`;
    string += `\n- Use \`config-bgs-channel\` to configure a background simulation broadcast channel. (Optional)`;
    string += `\n  This channel is used for background simulation mission broadcasts.`;
    string += `\n- Use \`config-bgs-faction\` to configure a background simulation faction. (Optional)`;
    string += `\n  This allows BGS broadcasts to show the influence of all factions in your home system.`;
    string += `\n- Use \`config-application-timeout\` to configure an application timeout. [Default: 10 days]`;
    string += `\n  This is the number of days it takes for a users application to timeout and reset.`;
    string += `\n- Use \`config-application-warning-timeout\` to configure an application warning timeout. [Default: 5 days]`;
    string += `\n  This is the number of days it takes for a user to recieve an application timeout warning.`;

    string += "\n\n__It is also **helpful** to do the following too__";
    string += `\n- Use \`view-discord-perms\` to view a list of discord permissions.`;
    string += `\n  These can be configured using \`config-discord-perms\`.`;
    string += `\n- Use \`view-web-perms\` to view a list of web portal permissions.`;
    string += `\n  These can be configured using \`config-web-perms\`.`;

    string += `\n\n*To view a list of all available commands, use \`help\`.*`;

    return string;

  }

  public static applicationStart(member: GuildMember): string {
  
    let string = `> 🚪 **Welcome to ${member.guild.name}**`;

    string += "\n\nHere we will guide you through our application process. Don't worry, it won't take long and we don't ask much.";
    string += "\nIn order to proceed with your application, we need you to do a few things.";

    string += "\n\n1️⃣ __In-Game Squadron__";
    string += "\n```Firstly, we need you to join our squadron in-game.";
    string += "\nRight Panel > Squadrons > Search for 'IP3X'.```";

    string += "\n2️⃣ __Inara.cz Squadron__";
    string += "\n```Secondly, we need you to join our squadron on Inara.cz.";
    string += "\nPlease create an Inara account now if you don't already have one."
    string += "\nSquadron (Top) > Search (Left) > Search for 'IP3X'.```";

    string += "\n3️⃣ __Submit Your Details__";
    string += "\n```To finalise your application we need to know your username both in-game and on Inara.";
    string += `\nTo provide these details simply run the command \`submit-details\`.`;
    string += "\nOnce you have done that, your application will be reviewed by one of our senior members,"
    string += "\nand your application will be marked as completed if it meets all the requirements.```";

  return string;

  }

  public static applicationWarning(startDate: Date): string {

    const timeout = config.application.timeout / 1000 / 60 / 60 / 12;
    const warningTimeout = config.application.warningTimeout / 1000 / 60 / 60 / 12;
    
    let string = `> ⚠️ **Application Timeout Warning**`;

    string += `\n\n${warningTimeout} days have passed since you started your application.`;
    string += `\nYou have ${timeout - warningTimeout} days left to finish your application before it will be reset.`;

    return string;

  }

  public static applicationReset(startDate: Date): string {

    const timeout = config.application.timeout / 1000 / 60 / 60 / 12;
  
    let string = `> ⏳ **Application Reset Notice**`;

    string += `\n\n${timeout} days have passed since you started your application.`;
    string += "\nThis is the maximum time allowed for an application to sit idle.";
    string += "\nYour application has been reset, you can re-apply any time.";
    string += `\nSimply use the \`join\` command in server chat.`
    
    return string;

  }

  public static revisionRequest(message: string, authorMember: GuildMember): string {

    let string = "> ⏰ **Revision Request**";

    string += "\n\nA revision request has been made regarding your application.";
    string += "\nPlease read the request made below.";

    string += `\n\n\`\`\`${message}\`\`\``

    string += `by ${authorMember}`;

    string += `\n\n*To edit your details, use the command 'submit-details' in the server chat.*`

    return string;

  }

  public static welcomeFirstTime(guildMember: GuildMember): string {

    const guild = guildMember.guild;

    let string = `> 🚪 **Welcome to ${guild.name}**`;

    string += `\n\nWe've noticed that this is your first time around here ${guildMember}.`;

    string += "\n\nIf you'd like to start an application to join our squadron, use the \`join\` command in server chat.";
    string += "\nIf you'd just like to see what I can do use the \`help\` command in server chat."

    return string;

  }

  public static welcomeBack(guildMember: GuildMember, dbMember: DBMember): string {

    const guild = guildMember.guild;
    const stage = dbMember.applicationStatus.stage;

    let string = `> 🚪 **Welcome back to ${guild.name}**`;

    string += `\n\nIt's good to have you back ${guildMember}.`;

    if(stage === 0) {
      string += "\n\nLast time you were here, you didn't start an application, so if you'd like to do so, use the command \`join\` in server chat.";
    } else if(stage === 1 || stage === 2) {
      string += "\n\nIt seems your application is still in progress from the last time you were here.";
      string += "\nPlease use \`submit-details\` to complete your application if you haven't already.";
    } else if(stage === 3) {
      string += "\n\nYour application from last time you were here has still been saved, if any of your details have updated since, please contact an admin.";
    }

    return string;

  }

  public static internalError(): string {

    let string = "An internal error has occurred!";

    string += "\n*You should not see this error, please contact an admin.*";

    return string;

  }

}
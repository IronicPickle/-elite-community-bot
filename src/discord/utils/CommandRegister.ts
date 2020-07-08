import { Command, CommandoClient } from "discord.js-commando";
import path from "path";
import { logger } from "../../app";
const requireAll = require("require-all");

export default class CommandRegister {

  public static register(client: CommandoClient, name: string): boolean {
    
    const Command: Command = require(path.join(__dirname, `/../commands/${name}`));
    if(!Command) return false;
  
    if(client.registry.commands.has(name)) {
      const OldCommand = client.registry.commands.get(name);
      if(!OldCommand) return false;
      client.registry.reregisterCommand(Command, OldCommand);
      logger.info(`[Discord] Re-registered command: ${name}`);
    } else {
      client.registry.registerCommand(Command);
      logger.info(`[Discord] Registered command: ${name}`);
    }
    
    return true;

  }

  public static registerAll(client: CommandoClient): boolean {

    const commands = requireAll({
      dirname: path.join(__dirname, `/../commands`),
      filter: /^([^.].*)\.(js|ts)$/
    });
  
    for(const i in commands) {
      this.register(client, i);
    }
  
    return true;

  }

}
import fs from "fs";
import path from "path";
import { PermissionString } from "discord.js";
import { logger } from "../app";
import { Validator, Schema } from "jsonschema";

interface ConfigSchema {
  guildId: string | null;
  logChannelId: string | null;
  newsChannelId: string | null;
  serverCategoryId: string | null;
  permissions: { [key: string]: PermissionString };
}

const defaultConfig: ConfigSchema = {
  guildId: null,
  logChannelId: null,
  newsChannelId: null,
  serverCategoryId: null,
  permissions: {
    // Group Help
    "help": "SEND_MESSAGES",

    // Group: Main
    "link": "SEND_MESSAGES",

    // Group: Management
    "check": "MANAGE_MESSAGES",
    "check-all": "ADMINISTRATOR",

    // Group: Config
    "setup": "ADMINISTRATOR",

    "config-discord-perm": "ADMINISTRATOR",
    "config-web-perm": "ADMINISTRATOR",
    
    "config-log-channel": "ADMINISTRATOR",
    "config-news-channel": "ADMINISTRATOR",
    "config-server-category": "ADMINISTRATOR",

    "view-discord-perms": "MANAGE_MESSAGES",
    "view-web-perms": "MANAGE_MESSAGES"
    
  }

}

export let config: ConfigSchema = JSON.parse(JSON.stringify(defaultConfig));

const configSchema: Schema = {
  type: "object",
  properties: {
    guildId: { type: [ "string", "null" ] },
    logChannelId: { type: [ "string", "null" ] },
    permissions: {
      type: "object",
      properties: {
        "help": { type: "string" },

        // Group: Main
        "link": { type: "string" },

        // Group: Management
        "check": { type: "string" },
        "check-all": { type: "string" },

        // Group: Config
        "setup": { type: "string" },

        "config-discord-perm": { type: "string" },
        "config-web-perm": { type: "string" },

        "config-log-channel": { type: "string" },
        "config-news-channel": { type: "string" },
        "config-server-category": { type: "string" },

        "view-discord-perms": { type: "string" },
        "view-web-perms": { type: "string" }
      }
    }
  }
}

const validator = new Validator();

export default class Config {
  private static path = "./config/config.json";

  public static load() {

    return new Promise<void>((resolve, reject) => {
      fs.readFile(this.path, { encoding: "utf-8" }, (err: NodeJS.ErrnoException | null, data: string) => {
        if(err) {
          this.generate();
          return resolve();
        }

        try {
          const parsedData = JSON.parse(data);
          const validation = validator.validate(parsedData, configSchema);
          if(!validation.valid) return reject(`[Config] config.json does not match schema:\n  ${validation.errors.join("\n  ")}`);
          
          config = parsedData;
          logger.info("[Config] Loaded config.json file");
          resolve();
        } catch(err) {
          reject(`[Config] ${err}`);
        }
      });
    });

  }

  private static generate() {

    if(!fs.existsSync(path.dirname(this.path))) fs.mkdirSync(path.dirname(this.path));

    fs.writeFileSync(this.path, JSON.stringify(defaultConfig, null, 2));
    logger.info("[Config] Generated default config.json file");

  }

  public static save() {

    fs.writeFileSync(this.path, JSON.stringify(config, null, 2));
    logger.info("[Config] Saved config.json file");

  }

  public static reset() {

    fs.writeFileSync(this.path, JSON.stringify(defaultConfig, null, 2));
    config = JSON.parse(JSON.stringify(defaultConfig));
    logger.info("[Config] Reset config.json file");

  }

}
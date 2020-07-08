import fs from "fs";
import path from "path";
import { PermissionString } from "discord.js";
import { logger } from "../app";
import { Validator, Schema } from "jsonschema";

interface ConfigSchema {
  guildId: string | null;
  logChannelId: string | null,
  bgsChannelId: string | null,
  bgs: {
    homeSystemId: number | null,
    factionId: number | null
  },
  application: {
    roleId: string | null;
    timeout: number;
    warningTimeout: number;
  }
  permissions: { [key: string]: PermissionString };
}

const defaultConfig: ConfigSchema = {
  guildId: null,
  logChannelId: null,
  bgsChannelId: null,
  bgs: {
    homeSystemId: null,
    factionId: null
  },
  application: {
    roleId: null,
    timeout: 432000000,
    warningTimeout: 345600000
  },
  permissions: {
    // Group Help
    "help": "SEND_MESSAGES",

    // Group: Main
    "join": "SEND_MESSAGES",
    "application-info": "SEND_MESSAGES",
    "submit-details": "SEND_MESSAGES",
    "link": "SEND_MESSAGES",

    // Group: Management
    "start-manager": "MANAGE_MESSAGES",
    "check": "ADMINISTRATOR",
    "check-all": "ADMINISTRATOR",
    "force-start-all": "ADMINISTRATOR",
    "broadcast-mission": "MANAGE_MESSAGES",

    // Group: Config
    "setup": "ADMINISTRATOR",
    "config-discord-perm": "ADMINISTRATOR",
    "config-web-perm": "ADMINISTRATOR",
    "config-application-role": "ADMINISTRATOR",
    "config-application-timeout": "ADMINISTRATOR",
    "config-application-warning-timeout": "ADMINISTRATOR",
    "config-log-channel": "ADMINISTRATOR",
    "config-bgs-channel": "ADMINISTRATOR",
    "config-bgs-faction": "MANAGE_MESSAGES",
    "view-discord-perms": "MANAGE_MESSAGES",
    "view-web-perms": "MANAGE_MESSAGES",

    // Misc
    "edit-member": "MANAGE_MESSAGES",
    "create-revision-request": "MANAGE_MESSAGES",
    "complete-application": "ADMINISTRATOR",
    "revert-application": "ADMINISTRATOR"
    
  }

}

export let config: ConfigSchema = JSON.parse(JSON.stringify(defaultConfig));

const configSchema: Schema = {
  type: "object",
  properties: {
    guildId: { type: [ "string", "null" ] },
    logChannelId: { type: [ "string", "null" ] },
    bgsChannelId: { type: [ "string", "null" ] },
    bgs: {
      type: "object",
      properties: {
        homeSystemId: { type: [ "number", "null" ] },
        factionId: { type: [ "number", "null" ] }
      }
    },
    application: {
      type: "object",
      properties: {
        roleId: { type: [ "string", "null" ] },
        timeout: { type: "number" },
        warningTimeout: { type: "number" }
      }
    },
    permissions: {
      type: "object",
      properties: {
        "help": { type: "string" },

        // Group: Main
        "join": { type: "string" },
        "application-info": { type: "string" },
        "submit-details": { type: "string" },
        "link": { type: "string" },

        // Group: Management
        "start-manager": { type: "string" },
        "check": { type: "string" },
        "check-all": { type: "string" },
        "force-start-all": { type: "string" },
        "broadcast-mission": { type: "string" },

        // Group: Config
        "setup": { type: "string" },
        "config-discord-perm": { type: "string" },
        "config-web-perm": { type: "string" },
        "config-application-role": { type: "string" },
        "config-application-timeout": { type: "string" },
        "config-application-warning-timeout": { type: "string" },
        "config-log-channel": { type: "string" },
        "config-bgs-channel": { type: "string" },
        "config-bgs-faction": { type: "string" },
        "view-discord-perms": { type: "string" },
        "view-web-perms": { type: "string" },

        // Misc
        "edit-member": { type: "string" },
        "create-revision-request": { type: "string" },
        "complete-application": { type: "string" },
        "revert-application": { type: "string" }
      }
    }
  }
}

const validator = new Validator();

export default class Config {
  private static path = "./config/config.json";

  public static load() {

    return new Promise((resolve, reject) => {
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
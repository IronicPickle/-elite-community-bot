import { CommandoClient } from "discord.js-commando";
import CommandRegister from "./utils/CommandRegister";
import { logger } from "../app";
import { config } from "../utils/Config";
import { backendConfig } from "../utils/BackendConfig";

export default class DiscordBot {

  public client!: CommandoClient;
  
  public token: string | null;
  public prefix: string;
  public ownerIds: string[];

  constructor() {
    this.token = backendConfig.discord.token;
    this.prefix = backendConfig.discord.prefix;
    this.ownerIds = backendConfig.discord.ownerIds;

    this.client = new CommandoClient({
      commandPrefix: this.prefix,
      owner: this.ownerIds
    });
  }

  start() {
    return new Promise<void>((resolve, reject) => {
      if(!this.token) return reject("[Config] No discord API token configured");

      this.client.on("ready", () => {
        const clientUser = this.client.user;
        if(clientUser) clientUser.setActivity(" Loads of Data!", { type: "STREAMING" });
        resolve();
      });

      this.client.on("error", (err: Error) => {
        logger.error(err);
      });

      this.client.login(this.token);

      this.client.registry
        .registerDefaultTypes()
        .registerGroups([
            ["help", "Help Commands"],
            ["main", "Main Commands"],
            ["management", "Management Commands"],
            ["config", "Configuration Commands"],
        ])

        if(config.guildId) {
          CommandRegister.registerAll(this.client);
        } else {
          CommandRegister.register(this.client, "setup");
          CommandRegister.register(this.client, "help");
        }

    });
  }
}
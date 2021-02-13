import NodeServer from "./server/NodeServer";
import DiscordBot from "./discord/DiscordBot"
import EventHandler from "./discord/EventHandler";
import Config from "./utils/Config";
import winston, { transports } from "winston";
import { exit } from "process";
import BackendConfig, { backendConfig } from "./utils/BackendConfig";
import figlet from "figlet";

const logLevel = (process.env.NODE_ENV === "production" ? "info" : "debug");

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.simple(),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "./log/error.log", level: "error" }),
    new transports.File({ filename: "./log/combined.log" })
  ],
  exceptionHandlers: [
    new transports.Console(),
    new transports.File({ filename: "./log/exceptions.log" })
  ]
});

console.log("\n#========================================================#");
console.log(`${figlet.textSync(" Companion", { font: "Doom" })}`);
console.log("#========================================================#\n");

export let nodeServer: NodeServer;
export let discordBot: DiscordBot;

logger.info("[Node] Initialising");

Config.load().then(() => {
  BackendConfig.load().then(() => {
    if(!backendConfig.master.token) throw new Error("[Config] No master token configured");
    nodeServer = new NodeServer();
    discordBot = new DiscordBot();
    const environment = process.env.NODE_ENV;
    logger.info(`[Node] Environment: ${environment}`);

    nodeServer.start().then(() => {
      logger.info(`[Node] Listening on: ${nodeServer.port}`);
    }).catch((err: Error) => {
      logger.error(err);
      exit();
    });

    discordBot.start().then(() => {
      const clientUser = discordBot.client.user;
      if(clientUser) logger.info(`[Discord] Logged in as: ${clientUser.username}`);

      EventHandler.registerAll(discordBot.client);
      
    }).catch((err: Error) => {
      logger.error(err);
      exit();
    });

  }).catch((err: Error) => {
    logger.error(err);
    exit();
  });

}).catch((err: Error) => {
  logger.error(err);
  exit();
});
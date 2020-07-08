import { Command, Client, CommandoMessage } from "discord.js-commando";
import Config, { config } from "../../utils/Config";
import { Message } from "discord.js";
import InputListener from "../objects/InputListener";
import HTTPBGS, { FactionData } from "../../http_utils/HTTPBGS";
import StringBuilders from"../utils/StringBuilders";
import { logger } from "../../app";

export default class ConfigBgsFaction extends Command {

  constructor(client: Client) {

    super(client, {
      name: "config-bgs-faction",
      aliases: [],
      group: "config",
      memberName: "config-bgs-faction",
      description: "Configures the faction that pertains to the squadron.",
      userPermissions: [ config.permissions["config-bgs-faction"] ],
      guildOnly: true,
      throttling: { usages: 2, duration: 10 }
    });
  }

  run(commandoMessage: CommandoMessage) {

    new Promise(async () => {

      const guildMember = commandoMessage.member;
    
      const promptMessage = <Message> await commandoMessage.say("Loading...");
      const inputListener = new InputListener(this.client, promptMessage, guildMember);

      inputListener.start("Type the name of the home system your faction resides in.", async (listenerMessage?: Message) => {
        if(!listenerMessage) return promptMessage.edit("\`Cancelled\`");
        const homeSystemName = listenerMessage.content;

        const res = await HTTPBGS.queryFactionsBySystemName(homeSystemName);
        if(!res.success || !res.data) return promptMessage.edit(StringBuilders.internalError());
        const factionData = res.data.factionData;
        if(!factionData.id) {
          return inputListener.start("System not found, please try again.");
        } else if(factionData.factions.length === 0) {
          return inputListener.start(`${factionData.name} contains no factions, please try again.`);
        }

        let factionString = "\n```";
        for(const i in factionData.factions) {
          const faction = factionData.factions[i];
          factionString += faction.name + "\n";
        }
        factionString += "```";

        inputListener.start(`Choose one of the following that matches your faction. ${factionString}`, async (listenerMessage?: Message) => {
          if(!listenerMessage) return promptMessage.edit("\`Cancelled\`");

          const factions: { [key: string]: any } =  factionData.factions;
          const faction = factions.find((faction: FactionData) => faction.name.toLocaleLowerCase() === listenerMessage.content.toLocaleLowerCase());
          if(!faction) {
            return inputListener.start(`Faction not in system, please choose from one of the following. ${factionString}`);
          }

          config.bgs.homeSystemId = factionData.id;
          config.bgs.factionId = faction.id;
          Config.save();

          promptMessage.edit(`The bot is now bound to the faction '${faction.name}' in the system '${factionData.name}'.`);

        });
        
      });

    }).catch((err: Error) => {
      commandoMessage.reply(StringBuilders.internalError());
      logger.error(err);
    });

    return null;
  }
}
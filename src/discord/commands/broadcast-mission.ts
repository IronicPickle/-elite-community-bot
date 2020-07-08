import { Command, Client, CommandoMessage } from "discord.js-commando";
import { Message } from "discord.js";
import InputListener from "../objects/InputListener";
import StringBuilders from "../utils/StringBuilders";
import HTTPMissions from "../../http_utils/HTTPMissions";
import Validation from "../../utils/Validation";
import { logger } from "../../app";
import { config } from "../../utils/Config";

export default class Join extends Command {
  constructor(client: Client) {
    super(client, {
      name: "broadcast-mission",
      aliases: [],
      group: "management",
      memberName: "broadcast-mission",
      description: "Creates and broadcasts a mission to the BGS channel.",
      userPermissions: [ config.permissions["broadcast-mission"] ],
      guildOnly: true,
      throttling: { usages: 2, duration: 10 }
    });
  }

  run(commandoMessage: CommandoMessage) {

    new Promise(async () => {

      const guildMember = commandoMessage.member;

      const promptMessage = <Message> await commandoMessage.say("Loading...");
      const inputListener = new InputListener(this.client, promptMessage, guildMember);

      inputListener.start("Type out the description for the mission.", async (listenerMessage?: Message) => {
        if(!listenerMessage) return promptMessage.edit("\`Cancelled\`");

        const description = listenerMessage.content;
        const error = Validation.description(description);
        if(error.length !== 0) return inputListener.start(error);

        const objectives: string[] = [];
        let finished = false;

        inputListener.start("Type out the first objective.", async (listenerMessage?: Message) => {
          if(!listenerMessage && objectives.length === 0) return promptMessage.edit("\`Cancelled\`");
          if(!listenerMessage) {
            finished = true;
            
            const res = await HTTPMissions.broadcast(guildMember.id, { description, objectives });
            if(!res.success) return promptMessage.edit(StringBuilders.internalError());
            return promptMessage.edit("Mission successfully broadcasted.");
            
          }

          const objective = listenerMessage.content;
          const error = Validation.description(objective);
          if(error.length !== 0) return inputListener.start(error);
          
          objectives.push(objective);
          return inputListener.start("Type out the next objective or click cancel to finish.");
        });

      });

    }).catch((err: Error) => {
      commandoMessage.reply(StringBuilders.internalError());
      logger.error(err);
    });

    return null;
  }
}
import { Command, Client, CommandoMessage } from "discord.js-commando";
import { Message } from "discord.js";
import Validation from "../../utils/Validation";
import InputListener from "../objects/InputListener";
import fetchDbMember from "../objects/DBMember";
import StringBuilders from "../utils/StringBuilders";
import { logger } from "../../app";
import { config } from "../../utils/Config";

export default class SubmitDetails extends Command {
  constructor(client: Client) {
    super(client, {
      name: "submit-details",
      aliases: [],
      group: "main",
      memberName: "submit-details",
      description: "Submits details regarding your application.",
      userPermissions: [ config.permissions["submit-details"] ],
      guildOnly: true,
      throttling: { usages: 2, duration: 10 }
    });
  }

  run(commandoMessage: CommandoMessage) {

    new Promise(async () => {

      const guildMember = commandoMessage.member;

      const promptMessage = <Message> await commandoMessage.say("Loading...");

      const dbMember = await fetchDbMember(guildMember.id);
      if(!dbMember) return promptMessage.edit(StringBuilders.internalError());

      const stage = dbMember.applicationStatus.stage;
      if(stage !== 1 && stage !== 2) {
        let string = `${guildMember},\nYou can only submit details while your application is in progress.`;
        if(stage === 0) string += `\nTo start your application, use the command \`join\`.`;
        if(stage === 3) string += `\nIf any of your details have changed please contact an admin.`;
        return promptMessage.edit(string);
      }

      const inputListener = new InputListener(this.client, promptMessage, guildMember);

      inputListener.start(`${guildMember},\nPlease type out your in-game name exactly as it's written.`, async (listenerMessage?: Message) => {
      if(!listenerMessage) return promptMessage.edit("\`Cancelled\`");
      const error = Validation.inGameName(listenerMessage.content);
      if(error.length !== 0) return inputListener.start(`${guildMember},\n${error}`);
      dbMember.inGameName = listenerMessage.content;

        inputListener.start(`${guildMember},\nPlease type out your name on Inara.cz exactly as it's written.`, async (listenerMessage?: Message) => {
          if(!listenerMessage) return promptMessage.edit("\`Cancelled\`");
          const error = Validation.inaraName(listenerMessage.content);
          if(error.length !== 0) return inputListener.start(`${guildMember},\n${error}`);
          dbMember.inaraName = listenerMessage.content;

          const success = dbMember.edit(null, dbMember);
          if(!success) return promptMessage.edit(StringBuilders.internalError());
          let string = `${guildMember},\nYour details have been submitted. You will be notified as soon as your application has been reviewed.`;
          string += `\nTo review your application, simply use the command \`application-info\`.`;
          promptMessage.edit(string);

        });
      });
    }).catch((err: Error) => {
      commandoMessage.reply(StringBuilders.internalError());
      logger.error(err);
    });

    return null;
  }
}
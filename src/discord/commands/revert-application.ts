import { Command, Client, CommandoMessage } from "discord.js-commando";
import { Message } from "discord.js";
import InputListener from "../objects/InputListener";
import embedBuilders from "../utils/embedBuilders";
import fetchDbMember from "../objects/DbMember";
import StringBuilders from "../utils/StringBuilders";
import { logger } from "../../app";
import { config } from "../../utils/Config";

export default class RevertApplication extends Command {
  constructor(client: Client) {
    super(client, {
      name: "revert-application",
      aliases: [],
      group: "management",
      memberName: "revert-application",
      description: "Reverts a member's application.",
      userPermissions: [ config.permissions["revert-application"] ],
      guildOnly: true,
      throttling: { usages: 2, duration: 10 }
    });
  }

  run(commandoMessage: CommandoMessage) {

    new Promise(async () => {

      const guild = commandoMessage.guild;
      const guildMember = commandoMessage.member;
    
      const promptMessage = <Message> await commandoMessage.say("Loading...");
      const inputListener = new InputListener(this.client, promptMessage, guildMember);

      inputListener.start("@ the member whose application you would like to revert.", async (listenerMessage?: Message) => {
        if(!listenerMessage) return promptMessage.edit("\`Cancelled\`");

        const listenerMentions = listenerMessage.mentions.members;
        if(!listenerMentions) return inputListener.start("You must @ a member.");

        const listenerMention = listenerMentions.first();
        if(!listenerMention) return inputListener.start("You must @ a member.");

        const targetGuildMember = guild.members.resolve(listenerMention.id);
        if(!targetGuildMember) return inputListener.start(`${targetGuildMember} isn't in the server.`);

        const targetDbMember = await fetchDbMember(targetGuildMember.id);
        if(!targetDbMember) return promptMessage.edit(`${targetGuildMember} was not found in the database.\nTry using the \`check\` command to add them.`);

        if(targetDbMember.applicationStatus.stage === 0) return promptMessage.edit(`${targetGuildMember}'s application has not started.`);
        if(targetDbMember.applicationStatus.stage === 1) return promptMessage.edit(`${targetGuildMember}'s application has not been reviewed.`);
        if(targetDbMember.applicationStatus.stage === 2) return promptMessage.edit(`${targetGuildMember}'s application has not been completed.`);

        const success = targetDbMember.revertApplication(guildMember.id);
        if(!success) return promptMessage.edit(StringBuilders.internalError());

        let embed = embedBuilders.applicationInfo(targetGuildMember.user, targetDbMember);
        promptMessage.edit({ content: `${targetGuildMember}'s application has been reverted.`, embed });

      });
    }).catch((err: Error) => {
      commandoMessage.reply(StringBuilders.internalError());
      logger.error(err);
    });

    return null;
  }
}
import { Command, Client, CommandoMessage } from "discord.js-commando";
import { GuildMember, Message } from "discord.js";
import HTTPMembers, { DBMemberData } from "../../http_utils/HTTPMembers";
import InputListener from "../objects/InputListener";
import StringBuilders from "../utils/StringBuilders";
import { logger } from "../../app";
import { config } from "../../utils/Config";

export default class ForceStartAll extends Command {
  constructor(client: Client) {
    super(client, {
      name: "force-start-all",
      aliases: [],
      group: "management",
      memberName: "force-start-all",
      description: "Forcibly starts all previously unstarted applications.",
      userPermissions: [ config.permissions["force-start-all"] ],
      guildOnly: true,
      throttling: { usages: 2, duration: 10 }
    });
  }

  run(commandoMessage: CommandoMessage) {

    new Promise(async () => {

      const guild = commandoMessage.guild;
      const guildMember = commandoMessage.member;

      let string = "> Are you sure you want to force start all applications? (yes/no)";
      string += "\n> [WARNING] This will forcibly start all idle applications.";
      string += "\n> [WARNING] This command is generally reserved for usage when adding this bot to a server with pre-existing members.";

      const promptMessage = <Message> await commandoMessage.say("Loading...");
      const inputListener = new InputListener(this.client, promptMessage, guildMember);

      inputListener.start(string, async (listenerMessage?: Message) => {
        if(!listenerMessage) return promptMessage.edit("\`Cancelled\`");
        if(listenerMessage.content != "yes") return promptMessage.edit("\`Cancelled\`");

        await promptMessage.edit("Loading... [Querying database users]");
        const res = await HTTPMembers.query({});
        if(!res.success || !res.data) return promptMessage.edit("No members found in database.");
  
        const dbMembers = res.data.members;
        const guildMembers = guild.members.cache;

        let alteredGuildMembers: GuildMember[] = [];

        guildMembers.map((guildMember: GuildMember) => {
          let dbMember = dbMembers.find(((dbMember: DBMemberData) => dbMember.discordId === guildMember.id));
          if(dbMember && !guildMember.user.bot) {
            if(dbMember.applicationStatus.stage === 0) {
              dbMember.applicationStatus.stage = 1;
              alteredGuildMembers.push(guildMember);
              HTTPMembers.startApplication(dbMember._id);
            }
          }
        });

        promptMessage.edit(`Forcibly started ${alteredGuildMembers.length} applications.`);
      });
    }).catch((err: Error) => {
      commandoMessage.reply(StringBuilders.internalError());
      logger.error(err);
    });

    return null;
  }
}
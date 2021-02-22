import { Command, Client, CommandoMessage } from "discord.js-commando";
import { GuildMember, Message } from "discord.js";
import HTTPMembers, { DBMemberData } from "../../http_utils/HTTPMembers";
import InputListener from "../objects/InputListener";
import StringBuilders from "../utils/StringBuilders";
import { logger } from "../../app";
import { config } from "../../utils/Config";

export default class Join extends Command {
  constructor(client: Client) {
    super(client, {
      name: "check-all",
      aliases: [],
      group: "management",
      memberName: "check-all",
      description: "Adds any untracked members to the database.",
      userPermissions: [ config.permissions["check-all"] ],
      guildOnly: true,
      throttling: { usages: 2, duration: 10 }
    });
  }

  run(commandoMessage: CommandoMessage) {

    new Promise(async () => {

      const guild = commandoMessage.guild;
      const guildMember = commandoMessage.member;
      if(guildMember == null) return null;

      let string = "> Are you sure you want to check all applications? (yes/no)";
      string += "\n> [WARNING] This will add any untracked members to the database.";
      string += "\n> [WARNING] This command is generally reserved for usage when adding this bot to a server with pre-existing members.";

      const promptMessage = <Message> await commandoMessage.say("Loading...");
      const inputListener = new InputListener(this.client, promptMessage, guildMember);

      inputListener.start(string, async (listenerMessage?: Message) => {
        if(!listenerMessage) return promptMessage.edit("\`Cancelled\`");
        if(listenerMessage.content != "yes") return promptMessage.edit("\`Cancelled\`");

        await promptMessage.edit("> Loading... [Querying database users]");

        await promptMessage.edit("Loading... [Querying database users]");
        const res = await HTTPMembers.query({});
        if(!res.data) return promptMessage.edit("No members found in database.");

        const dbMembers = res.data.members;
        const guildMembers = await guild.members.fetch();

        let addedGuildMembers: GuildMember[] = [];

        guildMembers.map((guildMember: GuildMember) => {
          const dbMember = dbMembers.find(((dbMember: DBMemberData) => dbMember.discordId === guildMember.id));
          if(!dbMember && !guildMember.user.bot) {
            addedGuildMembers.push(guildMember);
            HTTPMembers.create({ discordId: guildMember.id })
          }
        });

        promptMessage.edit(`Added ${addedGuildMembers.length} members to the database.`);
        
      });

    }).catch((err: Error) => {
      commandoMessage.reply(StringBuilders.internalError());
      logger.error(err);
    });

    return null;
  }
}
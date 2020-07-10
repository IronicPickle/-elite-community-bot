import { CommandoClient } from "discord.js-commando";
import { GuildMember, Role } from "discord.js";
import HTTPMembers from "../http_utils/HTTPMembers";
import discord from "../utils/discord";
import fetchDbMember from "./objects/DBMember";
import StringBuilder from "./utils/StringBuilders";
import { logger } from "../app";

export default abstract class EventHandler {
  static registerAll(client: CommandoClient) {
    GuildMemberAdd.register(client);
  }
}

export abstract class GuildMemberAdd {
  static register(client: CommandoClient) {
    client.on("guildMemberAdd", async (guildMember: GuildMember) => {
      logger.debug(`[Discord] Event: guildMemberAdd`);
      const res = await HTTPMembers.create({ discordId: guildMember.id });
      if(res.success) {
        discord.log(`\`🚪 ${guildMember.displayName} has just joined the server for the first time.\``);
        guildMember.send(StringBuilder.welcomeFirstTime(guildMember));
      } else {
        const dbMember = await fetchDbMember(guildMember.id);
        if(!dbMember) return;
        discord.log(`\`🚪 ${guildMember.displayName} has just re-joined the server.\``);
        guildMember.send(StringBuilder.welcomeBack(guildMember, dbMember));
      }
    });

    client.on("guildMemberRemove", async (guildMember: GuildMember) => {
      logger.debug(`[Discord] Event: guildMemberRemove`);
      discord.log(`\`🏃 ${guildMember.displayName} has just left the server.\``);
    });

    client.on("guildMemberUpdate", async (oldGuildMember: GuildMember, guildMember: GuildMember) => {
      logger.debug(`[Discord] Event: guildMemberUpdate`);
      const dbMember = await fetchDbMember(guildMember.id);
      if(!dbMember) return;
      dbMember.update();
    });

    client.on("roleUpdate", (oleRole: Role, role: Role) => {
      logger.debug(`[Discord] Event: roleUpdate`);
      this.updateDbMembers(role);
    });
  }

  private static updateDbMembers(role: Role) {
    const guildMembers = role.guild.members.cache;
    guildMembers.forEach(async (guildMember: GuildMember) => {
      const dbMember = await fetchDbMember(guildMember.id);
      if(!dbMember) return;

      for(const i in dbMember.discordRoles) {
        const dbMemberRole = dbMember.discordRoles[i];
        if(dbMemberRole.id === role.id) {
          dbMember.update();
        }
      }
    });
  }
}
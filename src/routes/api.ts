import express, { Request, Response, NextFunction } from "express";
import wrap from "../utils/wrap";
import StringBuilders from "../discord/utils/StringBuilders";
import discord from "../utils/discord";
import { GuildMember } from "discord.js";
import EmbedBuilders from "../discord/utils/EmbedBuilders";
import HTTPBGS, { FactionData } from "../http_utils/HTTPBGS";
import authenticator from "../utils/authenticator";
import { config } from "../utils/Config";
import { logger } from "../app";

const router = express.Router();

router.get("/members/query", authenticator, wrap(async (req: Request, res: Response, next: NextFunction) => {

  const discordId = <string> req.query.discordId;

  let success = true;
  let msg = "Query successful";

  let richMembers: GuildMember[] = [];
  if(discordId) {
    const singleMember = discord.getMember(discordId.toString());
    if(singleMember) richMembers.push(singleMember);
  } else {
    const allMembers = discord.getMembers();
    if(allMembers) richMembers = allMembers;
  }

  let members: any[] = [];

  for(const i in richMembers) {
    members[i] = JSON.parse(JSON.stringify(richMembers[i]));
    members[i].perms = JSON.parse(JSON.stringify(richMembers[i].permissions.toArray()));
    members[i].roles = JSON.parse(JSON.stringify(richMembers[i].roles.cache));
    members[i].avatar = richMembers[i].user.avatarURL();
  }

  if(members.length === 0) {
    success = false; msg = "No data matched query";
  }

  res.status((success) ? 200 : 400).send({ success, msg, data: { members } });

}));

router.get("/members/queryStats", authenticator, wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed

  let totalDiscordMembers = 0;
  let totalDiscordBots = 0;
  
  const members = discord.getMembers();
  if(members) {
    for(const i in members) {
      if(!members[i].user.bot) {
        totalDiscordMembers += 1;
      } else {
        totalDiscordBots += 1;
      }
    }
  }

  const data = { totalDiscordMembers, totalDiscordBots }

  res.status(200).send({ success: true, msg: "Query successful", data });

}));

export interface FactionsData {
  id: number;
  name: string;
  controllingFaction: FactionData;
  factions: FactionData[];
  factionId: number;
}

router.post("/missions/broadcast", authenticator, wrap(async (req: Request, res: Response, next: NextFunction) => {

  const authorDiscordId = <string> req.body.authorDiscordId;
  const factionsData = <FactionsData> req.body.factionsData;
  const inputs = <{description: string, objectives: string[]}> req.body.inputs;
  const { description, objectives } = inputs;

  let success = true;
  let msg = "Application start complete";

  const guild = discord.getGuild();
  if(guild) {
    const authorMember = discord.getMember(authorDiscordId);
    if(authorMember) {
      discord.bgsBroadcast(EmbedBuilders.bgsBroadcast(description, objectives, factionsData, authorMember));
    } else {
      success = false; msg = "Couldn't find author in guild";
    }
  } else {
    success = false; msg = "Couldn't find guild";
  }

  res.status((success) ? 200 : 400).send({ success, msg });

}));

router.get("/bgs/query", authenticator, wrap(async (req: Request, res: Response, next: NextFunction) => {

  let success = true;
  let msg = "BGS query successful";
  let factionsData = {};

  const homeSystemId = config.bgs.homeSystemId;
  const factionId = config.bgs.factionId;

  if(homeSystemId && factionId) {
    const resp = await HTTPBGS.queryFactionsBySystemId(homeSystemId);
  if(!resp.success || !resp.data) {
    success = false; msg = resp.msg;
  } else {
    factionsData = { ...resp.data.factionData, factionId };
  }
  } else {
    success = false; msg = "No BGS faction configured";
  }

  res.status((success) ? 200 : 400).send({ success, msg, data: { factionsData } });

}));

router.post("/notify/revisionRequest", authenticator, wrap(async (req: Request, res: Response, next: NextFunction) => {

  const discordId = <string> req.body.discordId;
  const authorDiscordId = <string> req.body.authorDiscordId;
  const inputs = <{message: string}> req.body.inputs;
  const { message } = inputs;

  let success = true;
  let msg = "Revision request message sent";

  const member = discord.getMember(discordId);
  if(member) {
    const authorMember = discord.getMember(authorDiscordId);
    if(authorMember) {
      member.send(StringBuilders.revisionRequest(message, authorMember));
      discord.log(`\`⏰ Revision Request sent to ${member.displayName} by ${authorMember.displayName}.\``);
    } else {
      success = false; msg = "Couldn't find author in guild";
    }
  } else {
    success = false; msg = "Couldn't find member in guild";
  }

  res.status((success) ? 200 : 400).send({ success, msg });

}));

router.post("/notify/applicationStart", authenticator, wrap(async (req: Request, res: Response, next: NextFunction) => {

  const discordId = <string> req.body.discordId;

  let success = true;
  let msg = "Application start complete";

  const guild = discord.getGuild();
  if(guild) {
    const member = discord.getMember(discordId);
    if(member) {
      const applicationRoleId = config.application.roleId;
      if(applicationRoleId) {
        const role = guild.roles.cache.get(applicationRoleId);
        if(role) {
          member.roles.add(role);
          member.send(StringBuilders.applicationStart(member));
          discord.log(`\`📝 ${member.displayName} just started their application.\``);
        } else {
          success = false; msg = "Couldn't find application role";
        }
      } else {
        success = false; msg = "No application role ID configured";
      }
    } else {
      success = false; msg = "Couldn't find member in guild";
    }
  } else {
    success = false; msg = "Couldn't find guild";
  }

  res.status((success) ? 200 : 400).send({ success, msg });

}));

router.post("/notify/applicationWarning", authenticator, wrap(async (req: Request, res: Response, next: NextFunction) => {

  const discordId = <string> req.body.discordId;
  const startDate = <Date> req.body.startDate;

  let success = true;
  let msg = "Warning message sent";

  const member = discord.getMember(discordId);
  if(member) {
    member.send(StringBuilders.applicationWarning(startDate));
    discord.log(`\`⚠️ ${member.displayName} has been sent an application timeout warning.\``);
  } else {
    success = false; msg = "Couldn't find member in guild";
  }

  res.status((success) ? 200 : 400).send({ success, msg });

}));

router.post("/notify/applicationReset", authenticator, wrap(async (req: Request, res: Response, next: NextFunction) => {

  const discordId = <string> req.body.discordId;
  const startDate = <Date> req.body.startDate;

  let success = true;
  let msg = "Reset completed";

  const guild = discord.getGuild();
  if(guild) {
    const member = discord.getMember(discordId);
    if(member) {
      const applicationRoleId = config.application.roleId;
      if(applicationRoleId) {
      const role = guild.roles.cache.get(applicationRoleId);
        if(role) {
          member.roles.remove(role);
          member.send(StringBuilders.applicationReset(startDate));
          discord.log(`\`⏳ ${member.displayName}'s application has been reset.\``);
        } else {
          success = false; msg = "Couldn't find application role";
        }
      } else {
        success = false; msg = "No application role ID configured";
      }
    } else {
      success = false; msg = "Couldn't find member in guild";
    }
  } else {
    success = false; msg = "Couldn't find guild";
  }

  res.status((success) ? 200 : 400).send({ success, msg });

}));

router.post("/notify/applicationComplete", authenticator, wrap(async (req: Request, res: Response, next: NextFunction) => {

  const discordId = <string> req.body.discordId;
  const authorDiscordId = <string> req.body.authorDiscordId;

  let success = true;
  let msg = "Completion message sent";

  const member = discord.getMember(discordId);
  if(member) {
    const authorMember = discord.getMember(authorDiscordId);
    if(authorMember) {
      member.send("> ✅ **Application Complete**\n\n Congratulations, your application has been reviewed and is complete.");
      discord.log(`\`✅ ${member.displayName}'s application has been finalised by ${authorMember.displayName}.\``);
    } else {
      success = false; msg = "Couldn't find author in guild";
    }
  } else {
    success = false; msg = "Couldn't find member in guild";
  }

  res.status((success) ? 200 : 400).send({ success, msg });

}));

router.post("/notify/applicationRevert", authenticator, wrap(async (req: Request, res: Response, next: NextFunction) => {

  const discordId = <string> req.body.discordId;
  const authorDiscordId = <string> req.body.authorDiscordId;

  let success = true;
  let msg = "Completion message sent";

  const member = discord.getMember(discordId);
  if(member) {
    const authorMember = discord.getMember(authorDiscordId);
    if(authorMember) {
      member.send("> ❌ **Application Reverted**\n\n Your application has been reverted.\nIf you don't know why this happend, contact an admin.");
      discord.log(`\`❌ ${member.displayName}'s application has been reverted by ${authorMember.displayName}.\``);
    } else {
      success = false; msg = "Couldn't find author in guild";
    }
  } else {
    success = false; msg = "Couldn't find member in guild";
  }

  res.status((success) ? 200 : 400).send({ success, msg });

}));

export default router;
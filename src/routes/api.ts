import express, { Request, Response, NextFunction } from "express";
import wrap from "../utils/wrap";
import discord from "../utils/discord";
import { GuildMember } from "discord.js";
import authenticator from "../utils/authenticator";

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

export default router;
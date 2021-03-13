import express, { Request, Response, NextFunction } from "express";
import http from "http";
import wrap from "../utils/wrap";
import DiscordUtils from "../utils/DiscordUtils";
import { GuildMember, Message } from "discord.js";
import authenticator from "../utils/authenticator";
import { DBMemberData } from "../http_utils/HTTPMembers";
import EmbedBuilders from "../discord/utils/EmbedBuilders";

export default (httpInstance: http.Server) => {
  const router = express.Router();

  router.get("/members/query", authenticator, wrap(async (req: Request, res: Response, next: NextFunction) => {

    const discordId = <string> req.query.discordId;

    let success = true;
    let msg = "Query successful";

    let richMembers: GuildMember[] = [];
    if(discordId) {
      const singleMember = await DiscordUtils.getMember(discordId.toString());
      if(singleMember) richMembers.push(singleMember);
    } else {
      const allMembers = DiscordUtils.getMembers();
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
    
    const members = DiscordUtils.getMembers();
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
  

  router.post("/servers/create", authenticator, wrap(async (req: Request, res: Response, next: NextFunction) => {

    const inputs = <DBServer> req.body.inputs;
    const { name } = inputs;
  
    let success = true;
    let msg = "Server channel created";

    let serverMessage: Message | undefined = undefined;
  
    const serverChannel = await DiscordUtils.serverCreateChannel(name);
    if(serverChannel == null) {
      success = false; msg = "Couldn't create channel";
    } else {
      serverMessage = await DiscordUtils.serverCreateMessage(serverChannel.id, EmbedBuilders.serverMessage(inputs));
      await serverMessage?.pin();
      if(serverMessage == null) {
        success = false; msg = "Couldn't create message";
      }
    }
  
    res.status((success) ? 200 : 400).send({ success, msg, data: { channelId: serverChannel?.id, messageId: serverMessage?.id  } });
  
  }));

  router.patch("/servers/edit", authenticator, wrap(async (req: Request, res: Response, next: NextFunction) => {

    const inputs = <DBServer> req.body.inputs;
    const { channelId, name } = inputs;
  
    let success = true;
    let msg = "Server channel updated";
  
    const serverChannel = await DiscordUtils.serverEditChannel(channelId || "", name);
    if(serverChannel == null) {
      success = false; msg = "Couldn't update channel";
    } else if(inputs.messageId != null) {
      const serverMessage = await DiscordUtils.serverEditMessage(
        serverChannel.id, inputs.messageId, EmbedBuilders.serverMessage(inputs)
      );
      if(serverMessage == null) {
        success = false; msg = "Couldn't update message";
      }
    }
  
    res.status((success) ? 200 : 400).send({ success, msg });
  
  }));

  router.delete("/servers/delete", authenticator, wrap(async (req: Request, res: Response, next: NextFunction) => {

    const inputs = <{ channelId?: string; }> req.query;
    const { channelId } = inputs;
  
    let success = true;
    let msg = "Server channel deleted";
  
    const serverChannel = await DiscordUtils.serverDeleteChannel(channelId || "");
    if(serverChannel == null) {
      success = false; msg = "Couldn't delete channel";
    }
  
    res.status((success) ? 200 : 400).send({ success, msg });
  
  }));
  
  router.post("/servers/createPost", authenticator, wrap(async (req: Request, res: Response, next: NextFunction) => {

    const inputs = <DBServerPost> req.body.inputs;
    const { channelId, authorDiscordId } = inputs;
  
    let messageId: string | null = null;

    let success = true;
    let msg = "Server Post broadcast complete";
  
    const guild = DiscordUtils.getGuild();
    if(guild != null) {
      const authorMember = await DiscordUtils.getMember(authorDiscordId);
      if(authorMember != null) {
        const message = await DiscordUtils.serverPostCreate(channelId, EmbedBuilders.serverPost(authorMember, <DBServerPost> inputs));
        if(message == null) {
          success = false; msg = "Couldn't create post";
        }
        messageId = message?.id || null;
      } else {
        success = false; msg = "Couldn't find author in guild";
      }
    } else {
      success = false; msg = "Couldn't find guild";
    }
  
    res.status((success) ? 200 : 400).send({ success, msg, data: { messageId } });
  
  }));

  router.post("/newsPosts/create", authenticator, wrap(async (req: Request, res: Response, next: NextFunction) => {

    const inputs = <DBNewsPost> req.body.inputs;
    const { authorDiscordId } = inputs;

    let messageId: string | null = null;
  
    let success = true;
    let msg = "News Post created";
  
    const guild = DiscordUtils.getGuild();
    if(guild != null) {
      const authorMember = await DiscordUtils.getMember(authorDiscordId);
      if(authorMember != null) {
        const message = await DiscordUtils.newsPostCreate(EmbedBuilders.newsPost(authorMember, <DBNewsPost> inputs));
        if(message == null) {
          success = false; msg = "Couldn't edit post";
        }
        messageId = message?.id || null;
      } else {
        success = false; msg = "Couldn't find author in guild";
      }
    } else {
      success = false; msg = "Couldn't find guild";
    }
  
    res.status((success) ? 200 : 400).send({ success, msg, data: { messageId } });
  
  }));

  router.patch("/newsPosts/edit", authenticator, wrap(async (req: Request, res: Response, next: NextFunction) => {

    const inputs = <DBNewsPost> req.body.inputs;
    const { authorDiscordId, messageId } = inputs;
  
    let success = true;
    let msg = "News Post edited";
  
    const guild = DiscordUtils.getGuild();
    if(guild != null) {
      const authorMember = await DiscordUtils.getMember(authorDiscordId);
      if(authorMember != null) {
        const message = await DiscordUtils.newsPostEdit(messageId || "", EmbedBuilders.newsPost(authorMember, <DBNewsPost> inputs));
        if(message == null) {
          success = false; msg = "Couldn't edit post";
        }
      } else {
        success = false; msg = "Couldn't find author in guild";
      }
    } else {
      success = false; msg = "Couldn't find guild";
    }
  
    res.status((success) ? 200 : 400).send({ success, msg });
  
  }));

  router.delete("/newsPosts/delete", authenticator, wrap(async (req: Request, res: Response, next: NextFunction) => {

    const inputs = <{ messageId?: string; }> req.query;
    const { messageId } = inputs;
  
    let success = true;
    let msg = "News Post edited";
  
    const message = await DiscordUtils.newsPostDelete(messageId || "");
    if(message == null) {
      success = false; msg = "Couldn't delete post";
    }
  
    res.status((success) ? 200 : 400).send({ success, msg });
  
  }));


  return router;

}

export interface DBNewsPost {
  [key: string]: any;
  _id: string;
  authorDiscordId: string;
  messageId?: string;
  author?: DBMemberData;
  title: string;
  body: string;
  datePosted: string;
}

export const serverTypes: { type: ServerType, name: string }[] = [
  { type: "minecraft", name: "Minecraft" },
  { type: "arma3", name: "Arma III" },
  { type: "valheim", name: "Valheim" },
]

export type ServerType = "minecraft" | "arma3" | "valheim";

export interface DBServer {
  [key: string]: any;
  _id: string;
  channelId?: string;
  messageId?: string;
  type: ServerType;
  name: string;
  description: string;
  address: string;
  port: string;
  dateCreated: string;
}

export interface DBServerPost {
  [key: string]: any;
  _id: string;
  authorId: string;
  authorDiscordId: string;
  messageId?: string;
  title: string;
  body: string;
  datePosted: string;
}
import { Guild, GuildMember, TextChannel, MessageEmbed } from "discord.js";
import { CommandoClient } from "discord.js-commando";
import { discordBot } from "../app";
import { config } from "./Config";

export default {
  getGuild, getMember, getMembers, getChannel, log, bgsBroadcast
}


function getGuild(): Guild | void {

  if(!config.guildId) return;
  const client = discordBot.client;
  const guild = client.guilds.cache.get(config.guildId);
  return guild;

}

function getMember(discordId: string): GuildMember | null {

  const guild = getGuild();
  if(!guild) return null;
  const member = guild.members.resolve(discordId)
  return member;

}

function getMembers(): GuildMember[] | void {

  const guild = getGuild();
  if(!guild) return;
  const members = guild.members.cache;
  return members.array();

}

function getChannel(channelId: string): TextChannel | null {

  const guild = getGuild();
  if(!guild) return null;
  const channel = <TextChannel | null> guild.channels.resolve(channelId)
  return channel;

}

function log(content: string) {

  if(!config.logChannelId) return;
  const logChannel = getChannel(config.logChannelId);
  if(logChannel) logChannel.send(content);

}

function bgsBroadcast(content: MessageEmbed) {

  if(!config.bgsChannelId) return;
  const bgsChannel = getChannel(config.bgsChannelId);
  if(bgsChannel) bgsChannel.send(content);

}
import { CategoryChannel, Guild, GuildChannel, GuildMember, MessageEmbed, TextChannel } from "discord.js";
import { discordBot } from "../app";
import { config } from "./Config";

export default class DiscordUtils {

  static getGuild(): Guild | void {

    if(!config.guildId) return;
    const client = discordBot.client;
    const guild = client.guilds.cache.get(config.guildId);
    return guild;

  }

  static async getMember(discordId: string): Promise<GuildMember | null> {

    const guild = this.getGuild();
    if(!guild) return null;
    const member = await guild.members.fetch(discordId)
    return member;

  }

  static getMembers() {

    const guild = this.getGuild();
    if(!guild) return;
    const members = guild.members.cache;
    return members.array();

  }

  static getChannel(channelId: string) {

    const guild = this.getGuild();
    if(!guild) return null;
    const channel = <TextChannel | null> guild.channels.resolve(channelId)
    if(channel?.type !== "text") return;
    return channel;

  }

  static getCategory(channelId: string) {

    const guild = this.getGuild();
    if(!guild) return null;
    const channel = <CategoryChannel | null> guild.channels.resolve(channelId)
    if(channel?.type !== "category") return;
    return channel;

  }

  static async getMessage(channelId: string, messageId: string) {

    const guild = this.getGuild();
    if(!guild) return null;
    const channel = <TextChannel | null> guild.channels.resolve(channelId)
    if(channel?.type !== "text") return;
    const message = await channel.messages.fetch(messageId);
    if(message == null) return;
    return message;

  }

  static log(content: string) {

    if(!config.logChannelId) return;
    const logChannel = this.getChannel(config.logChannelId);
    if(logChannel) logChannel.send(content);

  }

  static async newsPostCreate(content: MessageEmbed) {

    if(config.newsChannelId == null) return;
    const newsChannel = this.getChannel(config.newsChannelId);
    if(newsChannel == null) return;
    return newsChannel.send(content);

  }

  static async newsPostEdit(messageId: string, content: MessageEmbed) {

    if(config.newsChannelId == null) return;
    const newsChannel = this.getChannel(config.newsChannelId);
    if(newsChannel == null) return;
    const message = await newsChannel.messages.fetch(messageId);
    if(message == null) return;

    message.edit(content);


  }

  static async newsPostDelete(messageId: string) {

    if(config.newsChannelId == null) return;
    const newsChannel = this.getChannel(config.newsChannelId);
    if(newsChannel == null) return;
    const message = await newsChannel.messages.fetch(messageId);
    if(message == null) return;
    message.delete();

  }

  static async serverCreateChannel(name: string) {

    if(config.serverCategoryId == null) return;
    const serverCategory = this.getCategory(config.serverCategoryId);
    if(serverCategory == null) return;

    const guild = this.getGuild();
    if(guild == null) return;
    return await guild.channels.create(name, { type: "text", parent: serverCategory });

  }

  static async serverEditChannel(channelId: string, name: string) {

    const serverChannel = this.getChannel(channelId);
    if(serverChannel == null) return;

    return await serverChannel.edit({ name });

  }

  static async serverDeleteChannel(channelId: string) {

    const serverChannel = this.getChannel(channelId);
    if(serverChannel == null) return;

    return await serverChannel.delete();

  }

  static async serverCreateMessage(channelId: string, content: MessageEmbed) {

    const serverChannel = this.getChannel(channelId);
    if(serverChannel == null) return;

    return await serverChannel.send(content);

  }

  static async serverEditMessage(channelId: string, messageId: string, content: MessageEmbed) {

    const serverMessage = await this.getMessage(channelId, messageId);
    if(serverMessage == null) return;

    return await serverMessage.edit(content);

  }

  static async serverDeleteMessage(channelId: string, messageId: string) {

    const serverMessage = await this.getMessage(channelId, messageId);
    if(serverMessage == null) return;

    return await serverMessage.delete();

  }

  static async serverPostCreate(channelId: string, content: MessageEmbed) {

    if(channelId == null) return;
    const serverPostChannel = this.getChannel(channelId);
    if(serverPostChannel == null) return;
    return serverPostChannel.send(content);

  }

}
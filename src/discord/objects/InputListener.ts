import { User, Message, MessageReaction, PartialUser, TextChannel, GuildMember } from "discord.js";
import { CommandoClient } from "discord.js-commando";

const inputListeners: InputListener[] = [];

export default class InputListener {
  private client: CommandoClient;
  private channel: TextChannel;
  private promptMessage: Message;
  private guildMember: GuildMember;

  private message?: Message;
  private timeoutId!: NodeJS.Timeout;

  private callback?: (message?: Message) => any;

  constructor(client: CommandoClient, promptMessage: Message, guildMember: GuildMember) {
    this.client = client;
    this.channel = <TextChannel> promptMessage.channel;
    this.promptMessage = promptMessage;
    this.guildMember = guildMember;

    this.onMessage = this.onMessage.bind(this);
    this.onMessageReactionAdd = this.onMessageReactionAdd.bind(this);
  }

  public start(content: string, callback?: (message?: Message) => any) {

    new Promise(async () => {

      const preExistingListener = inputListeners.find((listener: InputListener) => listener.guildMember.id === this.guildMember.id)
      if(preExistingListener) return this.promptMessage.edit(`${this.guildMember}\n> **You can only run one command at once!**`);
      inputListeners.push(this);

      if(callback) this.callback = callback;

      this.message = undefined;
      this.startListener("message");
      this.startListener("messageReactionAdd");

      await this.promptMessage.react("❌");
      content += "\n`❌ - Cancel`";
      await this.promptMessage.edit(content);

      this.timeout();

    }).catch((err: Error) => {
      this.channel.send(`\n${err}`);
      console.log(err);
    });
  }

  private startListener(name: string) {
    switch(name){
      case "message":
        this.client.once("message", this.onMessage);
        break;
      case "messageReactionAdd":
        this.client.once("messageReactionAdd", this.onMessageReactionAdd);
        break;
        
    }
  }

  onMessage(message: Message) {

    if(message.author.id === this.guildMember.id && message.channel.id === this.channel.id) {
      this.client.removeListener("messageReactionAdd", this.onMessageReactionAdd);
      this.message = message;
      message.delete();
      this.destroy();
      clearTimeout(this.timeoutId);
    } else {
      this.startListener("message");
    }

  }

  onMessageReactionAdd(reaction: MessageReaction, user: User | PartialUser) {

    if(user.id === this.guildMember.id && reaction.message.id === this.promptMessage.id && reaction.emoji.name === "❌") {
      this.client.removeListener("message", this.onMessage);
      this.destroy();
      clearTimeout(this.timeoutId);
    } else {
      this.startListener("messageReactionAdd");
    }

  }

  timeout() {

    this.timeoutId = setTimeout(() => {
      this.destroy();
    }, 2 * 60 * 1000);

  }

  async destroy() {

    new Promise(async () => {

      for(const i in inputListeners) {
        const listener = inputListeners[i];
        if(listener.guildMember.id === this.guildMember.id) inputListeners.splice(parseInt(i), 1);
      }

      await this.promptMessage.reactions.resolve("❌")?.remove();
      if(this.callback) this.callback(this.message);

    }).catch((err: Error) => {
      this.channel.send(`\n${err}`);
      console.log(err);
    });

  }

}
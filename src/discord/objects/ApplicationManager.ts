import { Client, CommandoClient } from "discord.js-commando";
import { TextChannel, Message, GuildMember, Guild, User, MessageReaction, PartialUser, MessageEmbed } from "discord.js";
import HTTPMembers from "../../http_utils/HTTPMembers";
import InputListener from "./InputListener";
import Validation from "../../utils/Validation";
import EmbedBuilders from "../utils/EmbedBuilders";
import StringBuilders from "../utils/StringBuilders";
import { config } from "../../utils/Config";

export default class ApplicationManager {

  private client: CommandoClient;
  private guildMember: GuildMember;
  private guild: Guild;
  private stage: 0 | 1 | 2 | 3;
  private index: number;
  private state!: "loading" | "selecting" | "displaying" | "revision" | "editing";
  private isDestroyed: boolean;
  private awaitingInput: boolean;

  private data!: { [key: string]: any };
  private message!: Message;
  private timeoutId?: NodeJS.Timeout;
  

  constructor(client: Client, guildMember: GuildMember, channel: TextChannel) {

    this.client = client;
    this.guildMember = guildMember;
    this.guild = channel.guild;
    this.stage = 0;
    this.index = 0;
    this.isDestroyed = false;
    this.awaitingInput = false;

    channel.send("Loading...").then((message: Message) => {
      this.message = message;
      this.shipSelector();
      
      this.startListener("messageReactionAdd");
    });

    this.resetTimeout();

  }

  async shipSelector(): Promise<void> {

    new Promise(async () => {

      this.state = "loading";
      
      await this.message.edit({
        content: "> Loading... [Removing Buttons]",
        embed: null  
      });
      await this.message.reactions.removeAll();
      await this.message.edit("> Loading... [Generating Buttons]");
      await this.message.react("1️⃣");
      await this.message.react("2️⃣");
      await this.message.react("3️⃣");
      await this.message.react("4️⃣");

      await this.message.edit(this.buildSelector());

      this.state = "selecting";

    }).catch((err: Error) => {
      this.message.reply(`\n${err}`);
      console.log(err);
    });

  }

  buildSelector(): string {
    let string = "> **Please Choose an Option**";
  
    string += "\n\n> 1️⃣ - Applications that have not started";
    string += "\n> 2️⃣ - Applications that are in progress";
    string += "\n> 3️⃣ - Applications that have been reviewed";
    string += "\n> 4️⃣ - Applications that have been completed";

    return string;
  }

  async shipData(): Promise<void> {

    new Promise(async () => {

      this.state = "loading";

      await this.message.edit("> Loading... [Removing Buttons]");
      await this.message.reactions.removeAll();
      await this.message.edit("> Loading... [Generating Buttons]");
      await this.message.react("⏮️");
      await this.message.react("⬅️");
      await this.message.react("➡️");
      if(this.stage !== 3) await this.message.react("✏️");
      if(this.stage === 1 || this.stage === 2) await this.message.react("⏰");
      if(this.stage === 2) await this.message.react("✅");
      if(this.stage === 3) await this.message.react("❌");
      await this.message.edit("> Loading... [Querying]");
      const res = await this.query();
      if(res.data) {
        this.index = 0;
        this.data = res.data;
        await this.message.edit(this.buildData(0));
      } else {
        await this.message.edit(`> **${res.msg}**`);
      }
      this.state = "displaying";

    }).catch((err: Error) => {
      this.message.reply(`\n${err}`);
      console.log(err);
    });
  }

  buildData(index: number): { embed: MessageEmbed, content: string } {

    const stages = ["Not Started", "In Progress", "Rewviewed", "Completed"];
    let embed = new MessageEmbed();
    let content = "";
    
    const members: any = this.data.members;
    if(!members[index]) {
      content += "> **No Data Available**\n";
    } else {
      const guildMember = this.guild.members.resolve(members[index].discordId);
      embed = EmbedBuilders.applicationInfo((guildMember) ? guildMember.user : null, members[index]);
    }

    content += `\n> **Showing \`${stages[this.stage]}\` Applications**`;
    content += `\n> **Entry: \`${this.index + 1}\`/\`${this.data.count}\`**`;

    let footer = "⏮️ - Back | ⬅️ - Previous | ➡️ - Next";

    if(this.stage !== 3) footer += "\n✏️ - Edit";
    if(this.stage === 1 || this.stage === 2) footer += " | ⏰ - Request Revision";
    if(this.stage === 2) footer += " | ✅ - Complete Application";
    if(this.stage === 3) footer += "\n❌ - Revert Application";

    embed.setFooter(footer);

    return { embed, content: content };

  }

  async query() {
    return await HTTPMembers.query({ stage: this.stage });
  }

  async next() {

    if((this.index + 1) >= this.data.members.length) return;
    this.index += 1;
    await this.message.edit(this.buildData(this.index));

  }

  async prev() {

    if((this.index - 1) < 0) return;
    this.index -= 1;
    await this.message.edit(this.buildData(this.index));

  }

  async complete() {

    new Promise(async () => {

      const res = await HTTPMembers.completeApplication(this.data.members[this.index]._id, this.guildMember.id);
      if(res.success) {
        const res = await this.query();
        if(res.data) {
          this.data = res.data;
          if(this.index !== 0) this.index -= 1;
          await this.message.edit(this.buildData(this.index));
        } else {
          let messageData = this.buildData(this.index);
          messageData.content += `\n\n> **${res.msg}**`;
          await this.message.edit(messageData);
        }
      } else {
        let messageData = this.buildData(this.index);
        messageData.content += `\n\n> **${res.msg}**`;
        await this.message.edit(messageData);
      }

    }).catch((err: Error) => {
      this.message.reply(`\n${err}`);
      console.log(err);
    });

  }

  async revert(): Promise<void> {

    new Promise(async () => {

      const res = await HTTPMembers.revertApplication(this.data.members[this.index]._id, this.guildMember.id);
      if(res.success) {
        const res = await this.query();
        if(res.data) {
          this.data = res.data;
          if(this.index !== 0) this.index -= 1;
          await this.message.edit(this.buildData(this.index));
        } else {
          let messageData = this.buildData(this.index);
          messageData.content += `\n\n> **${res.msg}**`;
          await this.message.edit(messageData);
        }
      } else {
        let messageData = this.buildData(this.index);
        messageData.content += `\n\n> **${res.msg}**`;
        await this.message.edit(messageData);
      }
    }).catch((err: Error) => {
      this.message.reply(`\n${err}`);
      console.log(err);
    });

  }

  request(): void {

    new Promise(async () => {

      this.state = "revision";
      this.awaitingInput = true;

      const promptMessage = <Message> await this.message.channel.send("Loading...");
      const inputListener = new InputListener(this.client, promptMessage, this.guildMember);

      inputListener.start("Type out a message to be sent with the revision request.", async (listenerMessage?: Message) => {
        if(!listenerMessage) {
          let messageData = this.buildData(this.index);
          messageData.content += "\n\nRevision request cancelled.";
          this.message.edit(messageData);

          this.state = "displaying";
          this.awaitingInput = false;
          return promptMessage.delete();
        }

        const message = listenerMessage.content
        const error = Validation.message(message);
        if(error.length !== 0) return inputListener.start(error);

        const res1 = await HTTPMembers.createRevisionRequest(this.data.members[this.index]._id, this.guildMember.id, { message });
        if(!res1.success) return promptMessage.edit(StringBuilders.internalError());
        const res2 = await this.query();
        if(!res2.success || !res2.data) return promptMessage.edit(StringBuilders.internalError())

        this.data = res2.data;

        let messageData = this.buildData(this.index);
        messageData.content += "\n\nRevision request sent.";
        this.message.edit(messageData);

        this.state = "displaying";
        this.awaitingInput = false;
        promptMessage.delete();

      });
    }).catch((err: Error) => {
      this.message.reply(StringBuilders.internalError());
      console.log(err);
    });

  }

  edit(): void {

    new Promise(async () => {

      this.state = "editing";
      this.awaitingInput = true;

      const boolConversion: { [key: string]: any } = { yes: true, no: false }

      const promptMessage = <Message> await this.message.channel.send("Loading...");
      const inputListener = new InputListener(this.client, promptMessage, this.guildMember);

      inputListener.start("Type out a new 'In-Game Name'.\n\`Cancel to skip\`", async (listenerMessage?: Message) => {
        if(listenerMessage) {
          const error = Validation.inGameName(listenerMessage.content);
          if(error.length !== 0) return inputListener.start(`${error}\n\`Cancel to skip\``);
          this.data.members[this.index].inGameName = listenerMessage.content;
        }
        inputListener.start("Type out a new 'Inara Name'.\n\`Cancel to skip\`", async (listenerMessage?: Message) => {
          if(listenerMessage) {
            const error = Validation.inaraName(listenerMessage.content);
            if(error.length !== 0) return inputListener.start(`${error}\n\`Cancel to skip\``);
            this.data.members[this.index].inaraName = listenerMessage.content;
          }
          inputListener.start("Has the user joined the squadron? (yes/no)\n\`Cancel to skip\`", async (listenerMessage?: Message) => {
            if(listenerMessage) {
              const error = Validation.joinedSquadron(boolConversion[listenerMessage.content]);
              if(error.length !== 0) return inputListener.start(`${error}\n\`Cancel to skip\``);
              this.data.members[this.index].joinedSquadron = boolConversion[listenerMessage.content];
            }
            inputListener.start("Has the user joined the Inara squadron? (yes/no)\n\`Cancel to skip\`", async (listenerMessage?: Message) => {
              if(listenerMessage) {
                const error = Validation.joinedInaraSquadron(boolConversion[listenerMessage.content]);
                if(error.length !== 0) return inputListener.start(`${error}\n\`Cancel to skip\``);
                this.data.members[this.index].joinedInaraSquadron = boolConversion[listenerMessage.content];
              }

              const res1 = await HTTPMembers.edit(this.data.members[this.index]._id, this.guildMember.id, this.data.members[this.index]);
              if(!res1.success) return promptMessage.edit(StringBuilders.internalError());
              const res2 = await this.query();
              if(!res2.success || !res2.data) return promptMessage.edit(StringBuilders.internalError())

              this.data = res2.data;

              let messageData = this.buildData(this.index);
              messageData.content += "\n\nApplication updated.";
              this.message.edit(messageData);

              this.state = "displaying";
              this.awaitingInput = false;
              promptMessage.delete();
            });
          });
        });
      });
    }).catch((err: Error) => {
      this.message.reply(StringBuilders.internalError());
      console.log(err);
    });

  }

  private startListener(name: string) {

    switch(name) {
      case "messageReactionAdd":
        this.client.once("messageReactionAdd", (reaction: MessageReaction, initialUser: User | PartialUser) => {
          if(this.isDestroyed) return;
          const guildMember = this.guild.members.resolve(initialUser.id);
          if(!guildMember) return;
          this.resetTimeout();
          this.startListener("messageReactionAdd");
          this.handleReactions(reaction, guildMember);
        });
        break;
    }
  }

  handleReactions(reaction: MessageReaction, guildMember: GuildMember): void {

    if(!this.client.user) return;
    if(guildMember.id !== this.client.user.id) {
      reaction.users.remove(guildMember);
      if(reaction.message.id === this.message.id && guildMember.id === this.guildMember.id && !this.awaitingInput) {
        const emojiName = reaction.emoji.name;
        if(this.state === "selecting") {
          if(emojiName === "1️⃣") { this.stage = 0; this.shipData(); }
          else if(emojiName === "2️⃣") { this.stage = 1; this.shipData(); }
          else if(emojiName === "3️⃣") { this.stage = 2; this.shipData(); }
          else if(emojiName === "4️⃣") { this.stage = 3; this.shipData(); }
        } else if(this.state === "displaying") {
          if(emojiName === "⏮️") this.shipSelector();
          if(this.data.members.length > 0) {
            const permissions = config.permissions;
            if(emojiName === "➡️") this.next();
            else if(emojiName === "⬅️") this.prev();
            else if(emojiName === "✅") {
              if(this.guildMember.hasPermission(permissions["complete-application"])) this.complete();
            } else if(emojiName === "❌") {
              if(this.guildMember.hasPermission(permissions["revert-application"])) this.revert();
            } else if(emojiName === "✏️") {
              if(this.guildMember.hasPermission(permissions["edit-member"])) this.edit();
            } else if(emojiName === "⏰") {
              if(this.guildMember.hasPermission(permissions["create-revision-request"])) this.request();
            }
          }
        }
      }
    }

  }

  resetTimeout(): void {

    if(this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.destroy();
    }, 5 * 60 * 1000);

  }

  destroy(): void {

    this.isDestroyed = true;
    this.message.delete();

  }

}
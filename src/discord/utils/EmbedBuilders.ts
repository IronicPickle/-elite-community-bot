import { MessageEmbed, GuildMember } from "discord.js";
import { DBNewsPost, DBServer, DBServerPost, ServerType } from "../../routes/api";

export default class EmbedBuilders {

  public static newsPost(author: GuildMember, newsPost: DBNewsPost): MessageEmbed {

    const embed = new MessageEmbed()
      .setColor("#94ae3f")
      .setTitle(newsPost.title)
      .setThumbnail(author.user.avatarURL() || "https://i.gyazo.com/b7751aabc8a5d75d312a2a1e2eb2967f.png")
      .setDescription(`@everyone\n${newsPost.body}`)
      .addFields(
        { name: "Post made by", value: author, inline: true }
      )

    return embed;

  }

  public static serverMessage(server: DBServer): MessageEmbed {

    const fullAddress = server.address + ((server.port.length === 0) ? "" : `:${server.port}`);

    const embed = new MessageEmbed()
      .setColor("#94ae3f")
      .setTitle(server.name)
      .setThumbnail(getGameLogo(server.type) || "https://i.gyazo.com/b7751aabc8a5d75d312a2a1e2eb2967f.png")
      .setDescription(server.description)
      .addFields(
        { name: "Address", value: fullAddress, inline: true }
      )

    return embed;

  }

  public static serverPost(author: GuildMember, serverPost: DBServerPost): MessageEmbed {

    const embed = new MessageEmbed()
      .setColor("#243754")
      .setTitle(serverPost.title)
      .setThumbnail(author.user.avatarURL() || "https://i.gyazo.com/b7751aabc8a5d75d312a2a1e2eb2967f.png")
      .setDescription(`@everyone\n${serverPost.body}`)
      .addFields(
        { name: "Post made by", value: author, inline: true }
      )

    return embed;

  }

}

function getGameLogo(type: ServerType) {
  if(type === "minecraft") return "https://i.gyazo.com/c82d9c34c9d4ffc0cd03e2f9da726423.png";
  if(type === "arma3") return "https://i.gyazo.com/8a7e026cef401becbf9dc90310201a47.png";
  if(type === "valheim") return "https://i.gyazo.com/88755deb50b43e6dafb72e75f8f16156.png";
  return null;
}
import { User, MessageEmbed, GuildMember } from "discord.js";
import moment from "moment";
import { DBMember } from "../objects/DBMember";
import discord from "../../utils/discord";
import { config } from "../../utils/Config";

export default class EmbedBuilders {
  /*
  public static applicationInfo(user: User | null, data: DBMember): MessageEmbed {

    const stages = ["Not Started", "In Progress", "Reviewed", "Completed"];
    const revisions = data.revisionMessages;

    const embed = new MessageEmbed()
      .setColor("#fdcb0e")
      .setTitle("Application Viewer")
      .setThumbnail(`${(user?.avatarURL()) ? user.avatarURL() : "https://i.imgur.com/2XrLeX2.png"}`)
      .setDescription(`Viewing ${(user) ? user : "Unknown User"}'s Application`)
      .addFields(
        { name: "In-Game Name", value: `${(data.inGameName) ? data.inGameName : "N/A"}`, inline: true },
        { name: "Inara Name", value: `${(data.inaraName) ? data.inaraName : "N/A"}`, inline: true },

        { name: "Stage", value: `${(data.applicationStatus) ? stages[data.applicationStatus.stage] : "N/A"}`, inline: false },

        { name: "Joined Squadron", value: `${(data.joinedSquadron) ? "✅" : "❌"}`, inline: true },
        { name: "Joined Inara Squadron", value: `${(data.joinedInaraSquadron) ? "✅" : "❌"}`, inline: true }
        
      )

    for(const i in revisions) {
      const revision = revisions[i];
      const authorGuildMember = discord.getMember(revision.authorId);
      if(authorGuildMember) {
        embed.addField(
          `Revision ${parseInt(i) + 1}`,
          `${revision.text}\n*by ${authorGuildMember}*\n\`${moment(new Date(revision.creationDate)).fromNow()} | ${moment(new Date(revision.creationDate)).format("Do MMM YYYY, hh:mm a")}\``
        );
      }
    }

    return embed;

  }
  */
}
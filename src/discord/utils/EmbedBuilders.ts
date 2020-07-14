import { User, MessageEmbed, GuildMember } from "discord.js";
import moment from "moment";
import { DBMember } from "../objects/DBMember";
import discord from "../../utils/discord";
import { FactionsData } from "../../routes/api";
import { config } from "../../utils/Config";
import { FactionData } from "../../http_utils/HTTPBGS";

export default class EmbedBuilders {

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

  public static bgsBroadcast(description: string, objectives: string[], factionsData: FactionsData, authorMember: GuildMember): MessageEmbed {

    const embed = new MessageEmbed()
    .setColor("#fdcb0e")
    .setTitle("📡 Incomming Transmission")
    .setThumbnail("https://i.imgur.com/YOIsjkK.png")
    .setDescription(`A new mission has been broadcasted by ${authorMember}`)
    .addFields(
      { name: "Description", value: description }
    )

  for(const i in objectives) {
    embed.addField( `Objective ${parseInt(i) + 1}`, objectives[i] );
  }

  const factionId = config.bgs.factionId;

  let faction = null;
  for(const i in factionsData.factions) {
    if(factionsData.factions[i].id === factionId) {
      faction = factionsData.factions[i];
      break;
    }
  }

  if(faction) {
    embed.addField("Influence", factionsData.factions.map((faction: FactionData) => {
      const influence = Math.floor(faction.influence * 100 * 100) / 100;
      return (
        (faction.id !== 81923) ?
          (faction.id === factionId) ?
            `\`> ${faction.name} - ${influence}% [${faction.state}]\``
          :
            `\`${faction.name} - ${influence}% [${faction.state}]\``
        : ""
      )
    }));
  }

  return embed;

  }
}
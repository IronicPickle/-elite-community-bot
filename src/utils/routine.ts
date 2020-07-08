import HTTPMembers from "../http_utils/HTTPMembers"
import { CommandoClient } from "discord.js-commando";
import { discordBot } from "../app";
import { config } from "./Config";

export default function applicationCheck() {

  setInterval(async () => {
    console.log("[Discord] Performing routine application check");
    const res1 = await HTTPMembers.query({ stage: 1 });
    if(!res1.data) return;
    const res2 = await HTTPMembers.query({ stage: 2 });
    if(!res2.data) return;
    const dbMembers = [ ...res1.data.members, ...res2.data.members ]
    for(const i in dbMembers) {
      const dbMember = dbMembers[i];
      const startDate = dbMember.applicationStatus.startDate;
      const warningSent = dbMember.applicationStatus.warningSent;

      const client = discordBot.client;
      if(!config.guildId) return;
      const guild = client.guilds.resolve(config.guildId);
      if(!guild) return;
      const guildMember = guild.members.resolve(dbMember.discordId);
      if(guildMember && startDate) {

        const timeout = config.application.timeout;
        const warningTimeout = config.application.warningTimeout;
        const timePassed = new Date().getTime() - new Date(startDate).getTime();
        
        if(!warningSent && timePassed >= warningTimeout) {
          await HTTPMembers.sendApplicationWarning(dbMember._id);
        } else if(timePassed >= timeout) {
          await HTTPMembers.resetApplication(dbMember._id);
        }

      } else {
        await HTTPMembers.resetApplication(dbMember._id);
      }

    }

    console.log("[Discord] Application check successful");

  }, 1000 * 60 * 60 * 30);

  

}
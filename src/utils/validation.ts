import Members from "../models/members";

export default {

  discordId: async (discordId: string): Promise<string> => {

    let err = "";
    if(typeof discordId === "string") {
      if(discordId.length !== 18 || !(/[\d]{18}/g).test(discordId)) {
        err =  "A Discord ID must be an 18 digit string"
      } else if(await Members.findOne({ discordId })) {
        err =  "A member with that Discord ID already exists"
      }
    } else {
      err = "Discord ID is Invalid"
    }

    return err;

  },
  inaraName: (inaraName: string): string => {

    let err = "";
    if(typeof inaraName === "string") {
      if(inaraName.length > 500) {
        err =  "Maximum character limit exceeded"
      }
    } else {
      if(typeof inaraName !== "undefined") {
        err =  "Inara Name is Invalid"
      }
    }

    return err;

  },
  inGameName: (inGameName: string): string => {

    let err = "";
    if(typeof inGameName === "string") {
      if(inGameName.length > 500) {
        err = "Maximum character limit exceeded"
      }
    } else {
      if(typeof inGameName !== "undefined") {
        err = "Inara Name is Invalid"
      }
    }

    return err;

  },
  joinedPrivateGroup: (joinedPrivateGroup: string): string => {

    let err = "";
    if(typeof joinedPrivateGroup !== "boolean") {
      err = "Joined Private Group is Invalid"
    }

    return err;

  },
  message: (message: string): string => {

    let err = "";
    if(typeof message === "string") {
      if(message.length > 500) {
        err = "Maximum character limit exceeded"
      }
    } else {
      if(typeof message !== "undefined") {
        err = "Inara Name is Invalid"
      }
    }

    return err;

  },

}
export default class Validation {
  
  public static inaraName(inaraName: string): string {

    let err = "";
    if(typeof inaraName === "string") {
      if(inaraName.length > 500) {
        err =  "Maximum character limit exceeded"
      }
    }
  
    return err;

  }

  public static inGameName(inGameName: string): string {

    let err = "";
    if(typeof inGameName === "string") {
      if(inGameName.length > 500) {
        err = "Maximum character limit exceeded"
      }
    }

    return err;

  }

  public static joinedSquadron(joinedSquadron: boolean): string {

    let err = "";
    if(typeof joinedSquadron !== "boolean") {
      err = "Joined Squadron is Invalid"
    }

    return err;

  }

  public static joinedInaraSquadron(joinedInaraSquadron: boolean): string {

    let err = "";
    if(typeof joinedInaraSquadron !== "boolean") {
      err = "Joined Inara Squadron is Invalid"
    }

    return err;

  }

  public static message(message: string): string {

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

  }

  public static description(description?: string): string {

    let err = "";
    if(typeof description === "string") {
      if(description.length < 10) {
        err = "Mission Description must be at least 10 characters";
      } else if(description.length > 1024) {
        err = "Mission Description must not exceed 1024 chracters";
      }
    } else {
      err = "Mission Description is invalid";
    }

    return err;

  }

  public static objective(description?: string): string {

    let err = "";
    if(typeof description === "string") {
      if(description.length < 10) {
        err = "Mission Objectives must be at least 10 characters";
      } else if(description.length > 1024) {
        err = "Mission Objectives must not exceed 1024 chracters";
      }
    } else {
      err = "Mission Objective is invalid";
    }

    return err;

  }

}
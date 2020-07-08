import HTTPMethods, { PostResponse } from "./HTTPMethods";
import { logger } from "../app";

export interface BroadcastOptions {
  description: string;
  objectives: string[];
}

export interface BroadcastErrors {
  description: string;
  objectives: string[];
}

export default class HTTPMissions {

  public static async broadcast(authorDiscordId: string, inputs: BroadcastOptions) {
    logger.info(`[Discord] Action: bgs mission created by guild-member-${authorDiscordId}`);
    return <PostResponse<BroadcastErrors>> await HTTPMethods.postRequest("/api/missions/broadcast", { authorDiscordId, inputs });
  }

}
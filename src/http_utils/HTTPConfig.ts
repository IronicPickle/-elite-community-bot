import HTTPMethods, { GetResponse, PatchResponse } from "./HTTPMethods";
import { PermissionString } from "discord.js";
import { logger } from "../app";

export interface WebConfigData {
  permissions: { [key: string]: PermissionString };
}

export interface QueryData {
  [key: string]: any;
  config: WebConfigData;
}

export default class HTTPConfig {

  public static async query() {
    return <GetResponse<QueryData>> await HTTPMethods.getRequest(`/api/config/query`);
  }

  public static async edit(action: string, perm: string) {
    logger.info(`[Discord] Action: master server config update`);
    return <PatchResponse<void>> await HTTPMethods.patchRequest(`/api/config/edit`, { action, perm });
  }

}
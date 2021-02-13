import HTTPMethods, { GetResponse, PostResponse, PatchResponse } from "./HTTPMethods";
import { logger } from "../app";

export interface QueryOptions {
  [key: string]: any;
  searchKey?: string;
  searchQuery?: string;
  sortKey?: string;
  sortDirection?: 1 | 0 | -1;
  snipStart?: string;
  snipLimit?: string;
  stage?: 0 | 1 | 2 | 3;
}

export interface DiscordRole {
  color: number;
  createdTimestamp: number;
  deleted: boolean;
  guild: string;
  hoist: boolean;
  id: string;
  managed: boolean;
  mentionable: boolean;
  name: string;
  permissions: number;
  rawPosition: number;
}

export interface DBMemberData {
  [key: string]: any;
  _id: string;
  discordId: string;
  discordName: string;
  discordPerms: string[];
  discordRoles: DiscordRole[];
  discordAvatar?: string;
  joinDate: Date;
}

export interface QueryData {
  [key: string]: any;
  count: number;
  members: DBMemberData[];
}

export interface CreateOptions {
  discordId: string
}

export interface CreateErrors {
  discordId: string
}

export default class HTTPMembers {

  public static async query(queryOptions: QueryOptions) {
    let queryString = "";
    for(const i in queryOptions) {
      queryString += `&${i}=${queryOptions[i]}`;
    }
    queryString = queryString.replace("&", "?");

    return <GetResponse<QueryData>> await HTTPMethods.getRequest(`/api/members/query${queryString}`);
  }

  public static async create(inputs: CreateOptions) {
    logger.info(`[Discord] Action: guild-member-${inputs.discordId} added to database`);
    return <PostResponse<CreateErrors>> await HTTPMethods.postRequest(`/api/members/create`, { inputs });
  }

  public static async update(_id: string) {
    logger.info(`[Discord] Action: db-member-${_id} discord details sync`);
    return <PatchResponse<void>> await HTTPMethods.patchRequest(`/api/members/update`, { _id });
  }

}
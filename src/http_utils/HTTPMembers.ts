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
  inGameName: string;
  inaraName: string;
  joinedSquadron: boolean;
  joinedInaraSquadron: boolean;
  applicationStatus: {
    stage: number;
    reviewedById?: string;
    completedById?: string;
    revertedById?: string;
    startDate?: Date;
    warningSent: boolean;
  };
  revisionMessages: {
      _id: string;
      text: string;
      authorId: string;
      creationDate: Date;
  }[];
  joinDate: Date;
}

export interface QueryData {
  [key: string]: any;
  count: number;
  members: DBMemberData[];
}

export interface CreateOptions {
  discordId: string,
  inaraName?: string,
  inGameName?: string
}

export interface CreateErrors {
  discordId: string,
  inaraName: string,
  inGameName: string
}

export interface CreateRevisionRequestOptions {
  message: string
}

export interface CreateRevisionRequestErrors {
  message: string
}

export interface EditOptions {
  inaraName: string,
  inGameName: string,
  joinedSquadron: boolean,
  joinedInaraSquadron: boolean
}

export interface EditErrors {
  inaraName: string,
  inGameName: string,
  joinedSquadron: string,
  joinedInaraSquadron: string
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

  public static async createRevisionRequest(_id: string, authorDiscordId: string, inputs: CreateRevisionRequestOptions) {
    logger.info(`[Discord] Action: db-member-${_id} revision request created by guild-member-${authorDiscordId}`);
    return <PostResponse<CreateRevisionRequestErrors>> await HTTPMethods.postRequest(`/api/members/createRevisionRequest`, { _id, authorDiscordId, inputs });
  }

  public static async edit(_id: string, authorDiscordId: string | null, inputs: EditOptions) {
    logger.info(`[Discord] Action: db-member-${_id} entry modified by guild-member-${authorDiscordId}`);
    return <PatchResponse<EditErrors>> await HTTPMethods.patchRequest(`/api/members/edit`, { _id, authorDiscordId, inputs });
  }

  public static async update(_id: string) {
    logger.info(`[Discord] Action: db-member-${_id} discord details sync`);
    return <PatchResponse<void>> await HTTPMethods.patchRequest(`/api/members/update`, { _id });
  }

  public static async startApplication(_id: string) {
    logger.info(`[Discord] Action: db-member-${_id} application started`);
    return <PatchResponse<void>> await HTTPMethods.patchRequest(`/api/members/startApplication`, { _id });
  }

  public static async sendApplicationWarning(_id: string) {
    logger.info(`[Discord] Action: db-member-${_id} application warning timeout sent`);
    return <PatchResponse<void>> await HTTPMethods.patchRequest(`/api/members/sendApplicationWarning`, { _id });
  }

  public static async resetApplication(_id: string) {
    logger.info(`[Discord] Action: db-member-${_id} application reset timeout sent`);
    return <PatchResponse<void>> await HTTPMethods.patchRequest(`/api/members/resetApplication`, { _id });
  }

  public static async completeApplication(_id: string, authorDiscordId: string) {
    logger.info(`[Discord] Action: db-member-${_id} application completed by guild-member-${authorDiscordId}`);
    return <PatchResponse<void>> await HTTPMethods.patchRequest(`/api/members/completeApplication`, { _id, authorDiscordId });
  }

  public static async revertApplication(_id: string, authorDiscordId: string) {
    logger.info(`[Discord] Action: db-member-${_id} application reverted by guild-member-${authorDiscordId}`);
    return <PatchResponse<void>> await HTTPMethods.patchRequest(`/api/members/revertApplication`, { _id, authorDiscordId });
  }

}
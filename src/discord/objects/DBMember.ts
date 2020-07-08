import HTTPMembers, { QueryOptions, QueryData, EditOptions, CreateRevisionRequestOptions, DBMemberData, DiscordRole } from "../../http_utils/HTTPMembers";
import { logger } from "../../app";

export default async function fetchDbMember(id: string): Promise<DBMember | void> {

  let queryOptions: QueryOptions = { searchQuery: id }

  if(id.length === 24) {
    queryOptions.searchKey = "_id";
  } else if(id.length === 18) {
    queryOptions.searchKey = "discordId";
  }

  const res = await HTTPMembers.query(queryOptions);
  if(!res.success || !res.data) return;
  return new DBMember(res.data);

}

export class DBMember implements DBMemberData {

  public _id: string;
  public discordId: string;
  public discordName: string;
  public discordPerms: string[];
  public discordRoles: DiscordRole[];
  public discordAvatar?: string;
  public inGameName: string;
  public inaraName: string;
  public joinedSquadron: boolean;
  public joinedInaraSquadron: boolean;
  public applicationStatus: {
    stage: number,
    reviewedById?: string,
    completedById?: string,
    revertedById?: string,
    startDate?: Date,
    warningSent: boolean
  };
  public revisionMessages: {
    _id: string,
    text: string,
    authorId: string,
    creationDate: Date
  }[];
  public joinDate: Date;

  constructor(res: QueryData) {

    const member = res.members[0];
    this._id = member._id;
    this.discordId = member.discordId;
    this.discordName = member.discordName;
    this.discordPerms = member.discordPerms;
    this.discordRoles = member.discordRoles;
    this.inGameName = member.inGameName;
    this.inaraName = member.inaraName;
    this.joinDate = member.joinDate;
    this.joinedInaraSquadron = member.joinedInaraSquadron;
    this.joinedSquadron = member.joinedSquadron;
    this.applicationStatus = member.applicationStatus;
    this.revisionMessages = member.revisionMessages;

  }

  async fetch(): Promise<DBMember | void> {
  
    const res = await HTTPMembers.query({ searchKey: "_id", searchQuery: this._id });
    if(!res.success || !res.data) return;
    return this;

  }

  async createRevisionRequest(authorDiscordId: string, inputs: CreateRevisionRequestOptions): Promise<boolean> {
    
    const res = await HTTPMembers.createRevisionRequest(this._id, authorDiscordId, inputs);
    return res.success;

  }

  async edit(authorDiscordId: string | null, inputs: EditOptions): Promise<boolean> {
    
    const res = await HTTPMembers.edit(this._id, authorDiscordId, inputs);
    return res.success;

  }

  async update(): Promise<boolean> {
    
    const res = await HTTPMembers.update(this._id);
    return res.success;

  }

  async startApplication(): Promise<boolean> {
    
    const res = await HTTPMembers.startApplication(this._id);
    return res.success;

  }
  
  async sendApplicationWarning(): Promise<boolean> {
    
    const res = await HTTPMembers.sendApplicationWarning(this._id);
    return res.success;

  }

  async resetApplication(): Promise<boolean> {
    
    const res = await HTTPMembers.resetApplication(this._id);
    return res.success;

  }

  async completeApplication(authorDiscordId: string): Promise<boolean> {
    
    const res = await HTTPMembers.completeApplication(this._id, authorDiscordId)
    return res.success;

  }

  async revertApplication(authorDiscordId: string): Promise<boolean> {
    
    const res = await HTTPMembers.revertApplication(this._id, authorDiscordId)
    return res.success;

  }

}
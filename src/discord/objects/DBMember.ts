import HTTPMembers, { QueryOptions, QueryData, DBMemberData, DiscordRole } from "../../http_utils/HTTPMembers";

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
  public joinDate: Date;

  constructor(res: QueryData) {

    const member = res.members[0];
    this._id = member._id;
    this.discordId = member.discordId;
    this.discordName = member.discordName;
    this.discordPerms = member.discordPerms;
    this.discordRoles = member.discordRoles;
    this.joinDate = member.joinDate;

  }

  async fetch(): Promise<DBMember | void> {
  
    const res = await HTTPMembers.query({ searchKey: "_id", searchQuery: this._id });
    if(!res.success || !res.data) return;
    return this;

  }

  async update(): Promise<boolean> {
    
    const res = await HTTPMembers.update(this._id);
    return res.success;

  }

}
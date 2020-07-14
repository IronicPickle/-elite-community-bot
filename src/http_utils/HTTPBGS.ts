import requestPromise from "request-promise";
import { GetResponse } from "./HTTPMethods";

export interface FactionData {
  [key: string]: any;
  id: number;
  name: string;
  alleigiance: string;
  government: string;
  influence: number;
  state: string;
  isPlayer: boolean;
}

export interface QueryData {
  [key: string]: any;
  factionData: {
    id: number;
    name: string;
    controllingFaction: {
      id: number;
      name: string;
      alleigiance: string;
      government: string;
    };
    factions: FactionData[];
  }
}

export default class HTTPBGS {

  public static async queryFactionsBySystemName(systemName: string) {
    try {
      const res = await requestPromise({
        method: "GET",
        url: `https://www.edsm.net/api-system-v1/factions?systemName=${systemName}`,
        simple: false,
        headers: {
          "Content-Type": "application/json",
        }
      });
      return <Promise<GetResponse<QueryData>>> Promise.resolve({ success: true, msg: "Query successful", data: { factionData: JSON.parse(res) }});
    } catch(err) {
      return <Promise<GetResponse<void>>> Promise.resolve({ success: false, msg: "Couldn't connect to EDSM server" });
    }
  }

  public static async queryFactionsBySystemId(systemId: number) {
    try {
      const res = await requestPromise({
        method: "GET",
        url: `https://www.edsm.net/api-system-v1/factions?systemId=${systemId}`,
        simple: false,
        headers: {
          "Content-Type": "application/json",
        }
      });
      return <Promise<GetResponse<QueryData>>> Promise.resolve({ success: true, msg: "Query successful", data: { factionData: JSON.parse(res) }});
    } catch(err) {
      return <Promise<GetResponse<void>>> Promise.resolve({ success: false, msg: "Couldn't connect to EDSM server" });
    }
  }

}
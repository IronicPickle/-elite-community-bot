import requestPromise from "request-promise";
import { logger } from "../app";
import { backendConfig } from "../utils/BackendConfig";

export interface GetResponse<Data> {
  success: boolean;
  msg: string;
  data?: Data;
}

export interface PostResponse<Errors> {
  success: boolean;
  msg: string;
  errors?: Errors;
}

export interface PatchResponse<Errors> {
  success: boolean;
  msg: string;
  errors?: Errors;
}

export default class HTTPMethods {

  public static async getRequest(path: string): Promise<GetResponse<any>> {
    try {
      const res = await requestPromise({
        method: "GET",
        url: backendConfig.master.url + path,
        simple: false,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${backendConfig.master.token}`
        }
      });
      return Promise.resolve(JSON.parse(res));
    } catch(err) {
      logger.error(err);
      return Promise.resolve({ success: false, msg: "Couldn't connect to master server" });
    }
  }

  public static async postRequest(path: string, body: { [key: string]: any }): Promise<PostResponse<any>> {
    try {
      const res = await requestPromise({
        method: "POST",
        url: backendConfig.master.url + path,
        simple: false,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${backendConfig.master.token}`
        }, body: JSON.stringify(body)
      });
      return Promise.resolve(JSON.parse(res));
    } catch(err) {
      logger.error(err);
      return Promise.resolve({ success: false, msg: "Couldn't connect to master server" });
    }
  }

  public static async patchRequest(path: string, body: { [key: string]: any }): Promise<PatchResponse<any>> {
    try {
      const res = await requestPromise({
        method: "PATCH",
        url: backendConfig.master.url + path,
        simple: false,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${backendConfig.master.token}`
        }, body: JSON.stringify(body)
      });
      return Promise.resolve(JSON.parse(res));
    } catch(err) {
      logger.error(err);
      return Promise.resolve({ success: false, msg: "Couldn't connect to master server" });
    }
  }

}
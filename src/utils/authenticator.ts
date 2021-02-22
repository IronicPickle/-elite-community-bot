import { Request, NextFunction, Response } from "express";
import { backendConfig } from "./BackendConfig";

export default async function authenticator(req: Request, res: Response, next: NextFunction) {
  if(!checkToken(req.headers.authorization)) {
    return next({ code: "UNAUTHORISED" });
  }

  return next();
}

function checkToken(token?: string): boolean {

  if(!token) return false;
  if(!token.startsWith("Bearer ")) return false;

  return backendConfig.token === token.substr(7);

}
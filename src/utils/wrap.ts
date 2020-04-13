import { NextFunction, Request, Response } from "express";

export default function(fn: any): any {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  }
}
import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import path from "path";
import { Express } from "express-serve-static-core";
import routes from "./routes";
import http from "http";
import { logger } from "../app";
import { backendConfig } from "../utils/BackendConfig";

export default class NodeServer {
  public port: number;

  private server: Express;
  private httpServer: http.Server | null;
  private publicPath: string;

  constructor() {
    this.port = backendConfig.port;

    this.server = express();
    this.httpServer = null;
    
    this.publicPath = path.join(__dirname, "../../client/build");
    this.server.use(express.static(this.publicPath));

    this.server.use(bodyParser.urlencoded({ extended: false }));
    this.server.use(bodyParser.json());
  }

  start() {
    return new Promise<void>((resolve, reject) => {
      const server = this.server;
      const port = this.port;

      this.httpServer = server.listen(port, () => {
        if(!this.httpServer) {
          reject("[HTTP] No HTTP instance found"); return;
        }

        server.all("*", (req: Request, res: Response, next: NextFunction) => {
          logger.http(`[${req.method}] ${req.url} from ${req.ip}`);
          return next();
        });

        for(const i in routes) {
          server.use(i, routes[i](this.httpServer));
          logger.info(`[Node] Registered route '${i}'`);
        }

        server.use((err: any, req: Request, res: Response, next: NextFunction) => {
          if(err.code === "UNAUTHORISED") {
            logger.http(`[UNAUTHORISED] ${req.url} from ${req.ip}`);
            res.status(401).send({ success: false, msg: "Unauthorised" });
          }

          return next();

        });

        
        server.all("*", (req: Request, res: Response, next: NextFunction) => {
          res.status(404).send("Not found");

          return next();
        });

        resolve();
      });
      
    });
  }
}

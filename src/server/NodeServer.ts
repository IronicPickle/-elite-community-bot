import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { Express } from "express-serve-static-core";
import routes from "./routes";
import http from "http";

export class NodeServer {
  public port: string;
  public environment: string | undefined;
  private dev: boolean;

  private server: Express;
  private httpInstance: http.Server | null;
  private publicPath: string;

  constructor() {
    this.port = process.env.PORT || "8080";
    this.environment = process.env.NODE_ENV; // Node Environment
    this.dev = this.environment !== "production";

    this.server = express(); // Initialise express
    this.httpInstance = null
    
    this.publicPath = path.join(__dirname, "../../client/build");
    this.server.use(express.static(this.publicPath));

    this.server.use(bodyParser.urlencoded({ extended: false }));
    this.server.use(bodyParser.json());
  }

  start() {
    return new Promise((resolve, reject) => {
      const server = this.server;
      const port = this.port;
      this.httpInstance = server.listen(port, () => {
        if(!this.httpInstance) {
          reject(); return;
        }

        // Express routes
        server.use("/api", routes.api);

        server.all("*", (req: any, res: any, next: any) => {
          if(this.dev) console.log(req.method, req.url, "from", req.ip);
          res.status(404).send("Not found");
        });

        resolve(this);
      });
      
    });
  }
}

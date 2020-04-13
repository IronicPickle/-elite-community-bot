import dotenv from "dotenv";
import { NodeServer } from "./server/NodeServer";
import mongoose from "mongoose";

console.log("\nStarting...\n");

const env: dotenv.DotenvConfigOutput = dotenv.config(); // Pull env vars from ' .env ' file
if(env.error) console.log("No environment file, using defaults");

const nodeServer = new NodeServer();
nodeServer.start().then(() => {
  console.log("\nStarted in:", nodeServer.environment, "mode");
  console.log("Listening on:", nodeServer.port, "\n");
}).catch(console.error);

const dbAddress = process.env.DB_ADDRESS || "mongodb://localhost/eliteCDB";
mongoose.connect(dbAddress, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then((db) => {
  console.log(`[Mongoose] Connection created to: ${dbAddress}`);
}).catch((err) => {
  console.log(`[Mongoose] Connection failed to: ${dbAddress}`);
  console.log(err);
});
import api from "../routes/api";
import { RequestHandler } from "express";

const routes: { [key: string]: RequestHandler } = {
  "/api": api
}

export default routes;
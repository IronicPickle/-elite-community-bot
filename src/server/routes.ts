import api from "../routes/api";
import { Router } from "express";
import http from "http";

const routes: { [key: string]: (httpServer: http.Server) => Router } = {
  "/api": api
}

export default routes;
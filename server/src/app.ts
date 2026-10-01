import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { accountRouter } from "./routes/account.routes.js";

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use("/api", accountRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

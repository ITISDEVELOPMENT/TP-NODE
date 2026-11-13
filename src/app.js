import express from "express";
import morgan from "morgan";
import { createHivesService } from "./services/hives.service.js";
import { createMeasuresService } from "./services/measures.service.js";
import { createInspectionsService } from "./services/inspections.service.js";
import { createHivesController } from "./controllers/hives.controller.js";
import { createHivesRouter } from "./routes/hives/hives.router.js";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler.js";

// Crée l'application à partir des repositories reçus
export function createApp({ hivesRepository, measuresRepository, inspectionsRepository }) {
  const hivesService = createHivesService({ hivesRepository });
  const measuresService = createMeasuresService({ hivesService, measuresRepository });
  const inspectionsService = createInspectionsService({ hivesService, inspectionsRepository });
  const controller = createHivesController({ hivesService, measuresService, inspectionsService });

  const app = express();
  app.use(morgan("dev"));
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/hives", createHivesRouter(controller));

  // En dernier, après toutes les routes
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

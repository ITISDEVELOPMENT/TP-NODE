import { Router } from "express";

// URL et verbe de chaque route
export function createHivesRouter(controller) {
  const router = Router();
  router.get("/", controller.listHives);
  router.get("/:id", controller.getHive);
  router.get("/:id/measures", controller.listMeasures);
  router.post("/:id/measures", controller.addMeasure);
  router.get("/:id/inspections", controller.listInspections);
  router.post("/:id/inspections", controller.addInspection);
  return router;
}

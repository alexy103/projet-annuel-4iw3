import { Router } from "express";
import { requireApiKey, requireAuth } from "../middlewares";
import {
  createTreatmentType,
  deleteTreatmentType,
  getTreatmentTypeById,
  getTreatmentTypes,
  getTreatmentTypesByName,
  getTreatmentTypesByUserId,
  updateTreatmentType,
} from "../controllers";

export const treatmentTypesRouter: Router = Router();

treatmentTypesRouter.get("/", requireApiKey, requireAuth("admin", "user"), getTreatmentTypes);

treatmentTypesRouter.get(
  "/search",
  requireApiKey,
  requireAuth("admin", "user"),
  getTreatmentTypesByName,
);

treatmentTypesRouter.get(
  "/user/:userId",
  requireApiKey,
  requireAuth("admin", "user"),
  getTreatmentTypesByUserId,
);

treatmentTypesRouter.get(
  "/:typeId",
  requireApiKey,
  requireAuth("admin", "user"),
  getTreatmentTypeById,
);

treatmentTypesRouter.post(
  "/",
  requireApiKey,
  requireAuth("admin", "user"),
  createTreatmentType,
);

treatmentTypesRouter.put(
  "/:typeId",
  requireApiKey,
  requireAuth("admin", "user"),
  updateTreatmentType,
);

treatmentTypesRouter.delete(
  "/:typeId",
  requireApiKey,
  requireAuth("admin", "user"),
  deleteTreatmentType,
);

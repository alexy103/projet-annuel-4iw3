import { Router } from "express";
import { requireApiKey, requireAuth } from "../middlewares";
import {
  createCare,
  deleteCare,
  getCareById,
  getCares,
  getCaresByAnimalId,
  getCaresByTreatmentTypeId,
  updateCare,
} from "../controllers";

export const caresRouter: Router = Router();

caresRouter.get("/", requireApiKey, requireAuth("admin", "user"), getCares);

caresRouter.get("/:careId", requireApiKey, requireAuth("admin", "user"), getCareById);

caresRouter.get(
  "/animal/:animalId",
  requireApiKey,
  requireAuth("admin", "user"),
  getCaresByAnimalId,
);

caresRouter.get(
  "/treatment-type/:treatmentTypeId",
  requireApiKey,
  requireAuth("admin", "user"),
  getCaresByTreatmentTypeId,
);

caresRouter.post("/", requireApiKey, requireAuth("admin", "user"), createCare);

caresRouter.put("/:careId", requireApiKey, requireAuth("admin", "user"), updateCare);

caresRouter.delete("/:careId", requireApiKey, requireAuth("admin", "user"), deleteCare);

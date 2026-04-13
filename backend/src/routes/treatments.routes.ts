import { Router } from "express";
import { requireApiKey, requireAuth } from "../middlewares";
import {
  createTreatment,
  deleteTreatment,
  getTreatmentById,
  getTreatments,
  getTreatmentsByAnimalId,
  getTreatmentsByMedicineId,
  getTreatmentsByTreatmentTypeId,
  updateTreatment,
} from "../controllers";

export const treatmentsRouter: Router = Router();

treatmentsRouter.get("/", requireApiKey, requireAuth(), getTreatments);

treatmentsRouter.get(
  "/:treatmentId",
  requireApiKey,
  requireAuth(),
  getTreatmentById,
);

treatmentsRouter.get(
  "/medicine/:medicineId",
  requireApiKey,
  requireAuth(),
  getTreatmentsByMedicineId,
);

treatmentsRouter.get(
  "/animal/:animalId",
  requireApiKey,
  requireAuth(),
  getTreatmentsByAnimalId,
);

treatmentsRouter.get(
  "/type/:typeId",
  requireApiKey,
  requireAuth(),
  getTreatmentsByTreatmentTypeId,
);

treatmentsRouter.post("/", requireApiKey, requireAuth("admin", "user"), createTreatment);

treatmentsRouter.put(
  "/:treatmentId",
  requireApiKey,
  requireAuth("admin", "user"),
  updateTreatment,
);

treatmentsRouter.delete(
  "/:treatmentId",
  requireApiKey,
  requireAuth("admin", "user"),
  deleteTreatment,
);

import { Router } from "express";
import { requireApiKey, requireAuth } from "../middlewares";
import {
  createClinic,
  deleteClinic,
  getClinicById,
  getClinics,
  getClinicsByCriteria, getClinicsByName,
  updateClinic,
} from "../controllers";

export const clinicsRouter: Router = Router();

clinicsRouter.get("/", requireApiKey, requireAuth(), getClinics);

clinicsRouter.get("/search", requireApiKey, requireAuth(), getClinicsByCriteria);

clinicsRouter.get("/search-name", requireApiKey, requireAuth(), getClinicsByName);

clinicsRouter.get("/:clinicId", requireApiKey, requireAuth(), getClinicById);

clinicsRouter.post("/", requireApiKey, requireAuth("admin"), createClinic);

clinicsRouter.put(
  "/:clinicId",
  requireApiKey,
  requireAuth("admin", "clinic"),
  updateClinic,
);

clinicsRouter.delete(
  "/:clinicId",
  requireApiKey,
  requireAuth("admin"),
  deleteClinic,
);

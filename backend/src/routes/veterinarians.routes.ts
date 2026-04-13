import { Router } from "express";
import { requireApiKey, requireAuth } from "../middlewares";
import {
  createVeterinarian,
  deleteVeterinarian,
  getVeterinarianById,
  getVeterinarians,
  getVeterinariansByClinicId,
  getVeterinariansByFullName,
  setVeterinarianIsPresent,
  updateVeterinarian,
} from "../controllers";

export const veterinariansRouter: Router = Router();

veterinariansRouter.get("/", requireApiKey, requireAuth(), getVeterinarians);

veterinariansRouter.get(
  "/search",
  requireApiKey,
  requireAuth(),
  getVeterinariansByFullName,
);

veterinariansRouter.get(
  "/:veterinarianId",
  requireApiKey,
  requireAuth(),
  getVeterinarianById,
);

veterinariansRouter.get(
  "/clinic/:clinicId",
  requireApiKey,
  requireAuth(),
  getVeterinariansByClinicId,
);

veterinariansRouter.post(
  "/",
  requireApiKey,
  requireAuth("admin", "clinic"),
  createVeterinarian,
);

veterinariansRouter.put(
  "/:veterinarianId",
  requireApiKey,
  requireAuth("admin", "clinic"),
  updateVeterinarian,
);

veterinariansRouter.patch(
  "/:veterinarianId/presence",
  requireApiKey,
  requireAuth("admin", "clinic"),
  setVeterinarianIsPresent,
);

veterinariansRouter.delete(
  "/:veterinarianId",
  requireApiKey,
  requireAuth("admin", "clinic"),
  deleteVeterinarian,
);

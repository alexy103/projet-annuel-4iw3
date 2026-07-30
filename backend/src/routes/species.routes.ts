import { Router } from "express";
import { requireApiKey, requireAuth } from "../middlewares";
import {
  createSpecies,
  deleteSpecies,
  getSpecies,
  getSpeciesById,
  getSpeciesByName,
  updateSpecies,
} from "../controllers";

export const speciesRouter: Router = Router();

speciesRouter.get("/", requireApiKey, requireAuth(), getSpecies);

speciesRouter.get("/search", requireApiKey, requireAuth(), getSpeciesByName);

speciesRouter.get("/:speciesId", requireApiKey, requireAuth(), getSpeciesById);

speciesRouter.post("/", requireApiKey, requireAuth("admin"), createSpecies);

speciesRouter.put(
  "/:speciesId",
  requireApiKey,
  requireAuth("admin"),
  updateSpecies,
);

speciesRouter.delete(
  "/:speciesId",
  requireApiKey,
  requireAuth("admin"),
  deleteSpecies,
);

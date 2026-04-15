import { Router } from "express";
import { requireApiKey, requireAuth } from "../middlewares";
import {
  assignMicroshipToAnimal,
  createAnimal,
  deleteAnimal,
  getAnimalById,
  getAnimals,
  getAnimalsByName,
  getAnimalsByUserId,
  getSharedAnimals,
  toggleAnimalIsDeceased,
  toggleAnimalIsShared,
  updateAnimal,
} from "../controllers";

export const animalsRouter: Router = Router();

animalsRouter.get("/", requireApiKey, requireAuth("admin", "user"), getAnimals);

animalsRouter.get("/search", requireApiKey, requireAuth("admin", "user"), getAnimalsByName);

animalsRouter.get("/shared", requireApiKey, requireAuth(), getSharedAnimals);

animalsRouter.get("/:animalId", requireApiKey, requireAuth(), getAnimalById);

animalsRouter.get(
  "/user/:userId",
  requireApiKey,
  requireAuth("admin", "user"),
  getAnimalsByUserId,
);

animalsRouter.post("/", requireApiKey, requireAuth("admin", "user"), createAnimal);

animalsRouter.put("/:animalId", requireApiKey, requireAuth("admin", "user"), updateAnimal);

animalsRouter.patch(
  "/:animalId/shared",
  requireApiKey,
  requireAuth("admin", "user"),
  toggleAnimalIsShared,
);

animalsRouter.patch(
  "/:animalId/deceased",
  requireApiKey,
  requireAuth("admin", "user"),
  toggleAnimalIsDeceased,
);

animalsRouter.patch(
  "/:animalId/microship",
  requireApiKey,
  requireAuth("admin", "user"),
  assignMicroshipToAnimal,
);

animalsRouter.delete("/:animalId", requireApiKey, requireAuth("admin", "user"), deleteAnimal);

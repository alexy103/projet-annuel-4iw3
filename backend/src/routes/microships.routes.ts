import { Router } from "express";
import { requireApiKey, requireAuth } from "../middlewares";
import {
  createMicroship,
  deleteMicroship,
  getMicroshipById,
  getMicroships,
  getMicroshipsByUserId,
  updateMicroship,
} from "../controllers";

export const microshipsRouter: Router = Router();

microshipsRouter.get("/", requireApiKey, requireAuth("admin", "user"), getMicroships);

microshipsRouter.get(
  "/user/:userId",
  requireApiKey,
  requireAuth("admin", "user"),
  getMicroshipsByUserId,
);

microshipsRouter.get(
  "/:microshipId",
  requireApiKey,
  requireAuth("admin", "user"),
  getMicroshipById,
);

microshipsRouter.post("/", requireApiKey, requireAuth("admin", "user"), createMicroship);

microshipsRouter.put(
  "/:microshipId",
  requireApiKey,
  requireAuth("admin", "user"),
  updateMicroship,
);

microshipsRouter.delete(
  "/:microshipId",
  requireApiKey,
  requireAuth("admin", "user"),
  deleteMicroship,
);

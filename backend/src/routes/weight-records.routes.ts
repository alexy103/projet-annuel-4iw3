import { Router } from "express";
import { requireApiKey, requireAuth } from "../middlewares";
import {
  createWeightRecord,
  deleteWeightRecord,
  getWeightRecordById,
  getWeightRecords,
  getWeightRecordsByAnimalId,
  updateWeightRecord,
} from "../controllers";

export const weightRecordsRouter: Router = Router();

weightRecordsRouter.get("/", requireApiKey, requireAuth("admin", "user"), getWeightRecords);

weightRecordsRouter.get(
  "/:weightRecordId",
  requireApiKey,
  requireAuth("admin", "user"),
  getWeightRecordById,
);

weightRecordsRouter.get(
  "/animal/:animalId",
  requireApiKey,
  requireAuth("admin", "user"),
  getWeightRecordsByAnimalId,
);

weightRecordsRouter.post(
  "/",
  requireApiKey,
  requireAuth("admin", "user"),
  createWeightRecord,
);

weightRecordsRouter.put(
  "/:weightRecordId",
  requireApiKey,
  requireAuth("admin", "user"),
  updateWeightRecord,
);

weightRecordsRouter.delete(
  "/:weightRecordId",
  requireApiKey,
  requireAuth("admin", "user"),
  deleteWeightRecord,
);

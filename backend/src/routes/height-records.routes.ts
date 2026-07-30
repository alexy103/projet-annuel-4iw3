import { Router } from "express";
import { requireApiKey, requireAuth } from "../middlewares";
import {
  createHeightRecord,
  deleteHeightRecord,
  getHeightRecordById,
  getHeightRecords,
  getHeightRecordsByAnimalId,
  updateHeightRecord,
} from "../controllers";

export const heightRecordsRouter: Router = Router();

heightRecordsRouter.get("/", requireApiKey, requireAuth("admin", "user"), getHeightRecords);

heightRecordsRouter.get(
  "/:heightRecordId",
  requireApiKey,
  requireAuth("admin", "user"),
  getHeightRecordById,
);

heightRecordsRouter.get(
  "/animal/:animalId",
  requireApiKey,
  requireAuth("admin", "user"),
  getHeightRecordsByAnimalId,
);

heightRecordsRouter.post(
  "/",
  requireApiKey,
  requireAuth("admin", "user"),
  createHeightRecord,
);

heightRecordsRouter.put(
  "/:heightRecordId",
  requireApiKey,
  requireAuth("admin", "user"),
  updateHeightRecord,
);

heightRecordsRouter.delete(
  "/:heightRecordId",
  requireApiKey,
  requireAuth("admin", "user"),
  deleteHeightRecord,
);

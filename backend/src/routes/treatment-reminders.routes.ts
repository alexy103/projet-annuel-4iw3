import { Router } from "express";
import { requireApiKey, requireAuth } from "../middlewares";
import {
  createTreatmentReminder,
  deleteTreatmentReminder,
  getByReminderFrequencyId,
  getByTreatmentAndFrequency,
  getByTreatmentId,
} from "../controllers";

export const treatmentRemindersRouter: Router = Router();

treatmentRemindersRouter.get(
  "/treatment/:treatmentId",
  requireApiKey,
  requireAuth("admin", "user"),
  getByTreatmentId,
);

treatmentRemindersRouter.get(
  "/frequency/:frequencyId",
  requireApiKey,
  requireAuth("admin", "user"),
  getByReminderFrequencyId,
);

treatmentRemindersRouter.get(
  "/treatment/:treatmentId/frequency/:frequencyId",
  requireApiKey,
  requireAuth("admin", "user"),
  getByTreatmentAndFrequency,
);

treatmentRemindersRouter.post(
  "/",
  requireApiKey,
  requireAuth("admin", "user"),
  createTreatmentReminder,
);

treatmentRemindersRouter.delete(
  "/treatment/:treatmentId/frequency/:frequencyId",
  requireApiKey,
  requireAuth("admin", "user"),
  deleteTreatmentReminder,
);

import { Router } from "express";
import { requireApiKey, requireAuth } from "../middlewares";
import {
  createReminderFrequency,
  deleteReminderFrequency,
  getReminderFrequencies,
  getReminderFrequencyById,
  updateReminderFrequency,
} from "../controllers";

export const reminderFrequenciesRouter: Router = Router();

reminderFrequenciesRouter.get(
  "/",
  requireApiKey,
  requireAuth(),
  getReminderFrequencies,
);

reminderFrequenciesRouter.get(
  "/:frequencyId",
  requireApiKey,
  requireAuth(),
  getReminderFrequencyById,
);

reminderFrequenciesRouter.post(
  "/",
  requireApiKey,
  requireAuth("admin"),
  createReminderFrequency,
);

reminderFrequenciesRouter.put(
  "/:frequencyId",
  requireApiKey,
  requireAuth("admin"),
  updateReminderFrequency,
);

reminderFrequenciesRouter.delete(
  "/:frequencyId",
  requireApiKey,
  requireAuth("admin"),
  deleteReminderFrequency,
);

import { Router } from "express";
import { requireApiKey, requireAuth } from "../middlewares";
import {
  createAvailability,
  deleteAvailability,
  getAvailabilities,
  getAvailabilityByClinicId,
  getAvailabilityById,
  updateAvailability,
  updateAvailabilitySlotRules,
} from "../controllers";

export const availabilitiesRouter: Router = Router();

availabilitiesRouter.get(
  "/",
  requireApiKey,
  requireAuth("admin", "clinic"),
  getAvailabilities,
);

availabilitiesRouter.get(
  "/clinic/:clinicId",
  requireApiKey,
  requireAuth(),
  getAvailabilityByClinicId,
);

availabilitiesRouter.get(
  "/:availabilityId",
  requireApiKey,
  requireAuth("admin", "clinic"),
  getAvailabilityById,
);

availabilitiesRouter.post(
  "/",
  requireApiKey,
  requireAuth("admin", "clinic"),
  createAvailability,
);

availabilitiesRouter.put(
  "/:availabilityId",
  requireApiKey,
  requireAuth("admin", "clinic"),
  updateAvailability,
);

availabilitiesRouter.patch(
  "/:availabilityId/slot-rules",
  requireApiKey,
  requireAuth("admin", "clinic"),
  updateAvailabilitySlotRules,
);

availabilitiesRouter.delete(
  "/:availabilityId",
  requireApiKey,
  requireAuth("admin", "clinic"),
  deleteAvailability,
);

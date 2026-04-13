import { Router } from "express";
import { requireApiKey, requireAuth } from "../middlewares";
import {
  createAppointmentReason,
  deleteAppointmentReason,
  getAppointmentReasonById,
  getAppointmentReasonByLabel,
  getAppointmentReasons,
  updateAppointmentReason,
} from "../controllers";

export const appointmentReasonsRouter: Router = Router();

appointmentReasonsRouter.get(
  "/",
  requireApiKey,
  requireAuth(),
  getAppointmentReasons,
);

appointmentReasonsRouter.get(
  "/search",
  requireApiKey,
  requireAuth(),
  getAppointmentReasonByLabel,
);

appointmentReasonsRouter.get(
  "/:reasonId",
  requireApiKey,
  requireAuth(),
  getAppointmentReasonById,
);

appointmentReasonsRouter.post(
  "/",
  requireApiKey,
  requireAuth("admin", "clinic"),
  createAppointmentReason,
);

appointmentReasonsRouter.put(
  "/:reasonId",
  requireApiKey,
  requireAuth("admin", "clinic"),
  updateAppointmentReason,
);

appointmentReasonsRouter.delete(
  "/:reasonId",
  requireApiKey,
  requireAuth("admin", "clinic"),
  deleteAppointmentReason,
);

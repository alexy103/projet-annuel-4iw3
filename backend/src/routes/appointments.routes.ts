import { Router } from "express";
import { requireApiKey, requireAuth } from "../middlewares";
import {
  createAppointment,
  deleteAppointment,
  getAppointmentById,
  getAppointments,
  getAppointmentsByAnimalId,
  getAppointmentsByClinicId,
  getAppointmentsByReasonId,
  getAppointmentsByUserId,
  toggleAppointmentIsCompleted,
  updateAppointment,
} from "../controllers";

export const appointmentsRouter: Router = Router();

appointmentsRouter.get("/", requireApiKey, requireAuth(), getAppointments);

appointmentsRouter.get(
  "/:appointmentId",
  requireApiKey,
  requireAuth(),
  getAppointmentById,
);

appointmentsRouter.get(
  "/user/:userId",
  requireApiKey,
  requireAuth(),
  getAppointmentsByUserId,
);

appointmentsRouter.get(
  "/animal/:animalId",
  requireApiKey,
  requireAuth(),
  getAppointmentsByAnimalId,
);

appointmentsRouter.get(
  "/clinic/:clinicId",
  requireApiKey,
  requireAuth(),
  getAppointmentsByClinicId,
);

appointmentsRouter.get(
  "/reason/:reasonId",
  requireApiKey,
  requireAuth(),
  getAppointmentsByReasonId,
);

appointmentsRouter.post(
  "/",
  requireApiKey,
  requireAuth("admin", "user"),
  createAppointment,
);

appointmentsRouter.put(
  "/:appointmentId",
  requireApiKey,
  requireAuth("admin", "user"),
  updateAppointment,
);

appointmentsRouter.patch(
  "/:appointmentId/completed",
  requireApiKey,
  requireAuth("admin", "clinic"),
  toggleAppointmentIsCompleted,
);

appointmentsRouter.delete(
  "/:appointmentId",
  requireApiKey,
  requireAuth("admin", "user"),
  deleteAppointment,
);

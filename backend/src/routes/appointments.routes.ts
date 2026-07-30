import { Router } from "express";
import { requireApiKey, requireAuth } from "../middlewares";
import {
  acceptAppointment,
  cancelAppointment,
  createAppointment,
  deleteAppointment,
  getAppointmentById,
  getAppointments,
  getAppointmentsByAnimalId,
  getAppointmentsByClinicId,
  getAppointmentsByReasonId,
  getAppointmentsByUserId,
  refuseAppointment,
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

appointmentsRouter.patch(
  "/:appointmentId/accepted",
  requireApiKey,
  requireAuth("admin", "clinic"),
  acceptAppointment,
);

appointmentsRouter.patch(
  "/:appointmentId/refused",
  requireApiKey,
  requireAuth("admin", "clinic"),
  refuseAppointment,
);

appointmentsRouter.patch(
  "/:appointmentId/cancelled",
  requireApiKey,
  requireAuth("admin", "clinic", "user"),
  cancelAppointment,
);

appointmentsRouter.delete(
  "/:appointmentId",
  requireApiKey,
  requireAuth("admin", "user"),
  deleteAppointment,
);

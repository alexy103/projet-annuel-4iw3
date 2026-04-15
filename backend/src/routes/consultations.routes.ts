import { Router } from "express";
import { requireApiKey, requireAuth } from "../middlewares";
import {
  createConsultation,
  deleteConsultation,
  getConsultationById,
  getConsultations,
  getConsultationsByAppointmentId,
  getConsultationsByVeterinarianId,
  updateConsultation,
} from "../controllers";

export const consultationsRouter: Router = Router();

consultationsRouter.get("/", requireApiKey, requireAuth(), getConsultations);

consultationsRouter.get(
  "/:consultationId",
  requireApiKey,
  requireAuth(),
  getConsultationById,
);

consultationsRouter.get(
  "/appointment/:appointmentId",
  requireApiKey,
  requireAuth(),
  getConsultationsByAppointmentId,
);

consultationsRouter.get(
  "/veterinarian/:veterinarianId",
  requireApiKey,
  requireAuth(),
  getConsultationsByVeterinarianId,
);

consultationsRouter.post(
  "/",
  requireApiKey,
  requireAuth("admin", "clinic"),
  createConsultation,
);

consultationsRouter.put(
  "/:consultationId",
  requireApiKey,
  requireAuth("admin", "clinic"),
  updateConsultation,
);

consultationsRouter.delete(
  "/:consultationId",
  requireApiKey,
  requireAuth("admin", "clinic"),
  deleteConsultation,
);

import "./docs/openapi";

import express, { Express } from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import {
  authRouter,
  permissionsRouter,
  rolesRouter,
  usersRouter,
  animalsRouter,
  appointmentReasonsRouter,
  appointmentsRouter,
  availabilitiesRouter,
  caresRouter,
  clinicsRouter,
  consultationsRouter,
  heightRecordsRouter,
  medicinesRouter,
  microshipsRouter,
  reminderFrequenciesRouter,
  speciesRouter,
  treatmentRemindersRouter,
  treatmentTypesRouter,
  treatmentsRouter,
  users2FARouter,
  veterinariansRouter,
  weightRecordsRouter,
} from "./routes";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./docs";

export const app: Express = express();

const corsOrigins: string[] = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  helmet({
    // Static assets (profile/animal pictures) are loaded cross-origin by the frontend.
    crossOriginResourcePolicy: false,
  }),
);
app.use(
  cors({
    origin: corsOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/roles", rolesRouter);
app.use("/api/permissions", permissionsRouter);
app.use("/api/animals", animalsRouter);
app.use("/api/appointment-reasons", appointmentReasonsRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/availabilities", availabilitiesRouter);
app.use("/api/cares", caresRouter);
app.use("/api/clinics", clinicsRouter);
app.use("/api/consultations", consultationsRouter);
app.use("/api/height-records", heightRecordsRouter);
app.use("/api/medicines", medicinesRouter);
app.use("/api/microships", microshipsRouter);
app.use("/api/reminder-frequencies", reminderFrequenciesRouter);
app.use("/api/species", speciesRouter);
app.use("/api/treatment-reminders", treatmentRemindersRouter);
app.use("/api/treatment-types", treatmentTypesRouter);
app.use("/api/treatments", treatmentsRouter);
app.use("/api/users-2fa", users2FARouter);
app.use("/api/veterinarians", veterinariansRouter);
app.use("/api/weight-records", weightRecordsRouter);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

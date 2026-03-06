import "./docs/openapi";

import express, { Express } from "express";
import {
  authRouter,
  permissionsRouter,
  rolesRouter,
  usersRouter,
} from "./routes";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./docs";

// Import des docs avant le generator
import "./docs/auth.openapi";
import "./docs/users.openapi";
import "./docs/roles.openapi";
import "./docs/permissions.openapi";

export const app: Express = express();

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/roles", rolesRouter);
app.use("/api/permissions", permissionsRouter);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

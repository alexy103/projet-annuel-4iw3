import { Router } from "express";

import { requireApiKey, requireAuth, validateSchema } from "../middlewares";
import {
  createRole,
  deleteRole,
  getRoleById,
  getRoles,
  updateRole,
} from "../controllers";
import { RolePayloadSchema } from "../schemas";

export const rolesRouter: Router = Router();

rolesRouter.get("/", requireApiKey, requireAuth("admin"), getRoles);

rolesRouter.get("/:roleId", requireApiKey, requireAuth("admin"), getRoleById);

rolesRouter.post(
  "/",
  requireApiKey,
  requireAuth("admin"),
  validateSchema(RolePayloadSchema),
  createRole,
);

rolesRouter.put(
  "/:roleId",
  requireApiKey,
  requireAuth("admin"),
  validateSchema(RolePayloadSchema),
  updateRole,
);

rolesRouter.delete("/:roleId", requireApiKey, requireAuth("admin"), deleteRole);

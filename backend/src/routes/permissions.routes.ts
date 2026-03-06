import { Router } from "express";
import { requireApiKey, requireAuth, validateSchema } from "../middlewares";
import { PermissionPayloadSchema } from "../schemas";
import {
    createPermission,
    deletePermission,
    getPermissionById,
    getPermissionByLabel,
    getPermissions,
    updatePermission
} from "../controllers";

export const permissionsRouter: Router = Router();

permissionsRouter.get("/", requireApiKey, requireAuth("admin"), getPermissions);

permissionsRouter.get(
  "/:permissionId",
  requireApiKey,
  requireAuth("admin"),
  getPermissionById,
);

permissionsRouter.get(
  "/:label/label",
  requireApiKey,
  requireAuth("admin"),
  getPermissionByLabel,
);

permissionsRouter.post(
  "/",
  requireApiKey,
  requireAuth("admin"),
  validateSchema(PermissionPayloadSchema),
  createPermission,
);

permissionsRouter.put(
  "/:permissionId",
  requireApiKey,
  requireAuth("admin"),
  validateSchema(PermissionPayloadSchema),
  updatePermission,
);

permissionsRouter.delete("/:permissionId", requireApiKey, requireAuth("admin"), deletePermission);
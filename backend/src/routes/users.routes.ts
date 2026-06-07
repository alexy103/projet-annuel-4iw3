import { Router } from "express";
import { requireApiKey, requireAuth, uploadUserPicture, validateSchema } from "../middlewares";
import {
  completeUserOnboarding,
  createPermissionToUser,
  createUser, deletePermissionFromUser,
  deleteUser, getMe, getPermissionsByUserId,
  getUserById,
  getUsers,
  toggleUserActivation,
  updateUser, updateUserClinicId,
  updateUserEmailVerified,
  uploadUserProfilePicture,
} from "../controllers";
import { UpdateUserPayloadSchema, CreateUserPayloadSchema } from "../schemas";

export const usersRouter: Router = Router();

usersRouter.get("/", requireApiKey, requireAuth("admin"), getUsers);

usersRouter.get("/me", requireApiKey, requireAuth(), getMe);

usersRouter.get("/:userId", requireApiKey, requireAuth("admin"), getUserById);

usersRouter.post(
  "/",
  requireApiKey,
  requireAuth("admin"),
  validateSchema(CreateUserPayloadSchema),
  createUser,
);

usersRouter.put(
  "/:userId",
  requireApiKey,
  requireAuth(),
  validateSchema(UpdateUserPayloadSchema),
  updateUser,
);

usersRouter.patch(
  "/:userId/mail",
  requireApiKey,
  requireAuth("admin"),
  updateUserEmailVerified,
);

usersRouter.patch(
  "/:userId/active",
  requireApiKey,
  requireAuth("admin"),
  toggleUserActivation,
);

usersRouter.patch("/:userId/clinic", requireApiKey, requireAuth("admin", "clinic"), updateUserClinicId);

usersRouter.patch("/:userId/onboarding", requireApiKey, requireAuth(), completeUserOnboarding);

usersRouter.patch(
  "/:userId/profile-picture",
  requireApiKey,
  requireAuth(),
  uploadUserPicture,
  uploadUserProfilePicture,
);

usersRouter.delete("/:userId", requireApiKey, requireAuth("admin"), deleteUser);

usersRouter.get(
  "/:userId/permissions",
  requireApiKey,
  requireAuth("admin"),
  getPermissionsByUserId,
);

usersRouter.post(
  "/permissions",
  requireApiKey,
  requireAuth("admin"),
  createPermissionToUser,
);

usersRouter.delete(
  "/:userId/permissions/:permissionId",
  requireApiKey,
  requireAuth("admin"),
  deletePermissionFromUser,
);
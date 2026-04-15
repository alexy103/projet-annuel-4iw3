import { db } from "../config";
import { UserPermission, UserPermissionPayload } from "../schemas";
import { BaseRepository } from "./base.repository";

class UserPermissionRepository extends BaseRepository<UserPermission, UserPermissionPayload, UserPermissionPayload> {
  constructor() {
    super("users_permissions", "UserPermission");
  }
}

export const userPermissionsRepository = new UserPermissionRepository();


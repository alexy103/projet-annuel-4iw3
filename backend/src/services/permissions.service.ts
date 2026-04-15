import { AppError } from "../types";
import { permissionsRepository, usersRepository } from "../repositories";
import { Permission, PermissionPayload, UserPermission } from "../schemas";

export const permissionService = {
  async getAll(): Promise<Permission[]> {
    return permissionsRepository.findAll();
  },

  async getById(permissionId: number): Promise<Permission> {
    return permissionsRepository.findById(permissionId);
  },

  async getByLabel(label: string): Promise<Permission> {
    const permission: Permission | null = await permissionsRepository.findByLabel(label);
    if (!permission) {
      throw new AppError("Permission not found", 404);
    }
    return permission;
  },

  async create(data: PermissionPayload): Promise<Permission> {
    const existingPermission: Permission | null = await permissionsRepository.findByLabel(
      data.label,
    );
    if (existingPermission) {
      throw new AppError("Permission already exists", 409);
    }

    return permissionsRepository.create(data);
  },

  async update(permissionId: number, data: PermissionPayload): Promise<Permission> {
    const existingPermission: Permission = await permissionsRepository.findById(permissionId);
    if (!existingPermission) throw new AppError("Permission not found", 404);

    if (data.label) {
      const existingPermissionLabel: Permission | null = await permissionsRepository.findByLabel(
        data.label,
      );
      if (
        existingPermissionLabel &&
        existingPermissionLabel.label === data.label
      ) {
        throw new AppError("Permission label already exists", 409);
      }
    }

    return permissionsRepository.update(permissionId, data);
  },

  async delete(permissionId: number, userId: number): Promise<Permission> {
    const existingPermission: Permission =
      await permissionsRepository.findById(permissionId);
    if (!existingPermission) throw new AppError("Permission not found", 404);

    const userPermission: UserPermission | null = await usersRepository.findPermissionByPermissionId(
      userId,
      permissionId,
    );

    if (userPermission)
      throw new AppError("User is already associated to this permission", 409);

    return permissionsRepository.delete(permissionId);
  },
};

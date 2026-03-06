import { AppError } from "../types";
import { rolesRepository, usersRepository } from "../repositories";
import { RolePayload, Role } from "../schemas";

export const roleService = {
  async getAll(): Promise<Role[]> {
    return rolesRepository.findAll();
  },

  async getById(roleId: number): Promise<Role> {
    return rolesRepository.findById(roleId);
  },

  async create(data: RolePayload): Promise<Role> {
    const existingRole: Role | null = await rolesRepository.findByLabel(
      data.label,
    );
    if (existingRole) {
      throw new AppError("Role already exists", 409);
    }

    return rolesRepository.create(data);
  },

  async update(roleId: number, data: RolePayload): Promise<Role> {
    const existingRole: Role = await rolesRepository.findById(roleId);
    if (!existingRole) throw new AppError("Role not found", 404);

    const existingRoleName: Role | null = await rolesRepository.findByLabel(
      data.label,
    );
    if (existingRoleName) {
      throw new AppError("Role name already exists", 409);
    }

    return rolesRepository.update(roleId, data);
  },

  async delete(roleId: number): Promise<Role> {
    const existingRole: Role = await rolesRepository.findById(roleId);
    if (!existingRole) throw new AppError("Role not found", 404);

    const userCount: number = await usersRepository.countUsersByRoleId(roleId);
    if (userCount > 0)
      throw new AppError(`Cannot delete role: users associated`, 409);

    return rolesRepository.delete(roleId);
  },
};

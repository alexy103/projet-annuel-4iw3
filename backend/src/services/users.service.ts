import {
  UpdateUserPayload,
  CreateUserPayload,
  User,
  Role,
  UserPermission,
  Permission, Clinic,
} from "../schemas";
import { AppError } from "../types";
import {
  clinicsRepository,
  permissionsRepository,
  rolesRepository,
  usersRepository,
} from "../repositories";

import {
  capitalize,
  capitalizeFirst,
  generateSecurePassword,
  generateVerificationCode,
  hashPassword,
  minimize,
  sendTempPasswordEmail,
  sendVerificationCodeEmail,
} from "../utils";

export const userService = {
  async getAll(isActivated: string): Promise<User[]> {
    return usersRepository.findAll(isActivated);
  },

  async getById(id: number): Promise<User> {
    return usersRepository.findById(id);
  },

  async create(data: CreateUserPayload): Promise<User> {
    data = {
      ...data,
      email: minimize(data.email),
      last_name: capitalize(data.last_name),
      first_name: capitalizeFirst(data.first_name),
    };

    if (data.email) {
      const emailExists: User | null = await usersRepository.findByEmail(
        data.email,
      );
      if (emailExists) throw new AppError("Email already exists", 409);
    }

    if (data.role_id) {
      const roleExists: Role = await rolesRepository.findById(data.role_id);
      if (!roleExists) {
        throw new AppError("Role not found", 404);
      }
    }

    const verificationCode: string = generateVerificationCode();

    const passwordGenerated: string = generateSecurePassword();
    const passwordHash: string = await hashPassword(passwordGenerated);
    if (!passwordHash) {
      throw new AppError("Internal Server Error", 500);
    }

    const user: User = await usersRepository.create(
      data,
      passwordHash,
      verificationCode,
    );

    if (user.must_change_password) {
      await sendTempPasswordEmail(user.email, passwordGenerated);
      await sendVerificationCodeEmail(user.email, verificationCode);
    }

    return user;
  },

  async update(userId: number, data: UpdateUserPayload): Promise<User> {
    if (data.email) {
      data.email = minimize(data.email);
    }
    if (data.last_name) {
      data.last_name = capitalize(data.last_name);
    }
    if (data.first_name) {
      data.first_name = capitalizeFirst(data.first_name);
    }

    const existingUser: User = await usersRepository.findById(userId);
    if (!existingUser) throw new AppError("User not found", 404);

    if (data.email && data.email !== existingUser.email) {
      const emailExists: User | null = await usersRepository.findByEmail(
        data.email,
      );
      if (emailExists) throw new AppError("Email already exists", 409);
    }

    if (data.role_id) {
      const roleExists: Role = await rolesRepository.findById(data.role_id);
      if (!roleExists) throw new AppError("Role not found", 404);
    }

    return usersRepository.update(userId, data);
  },

  async updateEmailVerified(userId: number): Promise<User> {
    const existingUser: User = await usersRepository.findById(userId);
    if (!existingUser) throw new AppError("User not found", 404);

    if (existingUser.email_verified) {
      throw new AppError("Email already verified", 409);
    }

    return usersRepository.updateEmailVerified(userId);
  },

  async setActivation(userId: number, isActivated: boolean): Promise<User> {
    const existingUser: User = await usersRepository.findById(userId);
    if (!existingUser) throw new AppError("User not found", 404);

    if (existingUser.is_activated && existingUser.is_activated == isActivated) {
      throw new AppError("User already activated", 409);
    }
    if (
      !existingUser.is_activated &&
      existingUser.is_activated == isActivated
    ) {
      throw new AppError("User already desactivated", 409);
    }

    return usersRepository.updateActivation(userId, isActivated);
  },

  async setClinic(userId: number, clinicId : number): Promise<User> {
    const existingUser: User = await usersRepository.findById(userId);
    if (!existingUser) throw new AppError("User not found", 404);

    const existingClinic : Clinic = await clinicsRepository.findById(clinicId);
    if (!existingClinic) throw new AppError("Clinic not found", 404);

    return usersRepository.updateClinic(userId, clinicId);
  },

  async delete(userId: number): Promise<User> {
    const existingUser: User = await usersRepository.findById(userId);
    if (!existingUser) throw new AppError("User not found", 404);

    const userPermission: number =
      await usersRepository.countPermissionsByUserId(userId);

    if (userPermission > 0)
      throw new AppError(
        "User is already associated with a permission(s)",
        409,
      );

    return usersRepository.delete(userId);
  },

  async findPermissionsByUserId(userId: number): Promise<UserPermission[]> {
    const existingUser: User = await usersRepository.findById(userId);
    if (!existingUser) throw new AppError("User not found", 404);
    if (!existingUser.is_activated)
      throw new AppError("User is desactivated", 409);

    return usersRepository.findPermissionsByUserId(userId);
  },

  async createPermissionToUser(
    userId: number,
    permissionId: number,
  ): Promise<UserPermission> {
    const existingUser: User = await usersRepository.findById(userId);
    if (!existingUser) throw new AppError("User not found", 404);
    if (!existingUser.is_activated)
      throw new AppError("User is desactivated", 409);

    const existingPermission: Permission =
      await permissionsRepository.findById(permissionId);
    if (!existingPermission) throw new AppError("Permission not found", 404);

    const userPermission: UserPermission | null =
      await usersRepository.findPermissionByPermissionId(userId, permissionId);

    if (userPermission)
      throw new AppError("User is already associated to this permission", 409);

    return usersRepository.createPermissionToUser(userId, permissionId);
  },

  async deletePermissionFromUser(
    userId: number,
    permissionId: number,
  ): Promise<UserPermission> {
    const existingUser: User = await usersRepository.findById(userId);
    if (!existingUser) throw new AppError("User not found", 404);
    if (!existingUser.is_activated)
      throw new AppError("User is desactivated", 409);

    const existingPermission: Permission =
      await permissionsRepository.findById(permissionId);
    if (!existingPermission) throw new AppError("Permission not found", 404);

    const userPermission: UserPermission | null =
      await usersRepository.findPermissionByPermissionId(userId, permissionId);

    if (!userPermission)
      throw new AppError("User and permission are not associated", 404);

    return usersRepository.deletePermissionFromUser(userId, permissionId);
  },
};

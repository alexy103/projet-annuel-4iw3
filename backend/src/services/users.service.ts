import {
  UpdateUserPayload,
  CreateUserPayload,
  User,
  UserPublic,
  toPublicUser,
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
  async getAll(isActivated: string): Promise<UserPublic[]> {
    const users = await usersRepository.findAll(isActivated);
    return users.map(toPublicUser);
  },

  async getById(id: number): Promise<UserPublic> {
    const user = await usersRepository.findById(id);
    return toPublicUser(user);
  },

  async create(data: CreateUserPayload, password?: string): Promise<UserPublic> {
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

    const isSelfRegistered = !!password;
    const passwordToHash: string = isSelfRegistered ? password : generateSecurePassword();
    const passwordHash: string = await hashPassword(passwordToHash);
    if (!passwordHash) {
      throw new AppError("Internal Server Error", 500);
    }

    const user: User = await usersRepository.create(
      data,
      passwordHash,
      verificationCode,
    );

    if (isSelfRegistered) {
      await sendVerificationCodeEmail(user.email, verificationCode);
    } else {
      await sendTempPasswordEmail(user.email, passwordToHash);
      await sendVerificationCodeEmail(user.email, verificationCode);
    }

    return toPublicUser(user);
  },

  async update(userId: number, data: UpdateUserPayload, callerId: number, role: string): Promise<UserPublic> {
    if (role === "user" && userId !== callerId) throw new AppError("Access denied", 403);

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

    return toPublicUser(await usersRepository.update(userId, data));
  },

  async updateEmailVerified(userId: number): Promise<UserPublic> {
    const existingUser: User = await usersRepository.findById(userId);
    if (!existingUser) throw new AppError("User not found", 404);

    if (existingUser.email_verified) {
      throw new AppError("Email already verified", 409);
    }

    return toPublicUser(await usersRepository.updateEmailVerified(userId));
  },

  async setActivation(userId: number, isActivated: boolean): Promise<UserPublic> {
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

    return toPublicUser(await usersRepository.updateActivation(userId, isActivated));
  },

  async setClinic(userId: number, clinicId : number): Promise<UserPublic> {
    const existingUser: User = await usersRepository.findById(userId);
    if (!existingUser) throw new AppError("User not found", 404);

    const existingClinic : Clinic = await clinicsRepository.findById(clinicId);
    if (!existingClinic) throw new AppError("Clinic not found", 404);

    return toPublicUser(await usersRepository.updateClinic(userId, clinicId));
  },

  async uploadProfilePicture(userId: number, picturePath: string, callerId: number, role: string): Promise<UserPublic> {
    const existingUser: User = await usersRepository.findById(userId);
    if (!existingUser) throw new AppError("User not found", 404);
    if (role === "user" && userId !== callerId) throw new AppError("Access denied", 403);
    return toPublicUser(await usersRepository.updateProfilePicture(userId, picturePath));
  },

  async updateProfile(userId: number, data: { first_name?: string; last_name?: string }): Promise<UserPublic> {
    const existing: User = await usersRepository.findById(userId);
    if (!existing) throw new AppError("User not found", 404);

    const payload: Partial<UpdateUserPayload> = {};
    if (data.first_name) payload.first_name = capitalizeFirst(data.first_name.trim());
    if (data.last_name) payload.last_name = capitalize(data.last_name.trim());

    if (Object.keys(payload).length > 0) {
      await usersRepository.update(userId, payload as UpdateUserPayload);
    }

    if (!existing.onboarding_completed) {
      await usersRepository.updateOnboardingCompleted(userId);
    }

    return toPublicUser(await usersRepository.findById(userId));
  },

  async completeOnboarding(userId: number, callerId: number, role: string): Promise<UserPublic> {
    const existingUser: User = await usersRepository.findById(userId);
    if (!existingUser) throw new AppError("User not found", 404);
    if (role === "user" && userId !== callerId) throw new AppError("Access denied", 403);
    if (existingUser.onboarding_completed) throw new AppError("Onboarding already completed", 409);
    return toPublicUser(await usersRepository.updateOnboardingCompleted(userId));
  },

  async delete(userId: number): Promise<UserPublic> {
    const existingUser: User = await usersRepository.findById(userId);
    if (!existingUser) throw new AppError("User not found", 404);

    const userPermission: number =
      await usersRepository.countPermissionsByUserId(userId);

    if (userPermission > 0)
      throw new AppError(
        "User is already associated with a permission(s)",
        409,
      );

    return toPublicUser(await usersRepository.delete(userId));
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

import { AppError } from "../types";
import { users2FARepository } from "../repositories";
import {
  Users2FA,
  CreateUsers2FAPayload,
  UpdateUsers2FAPayload,
} from "../schemas";

export const users2FAService = {
  async getAll(): Promise<Users2FA[]> {
    return users2FARepository.findAll();
  },

  async getById(id: number): Promise<Users2FA> {
    return users2FARepository.findById(id);
  },

  async create(data: CreateUsers2FAPayload): Promise<Users2FA> {
    const exstingUser2FA: Users2FA | null =
      await users2FARepository.findByUserId(data.user_id);
    if (exstingUser2FA) {
      throw new AppError("2FA record already exists for this user", 400);
    }

    return users2FARepository.create(data);
  },

  async update(id: number, data: UpdateUsers2FAPayload): Promise<Users2FA> {
    const existing: Users2FA = await users2FARepository.findById(id);
    if (!existing) throw new AppError("2FA record not found", 404);

    return users2FARepository.update(id, data);
  },

  async delete(id: number): Promise<Users2FA> {
    const existing: Users2FA = await users2FARepository.findById(id);
    if (!existing) throw new AppError("2FA record not found", 404);

    return users2FARepository.delete(id);
  },
};

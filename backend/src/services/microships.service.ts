import { AppError } from "../types";
import { animalsRepository, microshipsRepository } from "../repositories";
import { Microship, CreateMicroshipPayload, UpdateMicroshipPayload } from "../schemas";

export const microshipService = {
  async getAll(callerId: number, role: string): Promise<Microship[]> {
    if (role === "admin") return microshipsRepository.findAll();
    return microshipsRepository.findByUserId(callerId);
  },

  async getById(microshipId: number, callerId: number, role: string): Promise<Microship> {
    const microship = await microshipsRepository.findById(microshipId);
    if (!microship) throw new AppError("Microship not found", 404);
    if (role === "user" && microship.user_id !== callerId) throw new AppError("Access denied", 403);
    return microship;
  },

  async getByUserId(userId: number): Promise<Microship[]> {
    return microshipsRepository.findByUserId(userId);
  },

  async create(data: CreateMicroshipPayload & { user_id: number }): Promise<Microship> {
    return microshipsRepository.create(data);
  },

  async update(microshipId: number, data: UpdateMicroshipPayload, callerId: number, role: string): Promise<Microship> {
    const existingMicroship: Microship = await microshipsRepository.findById(microshipId);
    if (!existingMicroship) throw new AppError("Microship not found", 404);
    if (role === "user" && existingMicroship.user_id !== callerId) throw new AppError("Access denied", 403);

    return microshipsRepository.update(microshipId, data);
  },

  async delete(microshipId: number, callerId: number, role: string): Promise<Microship> {
    const existingMicroship: Microship = await microshipsRepository.findById(microshipId);
    if (!existingMicroship) throw new AppError("Microship not found", 404);
    if (role === "user" && existingMicroship.user_id !== callerId) throw new AppError("Access denied", 403);

    const existingAnimal = await animalsRepository.findByMicroshipId(existingMicroship.id);
    if (existingAnimal.length !== 0) throw new AppError("Cannot delete microship: animal associated", 409);

    return microshipsRepository.delete(microshipId);
  },
};

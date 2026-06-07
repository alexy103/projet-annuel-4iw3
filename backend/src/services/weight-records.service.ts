import { AppError } from "../types";
import { animalsRepository, weightRecordsRepository } from "../repositories";
import { Animal, WeightRecord, CreateWeightRecordPayload, UpdateWeightRecordPayload } from "../schemas";

function assertAnimalAccess(animal: Animal, callerId: number, role: string): void {
  if (role === "admin") return;
  if (role === "user" && animal.user_id !== callerId) throw new AppError("Access denied", 403);
}

export const weightRecordService = {
  async getAll(callerId: number, role: string): Promise<WeightRecord[]> {
    if (role === "admin") return weightRecordsRepository.findAll();
    return weightRecordsRepository.findByUserId(callerId);
  },

  async getById(weightRecordId: number, callerId: number, role: string): Promise<WeightRecord> {
    const record = await weightRecordsRepository.findById(weightRecordId);
    if (!record) throw new AppError("Weight record not found", 404);
    if (role !== "admin") {
      const animal = await animalsRepository.findById(record.animal_id);
      assertAnimalAccess(animal, callerId, role);
    }
    return record;
  },

  async getByAnimalId(animalId: number, callerId: number, role: string): Promise<WeightRecord[]> {
    if (role !== "admin") {
      const animal = await animalsRepository.findById(animalId);
      if (!animal) throw new AppError("Animal not found", 404);
      assertAnimalAccess(animal, callerId, role);
    }
    return weightRecordsRepository.findByAnimalId(animalId);
  },

  async create(data: CreateWeightRecordPayload, callerId: number, role: string): Promise<WeightRecord> {
    const existingAnimal: Animal = await animalsRepository.findById(data.animal_id);
    if (!existingAnimal) throw new AppError("Animal not found", 404);
    assertAnimalAccess(existingAnimal, callerId, role);
    return weightRecordsRepository.create(data);
  },

  async update(weightRecordId: number, data: UpdateWeightRecordPayload, callerId: number, role: string): Promise<WeightRecord> {
    const existingRecord: WeightRecord = await weightRecordsRepository.findById(weightRecordId);
    if (!existingRecord) throw new AppError("Weight record not found", 404);
    if (role !== "admin") {
      const animal = await animalsRepository.findById(existingRecord.animal_id);
      assertAnimalAccess(animal, callerId, role);
    }

    if (data.animal_id) {
      const existingAnimal: Animal = await animalsRepository.findById(data.animal_id);
      if (!existingAnimal) throw new AppError("Animal not found", 404);
    }

    return weightRecordsRepository.update(weightRecordId, data);
  },

  async delete(weightRecordId: number, callerId: number, role: string): Promise<WeightRecord> {
    const existingRecord: WeightRecord = await weightRecordsRepository.findById(weightRecordId);
    if (!existingRecord) throw new AppError("Weight record not found", 404);
    if (role !== "admin") {
      const animal = await animalsRepository.findById(existingRecord.animal_id);
      assertAnimalAccess(animal, callerId, role);
    }

    return weightRecordsRepository.delete(weightRecordId);
  },
};

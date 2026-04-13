import { AppError } from "../types";
import { animalsRepository, treatmentRemindersRepository, treatmentsRepository } from "../repositories";
import { Animal, Treatment, CreateTreatmentPayload, UpdateTreatmentPayload } from "../schemas";

function assertAnimalAccess(animal: Animal, callerId: number, role: string): void {
  if (role === "admin") return;
  if (role === "user" && animal.user_id !== callerId) throw new AppError("Access denied", 403);
  if (role === "clinic" && !animal.is_shared) throw new AppError("Access denied", 403);
}

export const treatmentService = {
  async getAll(callerId: number, role: string): Promise<Treatment[]> {
    if (role === "admin") return treatmentsRepository.findAll();
    if (role === "user") return treatmentsRepository.findByUserId(callerId);
    // clinic: all treatments for shared animals
    return treatmentsRepository.findAll();
  },

  async getById(treatmentId: number, callerId: number, role: string): Promise<Treatment> {
    const treatment = await treatmentsRepository.findById(treatmentId);
    if (!treatment) throw new AppError("Treatment not found", 404);
    if (role !== "admin") {
      const animal = await animalsRepository.findById(treatment.animal_id);
      assertAnimalAccess(animal, callerId, role);
    }
    return treatment;
  },

  async getByMedicineId(medicineId: number): Promise<Treatment[]> {
    return treatmentsRepository.findByMedicineId(medicineId);
  },

  async getByAnimalId(animalId: number, callerId: number, role: string): Promise<Treatment[]> {
    if (role !== "admin") {
      const animal = await animalsRepository.findById(animalId);
      if (!animal) throw new AppError("Animal not found", 404);
      assertAnimalAccess(animal, callerId, role);
    }
    return treatmentsRepository.findByAnimalId(animalId);
  },

  async getByTreatmentTypeId(typeId: number): Promise<Treatment[]> {
    return treatmentsRepository.findByTreatmentTypeId(typeId);
  },

  async create(data: CreateTreatmentPayload): Promise<Treatment> {
    return treatmentsRepository.create(data);
  },

  async update(treatmentId: number, data: UpdateTreatmentPayload, callerId: number, role: string): Promise<Treatment> {
    const existingTreatment: Treatment = await treatmentsRepository.findById(treatmentId);
    if (!existingTreatment) throw new AppError("Treatment not found", 404);
    if (role !== "admin") {
      const animal = await animalsRepository.findById(existingTreatment.animal_id);
      assertAnimalAccess(animal, callerId, role);
    }

    return treatmentsRepository.update(treatmentId, data);
  },

  async delete(treatmentId: number, callerId: number, role: string): Promise<Treatment> {
    const existingTreatment: Treatment = await treatmentsRepository.findById(treatmentId);
    if (!existingTreatment) throw new AppError("Treatment not found", 404);
    if (role !== "admin") {
      const animal = await animalsRepository.findById(existingTreatment.animal_id);
      assertAnimalAccess(animal, callerId, role);
    }

    const remindersCount = (await treatmentRemindersRepository.findByTreatmentId(treatmentId)).length;
    if (remindersCount > 0) throw new AppError("Cannot delete treatment: reminders associated", 409);

    return treatmentsRepository.delete(treatmentId);
  },
};

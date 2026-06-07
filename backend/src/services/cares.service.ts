import { AppError } from "../types";
import { animalsRepository, caresRepository, treatmentTypesRepository } from "../repositories";
import { Animal, Care, CreateCarePayload, TreatmentType, UpdateCarePayload } from "../schemas";

function assertAnimalAccess(animal: Animal, callerId: number, role: string): void {
  if (role === "admin") return;
  if (role === "user" && animal.user_id !== callerId) throw new AppError("Access denied", 403);
}

export const careService = {
  async getAll(callerId: number, role: string): Promise<Care[]> {
    if (role === "admin") return caresRepository.findAll();
    return caresRepository.findByUserId(callerId);
  },

  async getById(careId: number, callerId: number, role: string): Promise<Care> {
    const care = await caresRepository.findById(careId);
    if (!care) throw new AppError("Care not found", 404);
    if (role !== "admin") {
      const animal = await animalsRepository.findById(care.animal_id);
      assertAnimalAccess(animal, callerId, role);
    }
    return care;
  },

  async getByAnimalId(animalId: number, callerId: number, role: string): Promise<Care[]> {
    if (role !== "admin") {
      const animal = await animalsRepository.findById(animalId);
      if (!animal) throw new AppError("Animal not found", 404);
      assertAnimalAccess(animal, callerId, role);
    }
    return caresRepository.findByAnimalId(animalId);
  },

  async getByTreatmentTypeId(treatmentTypeId: number): Promise<Care[]> {
    return caresRepository.findByTreatmentTypeId(treatmentTypeId);
  },

  async create(data: CreateCarePayload, callerId: number, role: string): Promise<Care> {
    const existingAnimal: Animal = await animalsRepository.findById(data.animal_id);
    if (!existingAnimal) throw new AppError("Animal not found", 404);
    assertAnimalAccess(existingAnimal, callerId, role);

    const existingTreatmentType: TreatmentType = await treatmentTypesRepository.findById(data.treatment_type_id);
    if (!existingTreatmentType) throw new AppError("TreatmentType not found", 404);
    if (role === "user" && existingTreatmentType.user_id !== callerId) throw new AppError("Access denied", 403);

    return caresRepository.create(data);
  },

  async update(careId: number, data: UpdateCarePayload, callerId: number, role: string): Promise<Care> {
    const existingCare: Care = await caresRepository.findById(careId);
    if (!existingCare) throw new AppError("Care not found", 404);
    if (role !== "admin") {
      const animal = await animalsRepository.findById(existingCare.animal_id);
      assertAnimalAccess(animal, callerId, role);
    }

    if (data.animal_id) {
      const existingAnimal: Animal = await animalsRepository.findById(data.animal_id);
      if (!existingAnimal) throw new AppError("Animal not found", 404);
    }

    if (data.treatment_type_id) {
      const existingTreatmentType: TreatmentType = await treatmentTypesRepository.findById(data.treatment_type_id);
      if (!existingTreatmentType) throw new AppError("TreatmentType not found", 404);
    }

    return caresRepository.update(careId, data);
  },

  async delete(careId: number, callerId: number, role: string): Promise<Care> {
    const existingCare: Care = await caresRepository.findById(careId);
    if (!existingCare) throw new AppError("Care not found", 404);
    if (role !== "admin") {
      const animal = await animalsRepository.findById(existingCare.animal_id);
      assertAnimalAccess(animal, callerId, role);
    }

    return caresRepository.delete(careId);
  },
};

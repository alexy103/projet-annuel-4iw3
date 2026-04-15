import { AppError } from "../types";
import { treatmentTypesRepository, treatmentsRepository } from "../repositories";
import { TreatmentType, CreateTreatmentTypePayload, UpdateTreatmentTypePayload } from "../schemas";

export const treatmentTypeService = {
  async getAll(callerId: number, role: string): Promise<TreatmentType[]> {
    if (role === "admin") return treatmentTypesRepository.findAll();
    return treatmentTypesRepository.findByUserId(callerId);
  },

  async getById(typeId: number, callerId: number, role: string): Promise<TreatmentType> {
    const type = await treatmentTypesRepository.findById(typeId);
    if (!type) throw new AppError("Treatment type not found", 404);
    if (role === "user" && type.user_id !== callerId) throw new AppError("Access denied", 403);
    return type;
  },

  async getByUserId(userId: number): Promise<TreatmentType[]> {
    return treatmentTypesRepository.findByUserId(userId);
  },

  async getByName(name: string): Promise<TreatmentType[]> {
    return treatmentTypesRepository.findByName(name);
  },

  async create(data: CreateTreatmentTypePayload & { user_id: number }): Promise<TreatmentType> {
    const duplicate = await treatmentTypesRepository.findExactByName(data.name, data.user_id);
    if (duplicate) throw new AppError("A treatment type with this name already exists", 409);

    return treatmentTypesRepository.create(data);
  },

  async update(typeId: number, data: UpdateTreatmentTypePayload, callerId: number, role: string): Promise<TreatmentType> {
    const existingType: TreatmentType = await treatmentTypesRepository.findById(typeId);
    if (!existingType) throw new AppError("Treatment type not found", 404);
    if (role === "user" && existingType.user_id !== callerId) throw new AppError("Access denied", 403);

    if (data.name) {
      const duplicate = await treatmentTypesRepository.findExactByName(data.name, callerId);
      if (duplicate && duplicate.id !== typeId)
        throw new AppError("A treatment type with this name already exists", 409);
    }

    return treatmentTypesRepository.update(typeId, data);
  },

  async delete(typeId: number, callerId: number, role: string): Promise<TreatmentType> {
    const existingType: TreatmentType = await treatmentTypesRepository.findById(typeId);
    if (!existingType) throw new AppError("Treatment type not found", 404);
    if (role === "user" && existingType.user_id !== callerId) throw new AppError("Access denied", 403);

    const treatmentsCount = await treatmentsRepository.findByTreatmentTypeId(typeId).then(t => t.length);
    if (treatmentsCount > 0)
      throw new AppError("Cannot delete treatment type: treatments associated", 409);

    return treatmentTypesRepository.delete(typeId);
  },
};

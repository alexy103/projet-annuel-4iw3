import { AppError } from "../types";
import { medicinesRepository, treatmentsRepository } from "../repositories";
import { Medicine, CreateMedicinePayload, UpdateMedicinePayload } from "../schemas";

export const medicineService = {
  async getAll(callerId: number, role: string): Promise<Medicine[]> {
    if (role === "admin") return medicinesRepository.findAll();
    return medicinesRepository.findByUserId(callerId);
  },

  async getById(medicineId: number, callerId: number, role: string): Promise<Medicine> {
    const medicine = await medicinesRepository.findById(medicineId);
    if (!medicine) throw new AppError("Medicine not found", 404);
    if (role === "user" && medicine.user_id !== callerId) throw new AppError("Access denied", 403);
    return medicine;
  },

  async getByUserId(userId: number): Promise<Medicine[]> {
    return medicinesRepository.findByUserId(userId);
  },

  async getByBrand(brand: string): Promise<Medicine[]> {
    return medicinesRepository.findByBrand(brand);
  },

  async create(data: CreateMedicinePayload & { user_id: number }): Promise<Medicine> {
    const duplicate = await medicinesRepository.findExactByBrand(data.brand, data.user_id);
    if (duplicate) throw new AppError("A medicine with this brand already exists", 409);

    return medicinesRepository.create(data);
  },

  async update(medicineId: number, data: UpdateMedicinePayload, callerId: number, role: string): Promise<Medicine> {
    const existingMedicine: Medicine = await medicinesRepository.findById(medicineId);
    if (!existingMedicine) throw new AppError("Medicine not found", 404);
    if (role === "user" && existingMedicine.user_id !== callerId) throw new AppError("Access denied", 403);

    if (data.brand) {
      const duplicate = await medicinesRepository.findExactByBrand(data.brand, callerId);
      if (duplicate && duplicate.id !== medicineId)
        throw new AppError("A medicine with this brand already exists", 409);
    }

    return medicinesRepository.update(medicineId, data);
  },

  async delete(medicineId: number, callerId: number, role: string): Promise<Medicine> {
    const existingMedicine: Medicine = await medicinesRepository.findById(medicineId);
    if (!existingMedicine) throw new AppError("Medicine not found", 404);
    if (role === "user" && existingMedicine.user_id !== callerId) throw new AppError("Access denied", 403);

    const treatmentsCount = (await treatmentsRepository.findByMedicineId(medicineId)).length;
    if (treatmentsCount > 0) throw new AppError("Cannot delete medicine: treatments associated", 409);

    return medicinesRepository.delete(medicineId);
  },
};

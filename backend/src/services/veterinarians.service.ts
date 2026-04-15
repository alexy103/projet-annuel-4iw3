import { AppError } from "../types";
import {
  veterinariansRepository,
  consultationsRepository,
  clinicsRepository,
  medicinesRepository
} from "../repositories";
import {Veterinarian, CreateVeterinarianPayload, UpdateVeterinarianPayload, Clinic, Medicine} from "../schemas";

export const veterinarianService = {
  async getAll(): Promise<Veterinarian[]> {
    return veterinariansRepository.findAll();
  },

  async getById(veterinarianId: number): Promise<Veterinarian> {
    return veterinariansRepository.findById(veterinarianId);
  },

  async getByClinicId(clinicId: number): Promise<Veterinarian[]> {
    return veterinariansRepository.findByClinicId(clinicId);
  },

  async getByFullName(
    firstName: string | undefined,
    lastName: string | undefined,
  ): Promise<Veterinarian[]> {
    return veterinariansRepository.findByFullName(firstName, lastName);
  },

  async create(data: CreateVeterinarianPayload): Promise<Veterinarian> {
    const existingClinic: Clinic = await clinicsRepository.findById(data.clinic_id);
    if (!existingClinic) {
      throw new AppError("Clinic not found", 404);
    }

    const duplicate = await veterinariansRepository.findExactByFullNameAndClinicId(data.first_name, data.last_name, data.clinic_id);
    if (duplicate) throw new AppError("Veterinarian already exists", 409);

    return veterinariansRepository.create(data);
  },

  async update(veterinarianId: number, data: UpdateVeterinarianPayload): Promise<Veterinarian> {
    const existingVeterinarian: Veterinarian = await veterinariansRepository.findById(veterinarianId);
    if (!existingVeterinarian) throw new AppError("Veterinarian not found", 404);

    if (data.clinic_id) {
      const existingClinic: Clinic = await clinicsRepository.findById(data.clinic_id);
      if (!existingClinic) throw new AppError("Clinic not found", 404);
    }

    const finalFirstName = data.first_name ?? existingVeterinarian.first_name;
    const finalLastName = data.last_name ?? existingVeterinarian.last_name;
    const finalClinicId = data.clinic_id ?? existingVeterinarian.clinic_id;

    const duplicate = await veterinariansRepository.findExactByFullNameAndClinicId(finalFirstName, finalLastName, finalClinicId);
    if (duplicate && duplicate.id !== veterinarianId) throw new AppError("Veterinarian already exists", 409);

    return veterinariansRepository.update(veterinarianId, data);
  },

  async setIsPresent(veterinarianId: number, isPresent: boolean): Promise<Veterinarian> {
    const existingVeterinarian: Veterinarian = await veterinariansRepository.findById(veterinarianId);
    if (!existingVeterinarian) throw new AppError("Veterinarian not found", 404);

    if (existingVeterinarian.is_present && existingVeterinarian.is_present == isPresent) {
      throw new AppError("Veterinarian already activated", 409);
    }
    if (
        !existingVeterinarian.is_present &&
        existingVeterinarian.is_present == isPresent
    ) {
      throw new AppError("Veterinarian already desactivated", 409);
    }

    return veterinariansRepository.updateIsPresent(veterinarianId, isPresent);
  },

  async delete(veterinarianId: number): Promise<Veterinarian> {
    const existingVeterinarian: Veterinarian = await veterinariansRepository.findById(veterinarianId);
    if (!existingVeterinarian) throw new AppError("Veterinarian not found", 404);

    const consultationsCount: number = await consultationsRepository
      .findByVeterinarianId(veterinarianId).then(c => c.length);
    
    if (consultationsCount > 0)
      throw new AppError("Cannot delete veterinarian: consultations associated", 409);

    return veterinariansRepository.delete(veterinarianId);
  },
};


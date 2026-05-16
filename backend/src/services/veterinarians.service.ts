import { AppError } from "../types";
import {
  veterinariansRepository,
  consultationsRepository,
  clinicsRepository,
  medicinesRepository
} from "../repositories";
import {Veterinarian, CreateVeterinarianPayload, UpdateVeterinarianPayload, Clinic, Medicine} from "../schemas";

export const veterinarianService = {
  async getAll(role: string, callerClinicId?: number): Promise<Veterinarian[]> {
    if (role === "clinic") return veterinariansRepository.findByClinicId(callerClinicId!);
    return veterinariansRepository.findAll();
  },

  async getById(veterinarianId: number, role: string, callerClinicId?: number): Promise<Veterinarian> {
    const vet = await veterinariansRepository.findById(veterinarianId);
    if (!vet) throw new AppError("Veterinarian not found", 404);
    if (role === "clinic" && vet.clinic_id !== callerClinicId) throw new AppError("Access denied", 403);
    return vet;
  },

  async getByClinicId(clinicId: number, role: string, callerClinicId?: number): Promise<Veterinarian[]> {
    if (role === "clinic" && clinicId !== callerClinicId) throw new AppError("Access denied", 403);
    return veterinariansRepository.findByClinicId(clinicId);
  },

  async getByFullName(
    firstName: string | undefined,
    lastName: string | undefined,
    role: string,
    callerClinicId?: number,
  ): Promise<Veterinarian[]> {
    const vets = await veterinariansRepository.findByFullName(firstName, lastName);
    if (role === "clinic") return vets.filter(v => v.clinic_id === callerClinicId);
    return vets;
  },

  async create(data: CreateVeterinarianPayload, role: string, callerClinicId?: number): Promise<Veterinarian> {
    if (role === "clinic" && data.clinic_id !== callerClinicId) throw new AppError("Access denied", 403);

    const existingClinic: Clinic = await clinicsRepository.findById(data.clinic_id);
    if (!existingClinic) {
      throw new AppError("Clinic not found", 404);
    }

    const duplicate = await veterinariansRepository.findExactByFullNameAndClinicId(data.first_name, data.last_name, data.clinic_id);
    if (duplicate) throw new AppError("Veterinarian already exists", 409);

    return veterinariansRepository.create(data);
  },

  async update(veterinarianId: number, data: UpdateVeterinarianPayload, role: string, callerClinicId?: number): Promise<Veterinarian> {
    const existingVeterinarian: Veterinarian = await veterinariansRepository.findById(veterinarianId);
    if (!existingVeterinarian) throw new AppError("Veterinarian not found", 404);

    if (role === "clinic" && existingVeterinarian.clinic_id !== callerClinicId) throw new AppError("Access denied", 403);
    if (role === "clinic" && data.clinic_id !== undefined && data.clinic_id !== callerClinicId) throw new AppError("Access denied", 403);

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

  async setIsPresent(veterinarianId: number, isPresent: boolean, role: string, callerClinicId?: number): Promise<Veterinarian> {
    const existingVeterinarian: Veterinarian = await veterinariansRepository.findById(veterinarianId);
    if (!existingVeterinarian) throw new AppError("Veterinarian not found", 404);

    if (role === "clinic" && existingVeterinarian.clinic_id !== callerClinicId) throw new AppError("Access denied", 403);

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

  async delete(veterinarianId: number, role: string, callerClinicId?: number): Promise<Veterinarian> {
    const existingVeterinarian: Veterinarian = await veterinariansRepository.findById(veterinarianId);
    if (!existingVeterinarian) throw new AppError("Veterinarian not found", 404);

    if (role === "clinic" && existingVeterinarian.clinic_id !== callerClinicId) throw new AppError("Access denied", 403);

    const consultationsCount: number = await consultationsRepository
      .findByVeterinarianId(veterinarianId).then(c => c.length);
    
    if (consultationsCount > 0)
      throw new AppError("Cannot delete veterinarian: consultations associated", 409);

    return veterinariansRepository.delete(veterinarianId);
  },
};


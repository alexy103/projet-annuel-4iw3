import { AppError } from "../types";
import {
  appointmentsRepository,
  clinicsRepository,
  veterinariansRepository
} from "../repositories";
import {Clinic, CreateClinicPayload, UpdateClinicPayload} from "../schemas";

export const clinicService = {
  async getAll(role: string, callerClinicId?: number): Promise<Clinic[]> {
    if (role === "clinic") {
      const clinic = await clinicsRepository.findById(callerClinicId!);
      return clinic ? [clinic] : [];
    }
    return clinicsRepository.findAll();
  },

  async getById(clinicId: number, role: string, callerClinicId?: number): Promise<Clinic> {
    if (role === "clinic" && clinicId !== callerClinicId) throw new AppError("Access denied", 403);
    return clinicsRepository.findById(clinicId);
  },

  async getByName(name: string): Promise<Clinic[]> {
    return clinicsRepository.findByName(name);
  },

  async getByCriteria(
    phoneNumber: string | undefined,
    postcode: string | undefined,
    city: string | undefined,
    address: string | undefined,
  ): Promise<Clinic[]> {
    return clinicsRepository.findByCriteria(phoneNumber, postcode, city, address);
  },

  async create(data: CreateClinicPayload): Promise<Clinic> {
    const duplicate : Clinic[] = await clinicsRepository.findByName(data.name);
    if(duplicate.length !== 0) throw new AppError("Clinic already exists", 404);

    return clinicsRepository.create(data);
  },

  async update(clinicId: number, data: UpdateClinicPayload, role: string, callerClinicId?: number): Promise<Clinic> {
    if (role === "clinic" && clinicId !== callerClinicId) throw new AppError("Access denied", 403);

    const existingClinic: Clinic = await clinicsRepository.findById(clinicId);
    if (!existingClinic) throw new AppError("Clinic not found", 404);

    if (data.name) {
      const duplicate : Clinic[] = await clinicsRepository.findByName(data.name);
      if (duplicate && duplicate[0]?.id !== clinicId)
        throw new AppError("A clinics with this name already exists", 409);
    }

    return clinicsRepository.update(clinicId, data);
  },

  async delete(clinicId: number): Promise<Clinic> {
    const existingClinic: Clinic = await clinicsRepository.findById(clinicId);
    if (!existingClinic) throw new AppError("Clinic not found", 404);

    const veterinariansCount = (await veterinariansRepository.findByClinicId(clinicId)).length;
    const appointmentsCount = (await appointmentsRepository.findByClinicId(clinicId)).length;

    if (veterinariansCount > 0) throw new AppError("Cannot delete clinic: veterinarians associated", 409);
    if (appointmentsCount > 0) throw new AppError("Cannot delete clinic: appointments associated", 409);

    return clinicsRepository.delete(clinicId);
  },
};


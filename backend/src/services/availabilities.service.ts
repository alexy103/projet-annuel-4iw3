import { AppError } from "../types";
import { availabilitiesRepository, clinicsRepository } from "../repositories";
import { Availability, CreateAvailabilityPayload, UpdateAvailabilityPayload } from "../schemas";

export const availabilityService = {
  async getAll(role: string, callerClinicId?: number): Promise<Availability[]> {
    if (role === "clinic") return availabilitiesRepository.findByClinicId(callerClinicId!);
    return availabilitiesRepository.findAll();
  },

  async getById(availabilityId: number, role: string, callerClinicId?: number): Promise<Availability> {
    const availability = await availabilitiesRepository.findById(availabilityId);
    if (!availability) throw new AppError("Availability not found", 404);
    if (role === "clinic" && availability.clinic_id !== callerClinicId) throw new AppError("Access denied", 403);
    return availability;
  },

  async getByClinicId(clinicId: number, role: string, callerClinicId?: number): Promise<Availability[]> {
    if (role === "clinic" && clinicId !== callerClinicId) throw new AppError("Access denied", 403);
    return availabilitiesRepository.findByClinicId(clinicId);
  },

  async create(data: CreateAvailabilityPayload, role: string, callerClinicId?: number): Promise<Availability> {
    if (role === "clinic" && data.clinic_id !== callerClinicId) throw new AppError("Access denied", 403);

    const existingClinic = await clinicsRepository.findById(data.clinic_id);
    if (!existingClinic) throw new AppError("Clinic not found", 404);

    return availabilitiesRepository.create(data);
  },

  async update(availabilityId: number, data: UpdateAvailabilityPayload, role: string, callerClinicId?: number): Promise<Availability> {
    const existingAvailability: Availability = await availabilitiesRepository.findById(availabilityId);
    if (!existingAvailability) throw new AppError("Availability not found", 404);

    if (role === "clinic" && existingAvailability.clinic_id !== callerClinicId) throw new AppError("Access denied", 403);
    if (role === "clinic" && data.clinic_id !== undefined && data.clinic_id !== callerClinicId) throw new AppError("Access denied", 403);

    if (data.clinic_id) {
      const existingClinic = await clinicsRepository.findById(data.clinic_id);
      if (!existingClinic) throw new AppError("Clinic not found", 404);
    }

    return availabilitiesRepository.update(availabilityId, data);
  },

  async updateSlotRules(availabilityId: number, slotRules: unknown, role: string, callerClinicId?: number): Promise<Availability> {
    const existingAvailability: Availability = await availabilitiesRepository.findById(availabilityId);
    if (!existingAvailability) throw new AppError("Availability not found", 404);

    if (role === "clinic" && existingAvailability.clinic_id !== callerClinicId) throw new AppError("Access denied", 403);

    return availabilitiesRepository.updateSlotRules(availabilityId, slotRules);
  },

  async delete(availabilityId: number, role: string, callerClinicId?: number): Promise<Availability> {
    const existingAvailability: Availability = await availabilitiesRepository.findById(availabilityId);
    if (!existingAvailability) throw new AppError("Availability not found", 404);

    if (role === "clinic" && existingAvailability.clinic_id !== callerClinicId) throw new AppError("Access denied", 403);

    return availabilitiesRepository.delete(availabilityId);
  },
};

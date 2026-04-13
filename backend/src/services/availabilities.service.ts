import { AppError } from "../types";
import { availabilitiesRepository, clinicsRepository } from "../repositories";
import { Availability, CreateAvailabilityPayload, UpdateAvailabilityPayload } from "../schemas";

export const availabilityService = {
  async getAll(): Promise<Availability[]> {
    return availabilitiesRepository.findAll();
  },

  async getById(availabilityId: number): Promise<Availability> {
    return availabilitiesRepository.findById(availabilityId);
  },

  async getByClinicId(clinicId: number): Promise<Availability[]> {
    return availabilitiesRepository.findByClinicId(clinicId);
  },

  async create(data: CreateAvailabilityPayload): Promise<Availability> {
    const existingClinic = await clinicsRepository.findById(data.clinic_id);
    if (!existingClinic) throw new AppError("Clinic not found", 404);

    return availabilitiesRepository.create(data);
  },

  async update(availabilityId: number, data: UpdateAvailabilityPayload): Promise<Availability> {
    const existingAvailability: Availability = await availabilitiesRepository.findById(availabilityId);
    if (!existingAvailability) throw new AppError("Availability not found", 404);

    if (data.clinic_id) {
      const existingClinic = await clinicsRepository.findById(data.clinic_id);
      if (!existingClinic) throw new AppError("Clinic not found", 404);
    }

    return availabilitiesRepository.update(availabilityId, data);
  },

  async updateSlotRules(availabilityId: number, slotRules: unknown): Promise<Availability> {
    const existingAvailability: Availability = await availabilitiesRepository.findById(availabilityId);
    if (!existingAvailability) throw new AppError("Availability not found", 404);

    return availabilitiesRepository.updateSlotRules(availabilityId, slotRules);
  },

  async delete(availabilityId: number): Promise<Availability> {
    const existingAvailability: Availability = await availabilitiesRepository.findById(availabilityId);
    if (!existingAvailability) throw new AppError("Availability not found", 404);

    return availabilitiesRepository.delete(availabilityId);
  },
};


import { AppError } from "../types";
import { appointmentReasonsRepository, appointmentsRepository } from "../repositories";
import { AppointmentReason, CreateAppointmentReasonPayload, UpdateAppointmentReasonPayload } from "../schemas";

export const appointmentReasonService = {
  async getAll(): Promise<AppointmentReason[]> {
    return appointmentReasonsRepository.findAll();
  },

  async getById(reasonId: number): Promise<AppointmentReason> {
    return appointmentReasonsRepository.findById(reasonId);
  },

  async getByLabel(label: string): Promise<AppointmentReason[]> {
    return appointmentReasonsRepository.findByLabel(label);
  },

  async create(data: CreateAppointmentReasonPayload): Promise<AppointmentReason> {
    const duplicate = await appointmentReasonsRepository.findExactByLabel(data.label);
    if (duplicate) throw new AppError("Appointment reason already exists", 409);

    return appointmentReasonsRepository.create(data);
  },

  async update(reasonId: number, data: UpdateAppointmentReasonPayload): Promise<AppointmentReason> {
    const existingReason: AppointmentReason = await appointmentReasonsRepository.findById(reasonId);
    if (!existingReason) throw new AppError("Appointment reason not found", 404);

    if (data.label) {
      const duplicate = await appointmentReasonsRepository.findExactByLabel(data.label);
      if (duplicate && duplicate.id !== reasonId)
        throw new AppError("Appointment reason already exists", 409);
    }

    return appointmentReasonsRepository.update(reasonId, data);
  },

  async delete(reasonId: number): Promise<AppointmentReason> {
    const existingReason: AppointmentReason = await appointmentReasonsRepository.findById(reasonId);
    if (!existingReason) throw new AppError("Appointment reason not found", 404);

    const appointmentCount = (await appointmentsRepository.findByReasonId(reasonId)).length;
    if (appointmentCount > 0)
      throw new AppError("Cannot delete reason: appointments associated", 409);

    return appointmentReasonsRepository.delete(reasonId);
  },
};

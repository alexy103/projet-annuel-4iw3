import { AppError } from "../types";
import {
  appointmentsRepository,
  consultationsRepository,
  veterinariansRepository
} from "../repositories";
import {
  Appointment,
  Consultation,
  CreateConsultationPayload,
  UpdateConsultationPayload,
  Veterinarian
} from "../schemas";

export const consultationService = {
  async getAll(): Promise<Consultation[]> {
    return consultationsRepository.findAll();
  },

  async getById(consultationId: number): Promise<Consultation> {
    return consultationsRepository.findById(consultationId);
  },

  async getByAppointmentId(appointmentId: number): Promise<Consultation> {
    const consultation : Consultation | null = await consultationsRepository.findByAppointmentId(appointmentId);
    if(!consultation) {
      throw new AppError("Consultation not found", 404);
    }
    return consultation;
  },

  async getByVeterinarianId(veterinarianId: number): Promise<Consultation[]> {
    return consultationsRepository.findByVeterinarianId(veterinarianId);
  },

  async create(data: CreateConsultationPayload): Promise<Consultation> {
    const existingVeterinarian: Veterinarian = await veterinariansRepository.findById(data.veterinarian_id);
    if (!existingVeterinarian) throw new AppError("Veterinarian not found", 404);

    const existingAppointment: Appointment = await appointmentsRepository.findById(data.appointment_id);
    if (!existingAppointment) throw new AppError("Appointment not found", 404);

    const existingConsultation : Consultation | null = await consultationsRepository.findByAppointmentId(data.appointment_id);
    if (existingConsultation) throw new AppError("Consultation already exist", 404);

    return consultationsRepository.create(data);
  },

  async update(consultationId: number, data: UpdateConsultationPayload): Promise<Consultation> {
    const existingConsultation: Consultation = await consultationsRepository.findById(consultationId);
    if (!existingConsultation) throw new AppError("Consultation not found", 404);

    if (data.veterinarian_id) {
      const existingVeterinarian: Veterinarian = await veterinariansRepository.findById(data.veterinarian_id);
      if (!existingVeterinarian) throw new AppError("Veterinarian not found", 404);
    }

    if (data.appointment_id) {
      const existingAppointment: Appointment = await appointmentsRepository.findById(data.appointment_id);
      if (!existingAppointment) throw new AppError("Appointment not found", 404);
    }

    return consultationsRepository.update(consultationId, data);
  },

  async delete(consultationId: number): Promise<Consultation> {
    const existingConsultation: Consultation = await consultationsRepository.findById(consultationId);
    if (!existingConsultation) throw new AppError("Consultation not found", 404);

    return consultationsRepository.delete(consultationId);
  },
};


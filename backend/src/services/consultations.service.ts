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
  async getAll(callerId: number, role: string, callerClinicId?: number): Promise<Consultation[]> {
    if (role === "clinic") return consultationsRepository.findByClinicId(callerClinicId!);
    if (role === "user") return consultationsRepository.findByUserId(callerId);
    return consultationsRepository.findAll();
  },

  async getById(consultationId: number, callerId: number, role: string, callerClinicId?: number): Promise<Consultation> {
    const consultation = await consultationsRepository.findById(consultationId);
    if (!consultation) throw new AppError("Consultation not found", 404);
    if (role === "clinic") {
      const vet: Veterinarian = await veterinariansRepository.findById(consultation.veterinarian_id);
      if (vet.clinic_id !== callerClinicId) throw new AppError("Access denied", 403);
    }
    if (role === "user") {
      const appointment = await appointmentsRepository.findById(consultation.appointment_id);
      if (!appointment || appointment.user_id !== callerId) throw new AppError("Access denied", 403);
    }
    return consultation;
  },

  async getByAppointmentId(appointmentId: number, callerId: number, role: string, callerClinicId?: number): Promise<Consultation> {
    const consultation : Consultation | null = await consultationsRepository.findByAppointmentId(appointmentId);
    if (!consultation) throw new AppError("Consultation not found", 404);
    if (role === "clinic") {
      const vet: Veterinarian = await veterinariansRepository.findById(consultation.veterinarian_id);
      if (vet.clinic_id !== callerClinicId) throw new AppError("Access denied", 403);
    }
    if (role === "user") {
      const appointment = await appointmentsRepository.findById(appointmentId);
      if (!appointment || appointment.user_id !== callerId) throw new AppError("Access denied", 403);
    }
    return consultation;
  },

  async getByVeterinarianId(veterinarianId: number, role: string, callerClinicId?: number): Promise<Consultation[]> {
    if (role === "clinic") {
      const vet: Veterinarian = await veterinariansRepository.findById(veterinarianId);
      if (!vet) throw new AppError("Veterinarian not found", 404);
      if (vet.clinic_id !== callerClinicId) throw new AppError("Access denied", 403);
    }
    return consultationsRepository.findByVeterinarianId(veterinarianId);
  },

  async create(data: CreateConsultationPayload, role: string, callerClinicId?: number): Promise<Consultation> {
    const existingVeterinarian: Veterinarian = await veterinariansRepository.findById(data.veterinarian_id);
    if (!existingVeterinarian) throw new AppError("Veterinarian not found", 404);

    if (role === "clinic" && existingVeterinarian.clinic_id !== callerClinicId) throw new AppError("Access denied", 403);

    const existingAppointment: Appointment = await appointmentsRepository.findById(data.appointment_id);
    if (!existingAppointment) throw new AppError("Appointment not found", 404);

    if (role === "clinic" && existingAppointment.clinic_id !== callerClinicId) throw new AppError("Access denied", 403);

    const existingConsultation : Consultation | null = await consultationsRepository.findByAppointmentId(data.appointment_id);
    if (existingConsultation) throw new AppError("Consultation already exist", 404);

    return consultationsRepository.create(data);
  },

  async update(consultationId: number, data: UpdateConsultationPayload, role: string, callerClinicId?: number): Promise<Consultation> {
    const existingConsultation: Consultation = await consultationsRepository.findById(consultationId);
    if (!existingConsultation) throw new AppError("Consultation not found", 404);

    if (role === "clinic") {
      const currentVet: Veterinarian = await veterinariansRepository.findById(existingConsultation.veterinarian_id);
      if (currentVet.clinic_id !== callerClinicId) throw new AppError("Access denied", 403);
    }

    if (data.veterinarian_id) {
      const existingVeterinarian: Veterinarian = await veterinariansRepository.findById(data.veterinarian_id);
      if (!existingVeterinarian) throw new AppError("Veterinarian not found", 404);
      if (role === "clinic" && existingVeterinarian.clinic_id !== callerClinicId) throw new AppError("Access denied", 403);
    }

    if (data.appointment_id) {
      const existingAppointment: Appointment = await appointmentsRepository.findById(data.appointment_id);
      if (!existingAppointment) throw new AppError("Appointment not found", 404);
      if (role === "clinic" && existingAppointment.clinic_id !== callerClinicId) throw new AppError("Access denied", 403);
    }

    return consultationsRepository.update(consultationId, data);
  },

  async delete(consultationId: number, role: string, callerClinicId?: number): Promise<Consultation> {
    const existingConsultation: Consultation = await consultationsRepository.findById(consultationId);
    if (!existingConsultation) throw new AppError("Consultation not found", 404);

    if (role === "clinic") {
      const vet: Veterinarian = await veterinariansRepository.findById(existingConsultation.veterinarian_id);
      if (vet.clinic_id !== callerClinicId) throw new AppError("Access denied", 403);
    }

    return consultationsRepository.delete(consultationId);
  },
};

import { AppError } from "../types";
import {
  appointmentsRepository,
  consultationsRepository,
  usersRepository,
  animalsRepository,
  clinicsRepository,
  appointmentReasonsRepository,
} from "../repositories";
import {
  Appointment, CreateAppointmentPayload, UpdateAppointmentPayload, User, Animal, Clinic, AppointmentReason,
  Consultation
} from "../schemas";

export const appointmentService = {
  async getAll(callerId: number, role: string): Promise<Appointment[]> {
    if (role === "admin" || role === "clinic") return appointmentsRepository.findAll();
    return appointmentsRepository.findByUserId(callerId);
  },

  async getById(appointmentId: number, callerId: number, role: string): Promise<Appointment> {
    const appointment = await appointmentsRepository.findById(appointmentId);
    if (!appointment) throw new AppError("Appointment not found", 404);
    if (role === "user" && appointment.user_id !== callerId) throw new AppError("Access denied", 403);
    return appointment;
  },

  async getByUserId(userId: number): Promise<Appointment[]> {
    return appointmentsRepository.findByUserId(userId);
  },

  async getByAnimalId(animalId: number): Promise<Appointment[]> {
    return appointmentsRepository.findByAnimalId(animalId);
  },

  async getByClinicId(clinicId: number): Promise<Appointment[]> {
    return appointmentsRepository.findByClinicId(clinicId);
  },

  async getByReasonId(reasonId: number): Promise<Appointment[]> {
    return appointmentsRepository.findByReasonId(reasonId);
  },

  async create(data: CreateAppointmentPayload): Promise<Appointment> {
    const existingUser: User = await usersRepository.findById(data.user_id);
    if (!existingUser) throw new AppError("User not found", 404);

    const existingAnimal: Animal = await animalsRepository.findById(data.animal_id);
    if (!existingAnimal) throw new AppError("Animal not found", 404);

    const existingClinic: Clinic = await clinicsRepository.findById(data.clinic_id);
    if (!existingClinic) throw new AppError("Clinic not found", 404);

    const existingReason: AppointmentReason = await appointmentReasonsRepository.findById(data.reason_id);
    if (!existingReason) throw new AppError("Appointment reason not found", 404);

    return appointmentsRepository.create(data);
  },

  async update(appointmentId: number, data: UpdateAppointmentPayload): Promise<Appointment> {
    const existingAppointment: Appointment = await appointmentsRepository.findById(appointmentId);
    if (!existingAppointment) throw new AppError("Appointment not found", 404);

    if (data.user_id) {
      const existingUser: User = await usersRepository.findById(data.user_id);
      if (!existingUser) throw new AppError("User not found", 404);
    }

    if (data.animal_id) {
      const existingAnimal: Animal = await animalsRepository.findById(data.animal_id);
      if (!existingAnimal) throw new AppError("Animal not found", 404);
    }

    if (data.clinic_id) {
      const existingClinic: Clinic = await clinicsRepository.findById(data.clinic_id);
      if (!existingClinic) throw new AppError("Clinic not found", 404);
    }

    if (data.reason_id) {
      const existingReason: AppointmentReason = await appointmentReasonsRepository.findById(data.reason_id);
      if (!existingReason) throw new AppError("Appointment reason not found", 404);
    }

    return appointmentsRepository.update(appointmentId, data);
  },

  async setIsCompleted(appointmentId: number, isCompleted: boolean): Promise<Appointment> {
    const existingAppointment: Appointment = await appointmentsRepository.findById(appointmentId);
    if (!existingAppointment) throw new AppError("Appointment not found", 404);

    if (existingAppointment.is_completed && existingAppointment.is_completed == isCompleted) {
      throw new AppError("Appointment already completed", 409);
    }
    if (
        !existingAppointment.is_completed &&
        existingAppointment.is_completed == isCompleted
    ) {
      throw new AppError("Appointment already uncompleted", 409);
    }

    return appointmentsRepository.updateIsCompleted(appointmentId, isCompleted);
  },

  async delete(appointmentId: number): Promise<Appointment> {
    const existingAppointment: Appointment = await appointmentsRepository.findById(appointmentId);
    if (!existingAppointment) throw new AppError("Appointment not found", 404);

    const consultation : Consultation | null = await consultationsRepository.findByAppointmentId(appointmentId);

    if (consultation) throw new AppError("Cannot delete appointment: consultations associated", 409);

    return appointmentsRepository.delete(appointmentId);
  },
};



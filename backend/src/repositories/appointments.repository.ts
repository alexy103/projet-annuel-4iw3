import { db } from "../config";
import { AppError } from "../types";
import { Appointment, CreateAppointmentPayload, UpdateAppointmentPayload } from "../schemas";
import { BaseRepository } from "./base.repository";

class AppointmentRepository extends BaseRepository<Appointment, CreateAppointmentPayload, UpdateAppointmentPayload> {
  constructor() {
    super("appointments", "Appointment");
  }

  /**
   * Request to get all appointments by userId
   * @param userId
   */
  async findByUserId(userId: number): Promise<Appointment[]> {
    const result = await db.query<Appointment>(
      `SELECT * FROM ${this.table} WHERE user_id = $1`,
      [userId],
    );
    return result.rows;
  }

  /**
   * Request to get all appointments by animal id
   * @param animalId
   */
  async findByAnimalId(animalId: number): Promise<Appointment[]> {
    const result = await db.query<Appointment>(
      `SELECT * FROM ${this.table} WHERE animal_id = $1`,
      [animalId],
    );
    return result.rows;
  }

  /**
   * Request to get all appointments by clinic id
   * @param clinicId
   */
  async findByClinicId(clinicId: number): Promise<Appointment[]> {
    const result = await db.query<Appointment>(
      `SELECT * FROM ${this.table} WHERE clinic_id = $1`,
      [clinicId],
    );
    return result.rows;
  }

  /**
   * Request to get all appointments by reason id
   * @param reasonId
   */
  async findByReasonId(reasonId: number): Promise<Appointment[]> {
    const result = await db.query<Appointment>(
      `SELECT * FROM ${this.table} WHERE reason_id = $1`,
      [reasonId],
    );
    return result.rows;
  }

  /**
   * Request to update is_completed status
   * @param appointmentId
   * @param isCompleted
   */
  async updateIsCompleted(appointmentId: number, isCompleted: boolean): Promise<Appointment> {
    const result = await db.query<Appointment>(
      `UPDATE ${this.table} SET 
               is_completed = $1,
               updated_at = NOW()
             WHERE id = $2 RETURNING *`,
      [isCompleted, appointmentId],
    );

    const appointment: Appointment | undefined = result.rows[0];
    if (!appointment) throw new AppError("Appointment is_completed update failed", 400);

    return appointment;
  }
}

export const appointmentsRepository = new AppointmentRepository();



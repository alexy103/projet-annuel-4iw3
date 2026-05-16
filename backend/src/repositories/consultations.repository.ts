import { db } from "../config";
import { Consultation, CreateConsultationPayload, UpdateConsultationPayload } from "../schemas";
import { BaseRepository } from "./base.repository";
import {AppError} from "../types";

class ConsultationRepository extends BaseRepository<Consultation, CreateConsultationPayload, UpdateConsultationPayload> {
  constructor() {
    super("consultations", "Consultation");
  }

  /**
   * Request to get consultations by appointment id
   * @param appointmentId
   */
  async findByAppointmentId(appointmentId: number): Promise<Consultation | null> {
    const result = await db.query<Consultation>(
      `SELECT * FROM ${this.table} WHERE appointment_id = $1`,
      [appointmentId],
    );

    return result.rows[0] || null;
  }

  /**
   * Request to get consultations by clinic id (via veterinarian join)
   * @param clinicId
   */
  async findByClinicId(clinicId: number): Promise<Consultation[]> {
    const result = await db.query<Consultation>(
      `SELECT c.* FROM ${this.table} c
       INNER JOIN veterinarians v ON c.veterinarian_id = v.id
       WHERE v.clinic_id = $1`,
      [clinicId],
    );
    return result.rows;
  }

  /**
   * Request to get consultations by veterinarian id
   * @param veterinarianId
   */
  async findByVeterinarianId(veterinarianId: number): Promise<Consultation[]> {
    const result = await db.query<Consultation>(
      `SELECT * FROM ${this.table} WHERE veterinarian_id = $1`,
      [veterinarianId],
    );
    return result.rows;
  }
}

export const consultationsRepository = new ConsultationRepository();

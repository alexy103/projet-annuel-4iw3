import { db } from "../config";
import { AppointmentReason, CreateAppointmentReasonPayload, UpdateAppointmentReasonPayload } from "../schemas";
import { BaseRepository } from "./base.repository";

class AppointmentReasonRepository extends BaseRepository<AppointmentReason, CreateAppointmentReasonPayload, UpdateAppointmentReasonPayload> {
  constructor() {
    super("appointment_reasons", "AppointmentReason");
  }

  /**
   * Request to get appointment reason by label (dynamic search with ILIKE)
   * @param label
   */
  async findByLabel(label: string): Promise<AppointmentReason[]> {
    if (!label || label === "undefined") {
      return [];
    }

    const result = await db.query<AppointmentReason>(
      `SELECT * FROM ${this.table} WHERE label ILIKE $1 || '%'`,
      [label],
    );
    return result.rows || [];
  }

  /**
   * Request to get an appointment reason by exact label (case-insensitive)
   * Used for duplicate checking on create and update
   * @param label
   */
  async findExactByLabel(label: string): Promise<AppointmentReason | null> {
    const result = await db.query<AppointmentReason>(
      `SELECT * FROM ${this.table} WHERE LOWER(label) = LOWER($1) LIMIT 1`,
      [label],
    );
    return result.rows[0] ?? null;
  }
}

export const appointmentReasonsRepository = new AppointmentReasonRepository();

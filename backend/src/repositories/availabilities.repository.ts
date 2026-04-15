import { db } from "../config";
import { AppError } from "../types";
import { Availability, CreateAvailabilityPayload, UpdateAvailabilityPayload } from "../schemas";
import { BaseRepository } from "./base.repository";

class AvailabilityRepository extends BaseRepository<Availability, CreateAvailabilityPayload, UpdateAvailabilityPayload> {
  constructor() {
    super("availabilities", "Availability");
  }

  /**
   * Request to get all availabilities linked to a clinic
   * @param clinicId
   */
  async findByClinicId(clinicId: number): Promise<Availability[]> {
    const result = await db.query<Availability>(
      `SELECT * FROM ${this.table} WHERE clinic_id = $1`,
      [clinicId],
    );
    return result.rows;
  }

  /**
   * Request to update slot_rules
   * @param availabilityId
   * @param slotRules
   */
  async updateSlotRules(availabilityId: number, slotRules: unknown): Promise<Availability> {
    const result = await db.query<Availability>(
      `UPDATE ${this.table} SET 
               slot_rules = $1,
               updated_at = NOW()
             WHERE id = $2 RETURNING *`,
      [JSON.stringify(slotRules), availabilityId],
    );

    const availability: Availability | undefined = result.rows[0];
    if (!availability) throw new AppError("Availability slot_rules update failed", 400);

    return availability;
  }
}

export const availabilitiesRepository = new AvailabilityRepository();



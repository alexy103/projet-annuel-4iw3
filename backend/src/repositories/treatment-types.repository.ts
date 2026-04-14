import { db } from "../config";
import {
  TreatmentType,
  CreateTreatmentTypePayload,
  UpdateTreatmentTypePayload,
} from "../schemas";
import { BaseRepository } from "./base.repository";

class TreatmentTypeRepository extends BaseRepository<
  TreatmentType,
  CreateTreatmentTypePayload,
  UpdateTreatmentTypePayload
> {
  constructor() {
    super("treatment_types", "Treatment Type");
  }

  /**
   * Request to get treatment types by user id
   * @param userId
   */
  async findByUserId(userId: number): Promise<TreatmentType[]> {
    const result = await db.query<TreatmentType>(
      `SELECT * FROM ${this.table} WHERE user_id = $1`,
      [userId],
    );
    return result.rows;
  }

  /**
   * Request to get treatment types by name (dynamic search with ILIKE)
   * @param name
   */
  async findByName(name: string): Promise<TreatmentType[]> {
    if (!name || name === "undefined") {
      return [];
    }

    const result = await db.query<TreatmentType>(
      `SELECT * FROM ${this.table} WHERE name ILIKE $1 || '%'`,
      [name],
    );
    return result.rows || [];
  }

  /**
   * Request to get a treatment type by exact name (case-insensitive)
   * Used for duplicate checking on create and update
   * @param name
   * @param userId
   */
  async findExactByName(
    name: string,
    userId: number,
  ): Promise<TreatmentType | null> {
    const result = await db.query<TreatmentType>(
      `SELECT * FROM ${this.table} WHERE LOWER(name) = LOWER($1) AND user_id = $2 LIMIT 1`,
      [name, userId],
    );
    return result.rows[0] ?? null;
  }
}

export const treatmentTypesRepository = new TreatmentTypeRepository();

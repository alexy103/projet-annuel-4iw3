import { db } from "../config";
import { AppError } from "../types";
import { Veterinarian, CreateVeterinarianPayload, UpdateVeterinarianPayload } from "../schemas";
import { BaseRepository } from "./base.repository";

class VeterinarianRepository extends BaseRepository<Veterinarian, CreateVeterinarianPayload, UpdateVeterinarianPayload> {
  constructor() {
    super("veterinarians", "Veterinarian");
  }

  /**
   * Request to get all veterinarians by clinic id
   * @param clinicId
   */
  async findByClinicId(clinicId: number): Promise<Veterinarian[]> {
    const result = await db.query<Veterinarian>(
      `SELECT * FROM ${this.table} WHERE clinic_id = $1`,
      [clinicId],
    );
    return result.rows;
  }

  /**
   * Request to update is_present status
   * @param veterinarianId
   * @param isPresent
   */
  async updateIsPresent(veterinarianId: number, isPresent: boolean): Promise<Veterinarian> {
    const result = await db.query<Veterinarian>(
      `UPDATE ${this.table} SET 
               is_present = $1,
               updated_at = NOW()
             WHERE id = $2 RETURNING *`,
      [isPresent, veterinarianId],
    );

    const veterinarian: Veterinarian | undefined = result.rows[0];
    if (!veterinarian) throw new AppError("Veterinarian is_present update failed", 400);

    return veterinarian;
  }

  /**
   * Request to get veterinarians by firstName and lastName (dynamic search with ILIKE)
   * @param firstName
   * @param lastName
   */
  async findByFullName(
    firstName: string | undefined,
    lastName: string | undefined,
  ): Promise<Veterinarian[]> {
    const conditions: string[] = [];
    const params: string[] = [];
    let index = 1;

    if (firstName && firstName !== "undefined") {
      conditions.push(`first_name ILIKE $${index} || '%'`);
      params.push(firstName);
      index++;
    }

    if (lastName && lastName !== "undefined") {
      conditions.push(`last_name ILIKE $${index} || '%'`);
      params.push(lastName);
      index++;
    }

    if (conditions.length === 0) {
      return [];
    }

    const query = `
      SELECT * FROM ${this.table}
      WHERE ${conditions.join(" AND ")}
    `;

    const result = await db.query<Veterinarian>(query, params);
    return result.rows || [];
  }

  /**
   * Request to find a veterinarian by exact first name, last name and clinic id (case-insensitive)
   * Used for duplicate checking on create and update
   * @param firstName
   * @param lastName
   * @param clinicId
   */
  async findExactByFullNameAndClinicId(
      firstName: string,
      lastName: string,
      clinicId: number
  ): Promise<Veterinarian | null> {
    const result = await db.query<Veterinarian>(
      `SELECT * FROM ${this.table}
       WHERE LOWER(first_name) = LOWER($1)
         AND LOWER(last_name) = LOWER($2)
         AND clinic_id = $3
       LIMIT 1`,
      [firstName, lastName, clinicId],
    );
    return result.rows[0] ?? null;
  }
}

export const veterinariansRepository = new VeterinarianRepository();

import { db } from "../config";
import { Care, CreateCarePayload, UpdateCarePayload } from "../schemas";
import { BaseRepository } from "./base.repository";

class CareRepository extends BaseRepository<Care, CreateCarePayload, UpdateCarePayload> {
  constructor() {
    super("cares", "Care");
  }

  /**
   * Request to get all cares by animal id
   * @param animalId
   */
  async findByAnimalId(animalId: number): Promise<Care[]> {
    const result = await db.query<Care>(
      `SELECT * FROM ${this.table} WHERE animal_id = $1`,
      [animalId],
    );
    return result.rows;
  }

  /**
   * Request to get all cares by treatment type id
   * @param treatmentTypeId
   */
  async findByTreatmentTypeId(treatmentTypeId: number): Promise<Care[]> {
    const result = await db.query<Care>(
      `SELECT * FROM ${this.table} WHERE treatment_type_id = $1`,
      [treatmentTypeId],
    );
    return result.rows;
  }

  async findByUserId(userId: number): Promise<Care[]> {
    const result = await db.query<Care>(
      `SELECT c.* FROM ${this.table} c
       INNER JOIN animals a ON a.id = c.animal_id
       WHERE a.user_id = $1`,
      [userId],
    );
    return result.rows;
  }
}

export const caresRepository = new CareRepository();

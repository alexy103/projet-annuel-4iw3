import { db } from "../config";
import { Treatment, CreateTreatmentPayload, UpdateTreatmentPayload } from "../schemas";
import { BaseRepository } from "./base.repository";

class TreatmentRepository extends BaseRepository<Treatment, CreateTreatmentPayload, UpdateTreatmentPayload> {
  constructor() {
    super("treatments", "Treatment");
  }

  /**
   * Request to get all treatments by medicine id
   * @param medicineId
   */
  async findByMedicineId(medicineId: number): Promise<Treatment[]> {
    const result = await db.query<Treatment>(
      `SELECT * FROM ${this.table} WHERE medicine_id = $1`,
      [medicineId],
    );
    return result.rows;
  }

  /**
   * Request to get all treatments by animal id
   * @param animalId
   */
  async findByAnimalId(animalId: number): Promise<Treatment[]> {
    const result = await db.query<Treatment>(
      `SELECT * FROM ${this.table} WHERE animal_id = $1`,
      [animalId],
    );
    return result.rows;
  }

  /**
   * Request to get all treatments by treatment type id
   * @param treatmentTypeId
   */
  async findByTreatmentTypeId(treatmentTypeId: number): Promise<Treatment[]> {
    const result = await db.query<Treatment>(
      `SELECT * FROM ${this.table} WHERE treatment_type_id = $1`,
      [treatmentTypeId],
    );
    return result.rows;
  }

  async findByUserId(userId: number): Promise<Treatment[]> {
    const result = await db.query<Treatment>(
      `SELECT t.* FROM ${this.table} t
       INNER JOIN animals a ON a.id = t.animal_id
       WHERE a.user_id = $1`,
      [userId],
    );
    return result.rows;
  }
}

export const treatmentsRepository = new TreatmentRepository();

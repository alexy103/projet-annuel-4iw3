import { db } from "../config";
import { WeightRecord, CreateWeightRecordPayload, UpdateWeightRecordPayload } from "../schemas";
import { BaseRepository } from "./base.repository";

class WeightRecordRepository extends BaseRepository<WeightRecord, CreateWeightRecordPayload, UpdateWeightRecordPayload> {
  constructor() {
    super("weight_records", "Weight Record");
  }

  /**
   * Request to get all weight records by animal id
   * @param animalId
   */
  async findByAnimalId(animalId: number): Promise<WeightRecord[]> {
    const result = await db.query<WeightRecord>(
      `SELECT * FROM ${this.table} WHERE animal_id = $1 ORDER BY date DESC`,
      [animalId],
    );
    return result.rows;
  }

  async findByUserId(userId: number): Promise<WeightRecord[]> {
    const result = await db.query<WeightRecord>(
      `SELECT wr.* FROM ${this.table} wr
       INNER JOIN animals a ON a.id = wr.animal_id
       WHERE a.user_id = $1 ORDER BY wr.date DESC`,
      [userId],
    );
    return result.rows;
  }
}

export const weightRecordsRepository = new WeightRecordRepository();

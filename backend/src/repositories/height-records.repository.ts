import { db } from "../config";
import { HeightRecord, CreateHeightRecordPayload, UpdateHeightRecordPayload } from "../schemas";
import { BaseRepository } from "./base.repository";

class HeightRecordRepository extends BaseRepository<HeightRecord, CreateHeightRecordPayload, UpdateHeightRecordPayload> {
  constructor() {
    super("height_records", "Height Record");
  }

  /**
   * Request to get all height records by animal id
   * @param animalId
   */
  async findByAnimalId(animalId: number): Promise<HeightRecord[]> {
    const result = await db.query<HeightRecord>(
      `SELECT * FROM ${this.table} WHERE animal_id = $1 ORDER BY date DESC`,
      [animalId],
    );
    return result.rows;
  }

  async findByUserId(userId: number): Promise<HeightRecord[]> {
    const result = await db.query<HeightRecord>(
      `SELECT hr.* FROM ${this.table} hr
       INNER JOIN animals a ON a.id = hr.animal_id
       WHERE a.user_id = $1 ORDER BY hr.date DESC`,
      [userId],
    );
    return result.rows;
  }
}

export const heightRecordsRepository = new HeightRecordRepository();

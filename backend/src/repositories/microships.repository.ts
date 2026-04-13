import { db } from "../config";
import { Microship, CreateMicroshipPayload, UpdateMicroshipPayload } from "../schemas";
import { BaseRepository } from "./base.repository";

class MicroshipRepository extends BaseRepository<Microship, CreateMicroshipPayload, UpdateMicroshipPayload> {
  constructor() {
    super("microships", "Microship");
  }

  /**
   * Request to get all microships by userId
   * @param userId
   */
  async findByUserId(userId: number): Promise<Microship[]> {
    const result = await db.query<Microship>(
      `SELECT * FROM ${this.table} WHERE user_id = $1`,
      [userId],
    );
    return result.rows;
  }
}

export const microshipsRepository = new MicroshipRepository();

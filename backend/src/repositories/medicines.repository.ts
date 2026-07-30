import { db } from "../config";
import { Medicine, CreateMedicinePayload, UpdateMedicinePayload } from "../schemas";
import { BaseRepository } from "./base.repository";

class MedicineRepository extends BaseRepository<Medicine, CreateMedicinePayload, UpdateMedicinePayload> {
  constructor() {
    super("medicines", "Medicine");
  }

  /**
   * Request to get medicines by user id
   * @param userId
   */
  async findByUserId(userId: number): Promise<Medicine[]> {
    const result = await db.query<Medicine>(
      `SELECT * FROM ${this.table} WHERE user_id = $1`,
      [userId],
    );
    return result.rows;
  }

  /**
   * Request to get medicines by brand (dynamic search with ILIKE)
   * @param brand
   */
  async findByBrand(brand: string): Promise<Medicine[]> {
    if (!brand || brand === "undefined") {
      return [];
    }

    const result = await db.query<Medicine>(
      `SELECT * FROM ${this.table} WHERE brand ILIKE $1 || '%'`,
      [brand],
    );
    return result.rows || [];
  }

  /**
   * Request to get a medicine by exact brand name (case-insensitive)
   * Used for duplicate checking on create and update
   * @param brand
   * @param userId
   */
  async findExactByBrand(brand: string, userId: number): Promise<Medicine | null> {
    const result = await db.query<Medicine>(
      `SELECT * FROM ${this.table} WHERE LOWER(brand) = LOWER($1) AND user_id = $2 LIMIT 1`,
      [brand, userId],
    );
    return result.rows[0] ?? null;
  }
}

export const medicinesRepository = new MedicineRepository();

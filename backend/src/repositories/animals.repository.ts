import { db } from "../config";
import { AppError } from "../types";
import { Animal, CreateAnimalPayload, UpdateAnimalPayload } from "../schemas";
import { BaseRepository } from "./base.repository";

class AnimalRepository extends BaseRepository<Animal, CreateAnimalPayload, UpdateAnimalPayload> {
  constructor() {
    super("animals", "Animal");
  }

  /**
   * Request to get all animals by userId
   * @param userId
   */
  async findByUserId(userId: number): Promise<Animal[]> {
    const query = `
      SELECT * FROM ${this.table} WHERE user_id = $1
    `;

    const result = await db.query(query, [userId]);
    return result.rows;
  }

  /**
   * Request to get all animals by microshipId
   * @param microshipId
   */
  async findByMicroshipId(microshipId: number): Promise<Animal[]> {
    const query = `
      SELECT * FROM ${this.table} WHERE microship_id = $1
    `;

    const result = await db.query(query, [microshipId]);
    return result.rows;
  }

  /**
   * Request to get all shared animals
   */
  async findAllShared(): Promise<Animal[]> {
    const result = await db.query<Animal>(
      `SELECT * FROM ${this.table} WHERE is_shared = true`,
    );
    return result.rows;
  }

  /**
   * Request to get animals by name (dynamic search with ILIKE)
   * @param name
   */
  async findByName(name: string, userId?: number): Promise<Animal[]> {
    if (!name || name === "undefined") {
      return [];
    }

    if (userId !== undefined) {
      const result = await db.query<Animal>(
        `SELECT * FROM ${this.table} WHERE name ILIKE $1 || '%' AND user_id = $2`,
        [name, userId],
      );
      return result.rows || [];
    }

    const result = await db.query<Animal>(
      `SELECT * FROM ${this.table} WHERE name ILIKE $1 || '%'`,
      [name],
    );
    return result.rows || [];
  }

  /**
   * Request to update is_shared status
   * @param animalId
   * @param isShared
   */
  async updateIsShared(animalId: number, isShared: boolean): Promise<Animal> {
    const result = await db.query<Animal>(
      `UPDATE ${this.table} SET 
               is_shared = $1,
               updated_at = NOW()
             WHERE id = $2 RETURNING *`,
      [isShared, animalId],
    );

    const animal: Animal | undefined = result.rows[0];
    if (!animal) throw new AppError("Animal is_shared update failed", 400);

    return animal;
  }

  /**
   * Request to update is_deceased status
   * @param animalId
   * @param isDeceased
   */
  async updateIsDeceased(animalId: number, isDeceased: boolean): Promise<Animal> {
    const result = await db.query<Animal>(
      `UPDATE ${this.table} SET
               is_deceased = $1,
               updated_at = NOW()
             WHERE id = $2 RETURNING *`,
      [isDeceased, animalId],
    );

    const animal: Animal | undefined = result.rows[0];
    if (!animal) throw new AppError("Animal is_deceased update failed", 400);

    return animal;
  }

  async updateMicroship(animalId: number, microshipId: number | null): Promise<Animal> {
    const result = await db.query<Animal>(
      `UPDATE ${this.table} SET
               microship_id = $1,
               updated_at = NOW()
             WHERE id = $2 RETURNING *`,
      [microshipId, animalId],
    );

    const animal: Animal | undefined = result.rows[0];
    if (!animal) throw new AppError("Animal microship update failed", 400);

    return animal;
  }
}

export const animalsRepository = new AnimalRepository();



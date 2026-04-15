import { db } from "../config";
import { Specie, CreateSpeciePayload, UpdateSpeciePayload } from "../schemas";
import { BaseRepository } from "./base.repository";

class SpeciesRepository extends BaseRepository<Specie, CreateSpeciePayload, UpdateSpeciePayload> {
  constructor() {
    super("species", "Species");
  }

  /**
   * Request to get species by name (dynamic search with ILIKE)
   * @param name
   */
  async findByName(name: string): Promise<Specie[]> {
    if (!name || name === "undefined") {
      return [];
    }

    const result = await db.query<Specie>(
      `SELECT * FROM ${this.table} WHERE name ILIKE $1 || '%'`,
      [name],
    );
    return result.rows || [];
  }

  async findByExactName(name: string): Promise<Specie | null> {
    const result = await db.query<Specie>(
      `SELECT * FROM ${this.table} WHERE LOWER(name) = LOWER($1) LIMIT 1`,
      [name],
    );
    return result.rows[0] ?? null;
  }
}

export const speciesRepository = new SpeciesRepository();

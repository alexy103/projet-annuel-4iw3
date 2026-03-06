import { db } from "../config";
import { AppError } from "../types";

export class BaseRepository<
  Entity extends Record<string, any>,
  CreatePayload extends Record<string, any>,
  UpdatePayload extends Record<string, any>,
> {
  protected table: string;
  protected errorMessage: string;

  constructor(table: string, errorMessage: string) {
    this.table = table;
    this.errorMessage = errorMessage;
  }

  /**
   * Request to get all items
   */
  async findAll(
    isActivated: string | undefined = undefined,
  ): Promise<Entity[]> {
    if (isActivated == undefined || isActivated == "undefined") {
      return (
        await db.query(`
        SELECT * FROM ${this.table}
      `)
      ).rows;
    }

    const boolValue = isActivated == "true" ? "true" : "false";

    const result = await db.query(
      `SELECT * FROM ${this.table} WHERE is_activated = $1`,
      [boolValue],
    );

    return result.rows;
  }

  /**
   * Request to get item by id
   * @param id
   */
  async findById(id: number): Promise<Entity> {
    const query: string = `
      SELECT * FROM ${this.table} WHERE id = $1
    `;

    const result = await db.query(query, [id]);

    const item: Entity | undefined = result.rows[0];
    if (!item) {
      throw new AppError(`${this.errorMessage} not Found`, 404);
    }
    return item;
  }

  /**
   * Request to create an item
   * @param data
   */
  async create(data: CreatePayload): Promise<Entity> {
    const keys = Object.keys(data);
    const values = Object.values(data);

    const columns = keys.join(", ");
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");

    const query: string = `
      INSERT INTO ${this.table} (${columns}) 
      VALUES (${placeholders}) 
      RETURNING *
    `;

    const result = await db.query(query, values);

    const item: Entity | undefined = result.rows[0];
    if (!item) throw new AppError("Item creation failed", 400);

    return result.rows[0];
  }

  /**
   * Reques to update an item
   * @param id
   * @param data
   */
  async update(id: number, data: Partial<UpdatePayload>): Promise<Entity> {
    const keys = Object.keys(data);
    if (keys.length === 0) throw new AppError("No fields to update", 400);

    const values = Object.values(data);

    const setClause = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(", ");

    const query = `
      UPDATE ${this.table} SET 
        ${setClause},
        updated_at = NOW()
      WHERE id = $${keys.length + 1} 
      RETURNING *
    `;

    const result = await db.query(query, [...values, id]);

    const item: Entity | undefined = result.rows[0];
    if (!item) throw new AppError("Item update failed", 400);

    return item;
  }

  /**
   * Request to delete an item
   * @param id
   */
  async delete(id: number): Promise<Entity> {
    const query: string = `
      DELETE FROM ${this.table} 
     WHERE id = $1
      RETURNING *
    `;

    const result = await db.query(query, [id]);

    const item: Entity | undefined = result.rows[0];
    if (!item) {
      throw new AppError("Item deleted failed", 400);
    }
    return item;
  }
}

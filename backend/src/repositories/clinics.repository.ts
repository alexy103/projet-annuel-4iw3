import { db } from "../config";
import {Clinic, ClinicStatus, CreateClinicPayload, RegisterClinicPayload, UpdateClinicPayload} from "../schemas";
import { AppError } from "../types";
import { BaseRepository } from "./base.repository";

class ClinicRepository extends BaseRepository<Clinic, CreateClinicPayload, UpdateClinicPayload> {
  constructor() {
    super("clinics", "Clinic");
  }

  /**
   * Request to get clinics by name (dynamic search with ILIKE)
   * @param name
   */
  async findByName(name: string): Promise<Clinic[]> {
    if (!name || name === "undefined") {
      return [];
    }

    const result = await db.query<Clinic>(
        `SELECT * FROM ${this.table} WHERE name ILIKE $1 || '%'`,
        [name],
    );
    return result.rows || [];
  }

  /**
   * Request to get clinics by criteria with LIKE search
   * @param phoneNumber
   * @param postcode
   * @param city
   * @param address
   */
  async findByCriteria(
    phoneNumber: string | undefined,
    postcode: string | undefined,
    city: string | undefined,
    address: string | undefined,
  ): Promise<Clinic[]> {
    const conditions: string[] = [];
    const params: (string | number)[] = [];
    let index = 1;

    if (phoneNumber && phoneNumber !== "undefined") {
      conditions.push(`phone_number ILIKE $${index} || '%'`);
      params.push(phoneNumber);
      index++;
    }

    if (postcode && postcode !== "undefined") {
      conditions.push(`postcode ILIKE $${index} || '%'`);
      params.push(postcode);
      index++;
    }

    if (city && city !== "undefined") {
      conditions.push(`city ILIKE $${index} || '%'`);
      params.push(city);
      index++;
    }

    if (address && address !== "undefined") {
      conditions.push(`address ILIKE $${index} || '%'`);
      params.push(address);
      index++;
    }

    if (conditions.length === 0) {
      return [];
    }

    const query = `
      SELECT * FROM ${this.table}
      WHERE ${conditions.join(" AND ")}
    `;

    const result = await db.query<Clinic>(query, params);
    return result.rows || [];
  }

  /**
   * Request to get clinics by status
   * @param status
   */
  async findByStatus(status: ClinicStatus): Promise<Clinic[]> {
    const result = await db.query<Clinic>(
        `SELECT * FROM ${this.table} WHERE status = $1`,
        [status],
    );
    return result.rows || [];
  }

  /**
   * Request to create a self-registered clinic with a pending status
   * @param data
   */
  async register(data: RegisterClinicPayload): Promise<Clinic> {
    const result = await db.query<Clinic>(
        `INSERT INTO ${this.table} (name, address, city, postcode, phone_number, status)
         VALUES ($1, $2, $3, $4, $5, 'pending')
         RETURNING *`,
        [data.name, data.address, data.city, data.postcode, data.phone_number],
    );

    const clinic: Clinic | undefined = result.rows[0];
    if (!clinic) throw new AppError("Item creation failed", 400);

    return clinic;
  }

  /**
   * Request to update the status of a clinic
   * @param id
   * @param status
   */
  async updateStatus(id: number, status: ClinicStatus): Promise<Clinic> {
    const result = await db.query<Clinic>(
        `UPDATE ${this.table} SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [status, id],
    );

    const clinic: Clinic | undefined = result.rows[0];
    if (!clinic) throw new AppError("Item update failed", 400);

    return clinic;
  }
}

export const clinicsRepository = new ClinicRepository();



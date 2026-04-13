import { db } from "../config";
import {Clinic, CreateClinicPayload, UpdateClinicPayload} from "../schemas";
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
}

export const clinicsRepository = new ClinicRepository();



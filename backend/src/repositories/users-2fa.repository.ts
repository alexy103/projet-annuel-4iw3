import {
  Users2FA,
  CreateUsers2FAPayload,
  UpdateUsers2FAPayload,
} from "../schemas";
import { BaseRepository } from "./base.repository";
import { db } from "../config";

class Users2FARepository extends BaseRepository<
  Users2FA,
  CreateUsers2FAPayload,
  UpdateUsers2FAPayload
> {
  constructor() {
    super("users_2fa", "Users2FA");
  }

  async create(data: CreateUsers2FAPayload): Promise<Users2FA> {
    const payload = {
      ...data,
      recovery_codes:
        data.recovery_codes !== undefined
          ? JSON.stringify(data.recovery_codes)
          : undefined,
    };
    return super.create(payload as any);
  }

  async update(
    id: number,
    data: Partial<UpdateUsers2FAPayload>,
  ): Promise<Users2FA> {
    const payload: Record<string, unknown> = { ...data };
    if (data.recovery_codes !== undefined) {
      payload.recovery_codes = JSON.stringify(data.recovery_codes);
    }

    const keys = Object.keys(payload);
    if (keys.length === 0) throw new Error("No fields to update");

    const values = Object.values(payload);
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");

    const result = await db.query<Users2FA>(
      `UPDATE users_2fa SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
      [...values, id],
    );
    if (!result.rows[0]) throw new Error("users_2fa update failed");
    return result.rows[0];
  }

  async findByUserId(userId: number): Promise<Users2FA | null> {
    const result = await db.query<Users2FA>(
      `SELECT * FROM users_2fa WHERE user_id = $1`,
      [userId],
    );

    return result.rows[0] || null;
  }
}

export const users2FARepository = new Users2FARepository();

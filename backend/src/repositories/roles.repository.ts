import { db } from "../config";
import { RolePayload, Role } from "../schemas";
import { BaseRepository } from "./base.repository";

class RoleRepository extends BaseRepository<Role, RolePayload, RolePayload> {
  constructor() {
    super("roles", "Role");
  }

  /**
   * Request to get one role by label
   * @param label
   */
  async findByLabel(label: string): Promise<Role | null> {
    const result = await db.query<Role>(`SELECT *FROM roles WHERE label = $1`, [
      label,
    ]);

    return result.rows[0] || null;
  }
}

export const rolesRepository = new RoleRepository();

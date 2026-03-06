import { Permission, PermissionPayload } from "../schemas";
import { db } from "../config";
import { BaseRepository } from "./base.repository";

class PermissionRepository extends BaseRepository<
  Permission,
  PermissionPayload,
  PermissionPayload
> {
  constructor() {
    super("permissions", "Permission");
  }

  /**
   * Request to get permission by label
   * @param label
   */
  async findByLabel(label: string): Promise<Permission | null> {
    const result = await db.query<Permission>(
      `
      SELECT * FROM permissions WHERE label=$1
    `,
      [label],
    );

    return result.rows[0] || null;
  }
}

export const permissionsRepository = new PermissionRepository();

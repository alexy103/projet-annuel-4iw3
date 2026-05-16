import { db } from "../config";
import { AppError } from "../types";
import {
  CreateUserPayload,
  UpdateUserPayload,
  User,
  UserPermission
} from "../schemas";

export const usersRepository = {
  /**
   * Request to get all users
   * @param isActivated
   */
  async findAll(isActivated: string | undefined): Promise<User[]> {
    if (isActivated === "undefined") {
      return (await db.query<User>("SELECT * FROM users ORDER BY id")).rows;
    }

    const boolValue = isActivated == "true" ? "true" : "false";

    const result = await db.query<User>(
      `SELECT * FROM users WHERE is_activated = $1`,
      [boolValue],
    );
    return result.rows;
  },

  /**
   * Request to get one user by id
   * @param userId
   */
  async findById(userId: number): Promise<User> {
    const result = await db.query<User>(`SELECT *FROM users WHERE id = $1`, [
      userId,
    ]);

    const user: User | undefined = result.rows[0];
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  },

  /**
   * Request to get one role by email
   * @param email
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await db.query<User>(`SELECT *FROM users WHERE email = $1`, [
      email,
    ]);

    return result.rows[0] || null;
  },

  /**
   * Request to get users by role
   * @param roleId
   */
  async countUsersByRoleId(roleId: number): Promise<number> {
    const result = await db.query(
      `
      SELECT COUNT(*) as count FROM users WHERE role_id = $1
    `,
      [roleId],
    );

    return Number(result.rows[0].count);
  },

  /**
   * Request to create a user
   * @param data
   * @param password
   * @param verificationCode
   */
  async create(
    data: CreateUserPayload,
    password: string,
    verificationCode: string,
  ): Promise<User> {
    let passwordExpiresAt: Date | null = null;
    if (
      data.must_change_password == true ||
      data.must_change_password == undefined
    ) {
      passwordExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    }

    const codeExpiresAt: Date = new Date(Date.now() + 10 * 60 * 1000); // 10min

    const result = await db.query<User>(
      `INSERT INTO users (
         last_name, 
         first_name, 
         email, 
         password_hash, 
         must_change_password, 
         password_temp_expires_at,
         email_verification_code,
         email_verification_expires_at,
         role_id
      )
     VALUES ($1, $2, $3, $4 ,$5 , $6, $7, $8, $9)
       RETURNING *`,
      [
        data.last_name,
        data.first_name,
        data.email,
        password,
        data.must_change_password ?? true,
        passwordExpiresAt,
        verificationCode,
        codeExpiresAt,
        data.role_id,
      ],
    );

    const user: User | undefined = result.rows[0];
    if (!user) {
      throw new AppError("User creation failed!", 400);
    }
    return user;
  },

  /**
   * Request to associate permission to user
   * @param userId
   * @param permissionId
   */
  async createPermissionToUser(
    userId: number,
    permissionId: number,
  ): Promise<UserPermission> {
    const result = await db.query<UserPermission>(
      `
      INSERT INTO users_permissions(user_id, permission_id) VALUES($1,$2) RETURNING *`,
      [userId, permissionId],
    );

    const userPermission: UserPermission | undefined = result.rows[0];
    if (!userPermission) {
      throw new AppError("User permission creation failed!", 400);
    }
    return userPermission;
  },

  /**
   * Request to get permissions by user
   * @param userId
   */
  async findPermissionsByUserId(userId: number): Promise<UserPermission[]> {
    const result = await db.query<UserPermission>(
      `
      SELECT * FROM users_permissions WHERE user_id = $1
    `,
      [userId],
    );

    return result.rows;
  },

  async findPermissionByPermissionId(
    userId: number,
    permissionId: number,
  ): Promise<UserPermission | null> {
    const result = await db.query<UserPermission>(
      `
      SELECT * FROM users_permissions WHERE user_id = $1 and permission_id = $2`,
      [userId, permissionId],
    );

    return result.rows[0] || null;
  },

  /**
   * Request to count permissions by user
   * @param userId
   */
  async countPermissionsByUserId(userId: number): Promise<number> {
    const result = await db.query(
      `
      SELECT COUNT(*) as count FROM users_permissions WHERE user_id = $1
    `,
      [userId],
    );

    return Number(result.rows[0].count);
  },

  /**
   * Request to delete permission to user
   * @param userId
   * @param permissionId
   */
  async deletePermissionFromUser(
    userId: number,
    permissionId: number,
  ): Promise<UserPermission> {
    const result = await db.query<UserPermission>(
      `
      DELETE FROM users_permissions WHERE user_id = $1 AND permission_id = $2 RETURNING *`,
      [userId, permissionId],
    );

    const userPermission: UserPermission | undefined = result.rows[0];
    if (!userPermission) {
      throw new AppError("User permission delete failed!", 400);
    }
    return userPermission;
  },

  /**
   * Request to update a user
   * @param userId
   * @param data
   */
  async update(userId: number, data: UpdateUserPayload): Promise<User> {
    const result = await db.query<User>(
      `UPDATE users
     SET
       last_name = COALESCE($1, last_name),
       first_name = COALESCE($2, first_name),
       email = COALESCE($3, email),
       role_id = COALESCE($4, role_id),
       updated_at = NOW()
     WHERE id = $5
       RETURNING *`,
      [data.last_name, data.first_name, data.email, data.role_id, userId],
    );

    const user: User | undefined = result.rows[0];
    if (!user) throw new AppError("User update failed", 400);

    return user;
  },

  /**
   * Request to set email_verified => true
   * @param userId
   */
  async updateEmailVerified(userId: number): Promise<User> {
    const result = await db.query<User>(
      `UPDATE users SET 
               email_verified = $1, 
               email_verification_code = $2, 
               email_verification_expires_at = $3,
               updated_at = NOW()
             WHERE id = $4 RETURNING *`,
      [true, null, null, userId],
    );

    const user: User | undefined = result.rows[0];
    if (!user) throw new AppError("User update failed", 400);

    return user;
  },

  /**
   * Request to resend verification code
   * @param userId
   * @param verificationCode
   */
  async updateCodeVerification(
    userId: number,
    verificationCode: string,
  ): Promise<User> {
    const codeExpiresAt: Date = new Date(Date.now() + 10 * 60 * 1000); // 10min

    const result = await db.query(
      `UPDATE users SET 
               email_verification_code = $1, 
               email_verification_expires_at = $2,
               updated_at = NOW()
             WHERE id = $3 RETURNING *`,
      [verificationCode, codeExpiresAt, userId],
    );

    const user: User = result.rows[0];
    if (!user) throw new AppError("User update failed", 400);

    return user;
  },

  /**
   * Request to change password when the first connection
   * @param userId
   * @param password
   */
  async updatePassword(userId: number, password: string): Promise<User> {
    const result = await db.query(
      `UPDATE users SET 
               password_hash = $1, 
               must_change_password = $2, 
               password_temp_expires_at = $3,
               updated_at = NOW()
             WHERE id = $4 RETURNING *`,
      [password, false, null, userId],
    );

    const user: User = result.rows[0];
    if (!user) throw new AppError("User update failed", 400);

    return user;
  },

  /**
   * Request to reset user password
   * @param userId
   * @param password
   * @param mustChangePassword
   */
  async resetPassword(
    userId: number,
    password: string,
    mustChangePassword: boolean | null,
  ): Promise<User> {
    const passwordExpiresAt: Date = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    let result;

    if (mustChangePassword != null && !mustChangePassword) {
      result = await db.query(
        `UPDATE users SET password_hash = $1, must_change_password = $2, password_temp_expires_at = $3 WHERE id = $4 RETURNING *`,
        [password, false, null, userId],
      );
    } else {
      result = await db.query(
        `UPDATE users SET 
               password_hash = $1, 
               must_change_password = $2, 
               password_temp_expires_at = $3,
               updated_at = NOW()
             WHERE id = $4 RETURNING *`,
        [password, true, passwordExpiresAt, userId],
      );
    }

    const user: User = result.rows[0];
    if (!user) throw new AppError("User update failed", 400);

    return user;
  },

  /**
   * Request to change user activation
   * @param userId
   * @param isActivated
   */
  async updateActivation(userId: number, isActivated: boolean): Promise<User> {
    const result = await db.query(
      `UPDATE users set 
               is_activated = $1,
               updated_at = NOW()
             WHERE id = $2 RETURNING *`,
      [isActivated, userId],
    );

    const user: User = result.rows[0];
    if (!user) throw new Error("User activation update failed");

    return user;
  },

  async updateOnboardingCompleted(userId: number): Promise<User> {
    const result = await db.query(
      `UPDATE users SET onboarding_completed = true, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [userId],
    );
    const user: User = result.rows[0];
    if (!user) throw new AppError("User update failed", 400);
    return user;
  },

  async updateClinic(userId: number, clinicId: number): Promise<User> {
    const result = await db.query(
        `
        UPDATE users SET clinic_id = $1,
            updated_at = NOW()
            WHERE id = $2 RETURNING *
        `, [clinicId, userId]
    )

    const user : User = result.rows[0];
    if (!user) throw new AppError("User update failed", 400);

    return user;
  },

  /**
   * Request to delete a role
   * @param userId
   */
  async delete(userId: number): Promise<User> {
    const result = await db.query(
      `DELETE FROM users WHERE id = $1 RETURNING *`,
      [userId],
    );

    const user: User = result.rows[0];
    if (!user) throw new AppError("Role delete failed", 400);

    return user;
  },
};

import { AppError } from "../types";
import { UserSession } from "../schemas";
import { db } from "../config";

export const sessionsRepository = {
  /**
   * Request to get session by refresh token
   * @param tokenHash
   */
  async findByRefreshToken(tokenHash: string): Promise<UserSession | null> {
    const result = await db.query<UserSession>(
      `SELECT * FROM users_sessions 
     WHERE refresh_token_hash = $1 AND expired_at > NOW()`,
      [tokenHash],
    );
    return result.rows[0] || null;
  },

  async findByUser(userId: number): Promise<UserSession[] | null> {
    const result = await db.query<UserSession>(
      `SELECT * FROM users_sessions 
     WHERE user_id = $1 AND expired_at > NOW()`,
      [userId],
    );
    return result.rows || null;
  },

  /**
   * Request to create user session
   * @param userId
   * @param refreshTokenHash
   * @param userAgent
   * @param ip
   */
  async create(
    userId: number,
    refreshTokenHash: string,
    userAgent: string | null,
    ip: string | null,
  ): Promise<UserSession> {
    const result = await db.query<UserSession>(
      `INSERT INTO users_sessions (user_id, refresh_token_hash, user_agent, ip_address, expired_at)
     VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')
     RETURNING *`,
      [userId, refreshTokenHash, userAgent, ip],
    );
    const userSession: UserSession | undefined = result.rows[0];
    if (!userSession) {
      throw new AppError("User session creation failed", 400);
    }
    return userSession;
  },

  /**
   * Request to update session
   * @param sessionId
   * @param newRefreshTokenHash
   */
  async update(sessionId: number, newRefreshTokenHash: string) {
    const result = await db.query<UserSession>(
      `
    UPDATE users_sessions
    SET refresh_token_hash = $1,
        expired_at = NOW() + INTERVAL '7 days'
    WHERE id = $2
    RETURNING *
    `,
      [newRefreshTokenHash, sessionId],
    );

    const session: UserSession | undefined = result.rows[0];
    if (!session) {
      throw new AppError("User session creation failed", 400);
    }

    return session;
  },

  /**
   * Request to delete session by id
   * @param sessionId
   */
  async deleteSession(sessionId: number): Promise<UserSession> {
    const result = await db.query<UserSession>(
      `DELETE FROM users_sessions WHERE id = $1 RETURNING *`,
      [sessionId],
    );

    const session: UserSession | undefined = result.rows[0];
    if (!session) throw new AppError("User session delete failed", 400);

    return session;
  },

  /**
   * Request to delete session by user_id
   * @param userId
   */
  async deleteUserSessions(userId: number): Promise<UserSession> {
    const result = await db.query<UserSession>(
      `DELETE FROM users_sessions WHERE user_id = $1 RETURNING *`,
      [userId],
    );

    const session: UserSession | undefined = result.rows[0];
    if (!session) throw new AppError("User session delete failed", 400);

    return session;
  },
};

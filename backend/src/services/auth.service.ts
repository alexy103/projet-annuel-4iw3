import { AppError} from "../types";
import {clinicsRepository, rolesRepository, sessionsRepository, usersRepository} from "../repositories";
import {CreateUserPayload, RegisterPayload, User, UserSession} from "../schemas";

import {
  generateSecurePassword,
  generateVerificationCode,
  hashPassword,
  isCodeExpired,
  isPasswordExpired,
  minimize,
  sendFinalPasswordEmail,
  sendTempPasswordEmail,
  sendVerificationCodeEmail,
  verifyPassword,
} from "../utils";

import jwt from "jsonwebtoken";

import { Request } from "express";
import {userService} from "./users.service";

export const authService = {
  async register(data: RegisterPayload){
    const role = await rolesRepository.findByLabel("user");
    if(!role) throw new AppError("Role not found", 404);

    if(data.clinic_id){
      const clinic = await clinicsRepository.findById(data.clinic_id);
      if(!clinic) throw new AppError("Clinic not found", 404);
    }

    const { password, ...userData } = data;

    const createPayload: CreateUserPayload = {
      ...userData,
      must_change_password: false,
      role_id: role.id,
    };

    return userService.create(createPayload, password);
  },

  async login(email: string, password: string, req?: Request) {
    if (email) {
      email = minimize(email);
    }

    const existingUser: User | null = await usersRepository.findByEmail(email);

    if (
      !existingUser ||
      !existingUser.is_activated ||
      !existingUser.email_verified ||
      existingUser.must_change_password
    ) {
      throw new AppError("Invalid user or password", 401);

    }

    const checkPassword: boolean = await verifyPassword(
      password,
      existingUser.password_hash,
    );
    if (!checkPassword) {
      console.log("cc");
      throw new AppError("Invalid user or password", 401);
    }

    const jwtSecret: string | undefined = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.log("cc2");
      throw new AppError("Invalid user or password", 401);
    }

    const jwtRefreshSecret: string | undefined = process.env.JWT_REFRESH_SECRET;
    if (!jwtRefreshSecret) {
      console.log("cc3");
      throw new AppError("Invalid user or password", 401);
    }

    const accessToken: string = jwt.sign(
      { userId: existingUser.id },
      jwtSecret,
      { expiresIn: "7d" },
    );

    const refreshToken: string = jwt.sign(
      { userId: existingUser.id },
      jwtRefreshSecret,
      { expiresIn: "24h" },
    );

    const session: UserSession = await sessionsRepository.create(
      existingUser.id,
      await hashPassword(refreshToken),
      req?.headers["user-agent"] || null,
      req?.ip || null,
    );

    return {
      userId: existingUser.id,
      roleId: existingUser.role_id,
      accessToken: accessToken,
      refreshToken,
      sessionId: session.id,
    };
  },

  async refreshToken(refreshToken: string) {
    let decoded: { userId: number } | null = null;
    try {
      const jwtSecret: string | undefined = process.env.JWT_SECRET;
      if (!jwtSecret) throw new AppError("Invalid user or password", 401);

      const jwtRefreshSecret: string | undefined =
        process.env.JWT_REFRESH_SECRET;
      if (!jwtRefreshSecret)
        throw new AppError("Invalid user or password", 401);

      decoded = jwt.verify(refreshToken, jwtRefreshSecret) as {
        userId: number;
      };

      const sessions: UserSession[] | null =
        await sessionsRepository.findByUser(decoded.userId);

      if (!sessions) {
        throw new AppError("Invalid refresh token", 401);
      }

      let validSession: UserSession | null = null;
      for (const session of sessions) {
        if (await verifyPassword(refreshToken, session.refresh_token_hash)) {
          validSession = session;
          break;
        }
      }

      if (!validSession) {
        await sessionsRepository.deleteUserSessions(decoded.userId);
        throw new AppError("Invalid refresh token", 401);
      }

      const newAccessToken: string = jwt.sign(
        { userId: decoded.userId },
        jwtSecret,
        { expiresIn: "15m" },
      );

      const newRefreshToken: string = jwt.sign(
        { userId: decoded.userId },
        jwtRefreshSecret,
        { expiresIn: "7d" },
      );

      await sessionsRepository.update(
        validSession.id,
        await hashPassword(newRefreshToken),
      );

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      if (decoded && error instanceof jwt.TokenExpiredError) {
        await sessionsRepository.deleteUserSessions(decoded.userId);
      }
      throw new AppError("Invalid refresh token", 401);
    }
  },

  async githubOAuth(accessToken: string, req?: Request) {
    const userRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}`, "User-Agent": "vetapp" },
    });
    if (!userRes.ok) throw new AppError("Invalid GitHub access token", 401);
    const githubUser = await userRes.json() as { id: number; name?: string; email?: string; login: string };

    let email = githubUser.email;
    if (!email) {
      const emailsRes = await fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${accessToken}`, "User-Agent": "vetapp" },
      });
      if (emailsRes.ok) {
        const emails = await emailsRes.json() as { email: string; primary: boolean; verified: boolean }[];
        email = emails.find((e) => e.primary && e.verified)?.email ?? emails[0]?.email;
      }
    }
    if (!email) throw new AppError("No email available on GitHub account", 400);

    const oauthId = String(githubUser.id);
    let user: User | null = await usersRepository.findByOAuthId("github", oauthId);

    if (!user) {
      const existingByEmail: User | null = await usersRepository.findByEmail(email);
      if (existingByEmail) {
        user = existingByEmail;
      } else {
        const role = await rolesRepository.findByLabel("user");
        if (!role) throw new AppError("Role not found", 404);

        const [firstName = githubUser.login, ...rest] = (githubUser.name ?? githubUser.login).split(" ");
        const lastName = rest.join(" ") || githubUser.login;

        user = await usersRepository.createOAuthUser({
          first_name: firstName,
          last_name: lastName,
          email,
          oauth_provider: "github",
          oauth_id: oauthId,
          role_id: role.id,
        });
      }
    }

    if (!user.is_activated) throw new AppError("Account is disabled", 403);

    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtSecret || !jwtRefreshSecret) throw new AppError("Server configuration error", 500);

    const newAccessToken = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: "7d" });
    const newRefreshToken = jwt.sign({ userId: user.id }, jwtRefreshSecret, { expiresIn: "24h" });

    const session: UserSession = await sessionsRepository.create(
      user.id,
      await hashPassword(newRefreshToken),
      req?.headers["user-agent"] || null,
      req?.ip || null,
    );

    return {
      userId: user.id,
      roleId: user.role_id,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      sessionId: session.id,
    };
  },

  async logout(userId: number): Promise<void> {
    if (!userId) throw new AppError("User id required for logout", 400);

    await sessionsRepository.deleteUserSessions(userId);
  },

  async resendCode(email: string): Promise<User> {
    if (email) {
      email = minimize(email);
    }

    const existingUser: User | null = await usersRepository.findByEmail(email);

    if (!existingUser) throw new AppError("User not found", 404);

    if (existingUser.email_verified)
      throw new AppError("Email already verified", 409);

    const verificationCode: string = generateVerificationCode();

    const user: User = await usersRepository.updateCodeVerification(
      existingUser.id,
      verificationCode,
    );

    await sendVerificationCodeEmail(user.email, verificationCode);

    return user;
  },

  async verifyCode(email: string, code: string): Promise<User> {
    if (email) {
      email = minimize(email);
    }

    const existingUser: User | null = await usersRepository.findByEmail(email);

    if (!existingUser) throw new AppError("User not found", 404);

    if (existingUser.email_verified)
      throw new AppError("Email already verified", 409);

    if (
      Number(existingUser.email_verification_code) !== Number(code) ||
      isCodeExpired(existingUser.email_verification_expires_at!)
    ) {
      throw new AppError("Invalid/expired code", 400);
    }

    return await usersRepository.updateEmailVerified(existingUser.id);
  },

  async changePassword(
    email: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<User> {
    if (email) {
      email = minimize(email);
    }

    const existingUser: User | null = await usersRepository.findByEmail(email);
    if (!existingUser) throw new AppError("User not found", 404);

    if (
      !existingUser.must_change_password &&
      existingUser.password_temp_expires_at == null
    )
      throw new AppError("Password already changed", 409);

    if (
      existingUser.password_temp_expires_at != null &&
      isPasswordExpired(existingUser.password_temp_expires_at!)
    ) {
      throw new AppError("Expired temp password", 400);
    }

    const checkOldPassword: boolean = await verifyPassword(
      oldPassword,
      existingUser.password_hash,
    );

    if (existingUser.password_temp_expires_at != null && !checkOldPassword) {
      throw new AppError("Invalid temp password", 409);
    }

    const passwordHash: string = await hashPassword(newPassword);
    if (!passwordHash) {
      throw new AppError("Internal Server Error", 500);
    }

    return await usersRepository.updatePassword(existingUser.id, passwordHash);
  },

  async resetPassword(
    email: string,
    password: string | undefined,
    mustChangePassword: boolean | null,
  ): Promise<User> {
    if (email) {
      email = minimize(email);
    }

    const existingUser: User | null = await usersRepository.findByEmail(email);
    if (!existingUser) throw new AppError("User not found", 404);

    let passwordGenerated: string;
    // if the password has been entered by the administrator
    if (password != undefined) {
      passwordGenerated = password;
    } else {
      passwordGenerated = generateSecurePassword();
    }

    const passwordHash: string = await hashPassword(passwordGenerated);
    if (!passwordHash) {
      throw new AppError("Internal Server Error", 500);
    }

    const user: User = await usersRepository.resetPassword(
      existingUser.id,
      passwordHash,
      mustChangePassword,
    );

    if (
      (password != undefined &&
        mustChangePassword != undefined &&
        !mustChangePassword) ||
      (password == undefined &&
        mustChangePassword != undefined &&
        !mustChangePassword)
    ) {
      await sendFinalPasswordEmail(user.email, passwordGenerated);
    } else {
      await sendTempPasswordEmail(user.email, passwordGenerated);
    }

    return user;
  },
};

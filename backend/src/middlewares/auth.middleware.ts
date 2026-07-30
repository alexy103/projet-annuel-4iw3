import { Request, Response, NextFunction } from "express";
import ApiResponse from "../utils/api-responses.utils";
import jwt from "jsonwebtoken";
import {AppError, AuthenticatedRequest, JwtPayload} from "../types";
import {
  rolesRepository,
  sessionsRepository,
  usersRepository,
} from "../repositories";
import { User, Role } from "../schemas";

export const requireAuth = (...allowedRoles: string[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const authHeader: string | undefined = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ApiResponse.unauthorized(res, "Bearer token required");
    }

    const token: string = authHeader.replace("Bearer ", "");

    try {
      const jwtSecret: string | undefined = process.env.JWT_SECRET;
      if (!jwtSecret) throw new AppError("Server configuration error", 500);

      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

      const sessions = await sessionsRepository.findByUser(decoded.userId);
      if (!sessions || sessions.length === 0) {
        return ApiResponse.unauthorized(res, "Invalid/Expired token");
      }

      const user: User = await usersRepository.findById(decoded.userId);
      const userRole: Role = await rolesRepository.findById(user.role_id);

      if (allowedRoles.length == 0) {
        allowedRoles = ["admin", "user", "clinic"];
      }
      const hasRole: boolean = allowedRoles.some(
        (role: string) => userRole.label === role,
      );
      if (!hasRole) {
        return ApiResponse.forbidden(res, "Permission denied");
      }

      (req as AuthenticatedRequest).user = {
        userId: decoded.userId,
        role: userRole.label,
        ...(user.clinic_id !== undefined && { clinic_id: user.clinic_id }),
      };
      next();
    } catch {
      return ApiResponse.unauthorized(res, "Invalid/Expired token");
    }
  };
};

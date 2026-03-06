import { Request, Response } from "express";
import ApiResponse from "../utils/api-responses.utils";
import { User } from "../schemas";
import { authService } from "../services";
import { AuthenticatedRequest } from "../types";

export const login = async (req: Request, res: Response) => {
  try {
    const email: string | undefined = req.body.email;
    const password: string | undefined = req.body.password;

    if (
      email === undefined ||
      email === null ||
      password === undefined ||
      password === null
    ) {
      return ApiResponse.badRequest(res, "Email and password are required");
    }

    const user = await authService.login(email, password, req);
    return ApiResponse.success(res, user);
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const user = await authService.register(req.body);
    return ApiResponse.success(res, user);
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken: string | undefined = req.body.refresh_token;
    if (refreshToken === undefined || refreshToken === null) {
      return ApiResponse.badRequest(res, "Refresh token is required");
    }

    const session = await authService.refreshToken(refreshToken);

    return ApiResponse.success(res, {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const userId: number = (req as AuthenticatedRequest).user.userId;

    if (!userId) {
      return ApiResponse.unauthorized(res, "User not authenticated");
    }
    await authService.logout(userId);
    return ApiResponse.success(res, "Logged out successfully");
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
};

export const resendCode = async (req: Request, res: Response) => {
  try {
    const email: string | undefined = req.body.email;
    if (email === undefined || email === null) {
      return ApiResponse.badRequest(res, "Email and code are required");
    }

    const user: User = await authService.resendCode(email);
    return ApiResponse.success(res, user);
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
};

export const verifyCode = async (req: Request, res: Response) => {
  try {
    const email: string | undefined = req.body.email;
    const code: string | undefined = req.body.code;

    if (
      email === undefined ||
      email === null ||
      code === undefined ||
      code === null
    ) {
      return ApiResponse.badRequest(res, "Email and code are required");
    }

    const user: User = await authService.verifyCode(email, code);
    return ApiResponse.success(res, user);
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const email: string | undefined = req.body.email;
    const newPassword: string | undefined = req.body.new_password;
    const oldPassword: string | undefined = req.body.old_password;

    if (
      email === undefined ||
      email === null ||
      newPassword === undefined ||
      newPassword === null ||
      oldPassword === undefined ||
      oldPassword === null
    ) {
      return ApiResponse.badRequest(res, "Email and password are required");
    }

    const user: User = await authService.changePassword(
      email,
      oldPassword,
      newPassword,
    );
    return ApiResponse.success(res, user);
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const email: string | undefined = req.body.email;
    const password: string | undefined = req.body.password;
    const mustChangePassword: boolean | null = req.body.must_change_password;

    if (email === undefined || email === null) {
      return ApiResponse.badRequest(res, "Email is required");
    }

    const user: User = await authService.resetPassword(
      email,
      password,
      mustChangePassword,
    );
    return ApiResponse.success(res, user);
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
};

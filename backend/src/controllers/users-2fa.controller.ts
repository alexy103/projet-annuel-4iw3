import { Request, Response } from "express";
import ApiResponse from "../utils/api-responses.utils";
import { Users2FA } from "../schemas";
import { users2FAService } from "../services";
import { AuthenticatedRequest } from "../types";

export const getUsers2FA = async (req: Request, res: Response) => {
  try {
    const records: Users2FA[] = await users2FAService.getAll();

    return ApiResponse.success(res, records);
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
};

export const getUsers2FAById = async (req: Request, res: Response) => {
  try {
    const id: string | undefined = req.params.id;

    if (id === undefined || id === null) {
      return ApiResponse.badRequest(res, "ID is required");
    }

    const record: Users2FA = await users2FAService.getById(Number(id));

    return ApiResponse.success(res, record);
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
};

export const createUsers2FA = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.userId;
    req.body = {
      ...req.body,
      user_id: userId,
    };
    const record: Users2FA = await users2FAService.create(req.body);

    return ApiResponse.success(res, record, 201);
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
};

export const updateUsers2FA = async (req: Request, res: Response) => {
  try {
    const id: string | undefined = req.params.id;

    if (id === undefined || id === null) {
      return ApiResponse.badRequest(res, "ID is required");
    }

    const record: Users2FA = await users2FAService.update(Number(id), req.body);

    return ApiResponse.success(res, record);
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
};

export const deleteUsers2FA = async (req: Request, res: Response) => {
  try {
    const id: string | undefined = req.params.id;

    if (id === undefined || id === null) {
      return ApiResponse.badRequest(res, "ID is required");
    }

    const record: Users2FA = await users2FAService.delete(Number(id));

    return ApiResponse.success(res, record);
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
};

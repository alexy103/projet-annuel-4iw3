import { Request, Response } from "express";
import ApiResponse from "../utils/api-responses.utils";
import { permissionService } from "../services";
import { Permission } from "../schemas";
import { AuthenticatedRequest } from "../types";

export const getPermissions = async (req: Request, res: Response) => {
  try {
    const permissions: Permission[] = await permissionService.getAll();
    return ApiResponse.success(res, permissions);
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
};

export const getPermissionById = async (req: Request, res: Response) => {
  try {
    const permissionId: string | undefined = req.params.permissionId;
    if (permissionId === undefined || permissionId === null) {
      return ApiResponse.notFound(res, "Permission ID is required");
    }
    const permission: Permission = await permissionService.getById(
      Number(permissionId),
    );
    return ApiResponse.success(res, permission);
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
};

export const getPermissionByLabel = async (req: Request, res: Response) => {
  try {
    const label: string | undefined = req.params.label;
    if (label === undefined || label === null) {
      return ApiResponse.notFound(res, "Permission label is required");
    }
    const permission: Permission = await permissionService.getByLabel(label);
    return ApiResponse.success(res, permission);
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
};

export const createPermission = async (req: Request, res: Response) => {
  try {
    const permission: Permission = await permissionService.create(req.body);
    return ApiResponse.success(res, permission, 201);
  } catch (error) {
    ApiResponse.getError(res, error);
  }
};

export const updatePermission = async (req: Request, res: Response) => {
  try {
    const permissionId: string | undefined = req.params.permissionId;
    if (permissionId === undefined || permissionId === null) {
      return ApiResponse.notFound(res, "Permission ID is required");
    }
    const permission: Permission = await permissionService.update(
      Number(permissionId),
      req.body,
    );
    return ApiResponse.success(res, permission);
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
};

export const deletePermission = async (req: Request, res: Response) => {
  try {
    const userId: number = (req as AuthenticatedRequest).user.userId;

    const permissionId: string | undefined = req.params.permissionId;
    if (permissionId === undefined || permissionId === null) {
      return ApiResponse.notFound(res, "Permission ID is required");
    }
    const permission: Permission = await permissionService.delete(
      Number(permissionId),
      userId,
    );
    return ApiResponse.success(res, permission);
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
};

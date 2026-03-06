import { Request, Response } from "express";
import { roleService } from "../services";
import { Role } from "../schemas";
import ApiResponse from "../utils/api-responses.utils";

export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles: Role[] = await roleService.getAll();
    return ApiResponse.success(res, roles);
  } catch (error) {
    ApiResponse.getError(res, error);
  }
};

export const getRoleById = async (req: Request, res: Response) => {
  try {
    const roleId: string | undefined = req.params.roleId;
    if (roleId === undefined || roleId === null) {
      return ApiResponse.notFound(res, "Role ID is required");
    }
    const role: Role = await roleService.getById(Number(roleId));
    return ApiResponse.success(res, role);
  } catch (error) {
    ApiResponse.getError(res, error);
  }
};

export const createRole = async (req: Request, res: Response) => {
  try {
    const role: Role = await roleService.create(req.body);
    return ApiResponse.success(res, role, 201);
  } catch (error) {
    ApiResponse.getError(res, error);
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    const roleId: string | undefined = req.params.roleId;
    if (roleId === undefined || roleId === null) {
      return ApiResponse.notFound(res, "Role ID is required");
    }
    const role: Role = await roleService.update(Number(roleId), req.body);
    return ApiResponse.success(res, role);
  } catch (error) {
    ApiResponse.getError(res, error);
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const roleId: string | undefined = req.params.roleId;
    if (roleId === undefined || roleId === null) {
      return ApiResponse.notFound(res, "Role ID is required");
    }
    const role: Role = await roleService.delete(Number(roleId));
    return ApiResponse.success(res, role);
  } catch (error) {
    ApiResponse.getError(res, error);
  }
};

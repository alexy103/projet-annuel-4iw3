import { Request, Response } from "express";
import ApiResponse from "../utils/api-responses.utils";
import { User, UserPermission } from "../schemas";
import { userService } from "../services";
import {AuthenticatedRequest} from "../types";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const isActivated: string = String(req.query.active);
    const users: User[] = await userService.getAll(isActivated);
    return ApiResponse.success(res, users);
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId: string | undefined = req.params.userId;
    if (userId === undefined || userId === null) {
      return ApiResponse.badRequest(res, "User ID is required");
    }

    const user: User = await userService.getById(Number(userId));
    return ApiResponse.success(res, user);
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const user: User = await userService.create(req.body);
    return ApiResponse.success(res, user, 201);
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId: string | undefined = req.params.userId;
    if (userId === undefined || userId === null) {
      return ApiResponse.badRequest(res, "User ID is required");
    }

    const user: User = await userService.update(Number(userId), req.body);
    return ApiResponse.success(res, user);
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
};

export const updateUserEmailVerified = async (req: Request, res: Response) => {
  try {
    const userId: string | undefined = req.params.userId;
    if (userId === undefined || userId === null) {
      return ApiResponse.badRequest(res, "User ID is required");
    }

    const user: User = await userService.updateEmailVerified(Number(userId));
    return ApiResponse.success(res, user);
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
};

export const updateUserClinicId = async (req: Request, res: Response) => {
  try {
    const userId: string | undefined = req.params.userId;
    const clinicId : number = req.body.clinic_id;
    if (
      userId === undefined ||
      userId === null
    ) {
      return ApiResponse.badRequest(
        res,
        "User ID is required",
      );
    }

    const user: User = await userService.setClinic(
      Number(userId),
      clinicId,
    );
    return ApiResponse.success(res, user);
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
};

export const toggleUserActivation = async (req: Request, res: Response) => {
  try {
    const userId: string | undefined = req.params.userId;
    const isActivated: boolean = req.body.isActivated;
    if (
        userId === undefined ||
        userId === null ||
        isActivated === undefined ||
        isActivated == null
    ) {
      return ApiResponse.badRequest(
          res,
          "User ID and isActivated are required",
      );
    }

    const user: User = await userService.setActivation(
        Number(userId),
        isActivated,
    );
    return ApiResponse.success(res, user);
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
};

export const completeUserOnboarding = async (req: Request, res: Response) => {
  try {
    const userId: string | undefined = req.params.userId;
    if (!userId) return ApiResponse.badRequest(res, "User ID is required");

    const { userId: callerId, role } = (req as AuthenticatedRequest).user;
    const user: User = await userService.completeOnboarding(Number(userId), callerId, role);
    return ApiResponse.success(res, user);
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId: string | undefined = req.params.userId;
    if (userId === undefined || userId === null) {
      return ApiResponse.badRequest(res, "User ID is required");
    }

    const user: User = await userService.delete(Number(userId));
    return ApiResponse.success(res, user);
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
}

export const getPermissionsByUserId = async (req: Request, res: Response) => {
  try {
    const userId: string | undefined = req.params.userId;
    if (userId === undefined || userId === null) {
      return ApiResponse.badRequest(res, "User ID is required");
    }
    const userPermissions: UserPermission[] = await userService.findPermissionsByUserId(
      Number(userId),
    );
    return ApiResponse.success(res, userPermissions);
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
};

export const createPermissionToUser = async (req: Request, res: Response) => {
  try {
    const userId: string | undefined = req.body.user_id;
    const permissionId: string | undefined = req.body.permission_id;
    if (
      userId === undefined ||
      userId === null ||
      permissionId === undefined ||
      permissionId === null
    ) {
      return ApiResponse.badRequest(res, "User ID and Permission ID is required");
    }
    await userService.createPermissionToUser(Number(userId), Number(permissionId));
    return ApiResponse.success(res, "Permission has been associated with user");
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
};

export const deletePermissionFromUser = async (req: Request, res: Response) => {
  try {
    const userId: string | undefined = req.params.userId;
    const permissionId: string | undefined = req.params.permissionId;
    if (
      userId === undefined ||
      userId === null ||
      permissionId === undefined ||
      permissionId === null
    ) {
      return ApiResponse.badRequest(res, "User ID and Permission ID is required");
    }
    await userService.deletePermissionFromUser(Number(userId), Number(permissionId));
    return ApiResponse.success(res, 'Permission has been deleted with user"');
  } catch (error) {
    return ApiResponse.getError(res, error);
  }
};
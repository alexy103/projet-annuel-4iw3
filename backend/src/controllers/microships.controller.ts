import { Request, Response } from "express";
import ApiResponse from "../utils/api-responses.utils";
import { Microship } from "../schemas";
import { microshipService } from "../services";
import { AuthenticatedRequest } from "../types";

export const getMicroships = async (req: Request, res: Response) => {
    try {
        const { userId, role } = (req as AuthenticatedRequest).user;
        const microships: Microship[] = await microshipService.getAll(userId, role);
        return ApiResponse.success(res, microships);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getMicroshipById = async (req: Request, res: Response) => {
    try {
        const microshipId: string | undefined = req.params.microshipId;
        if (microshipId === undefined || microshipId === null) {
            return ApiResponse.badRequest(res, "Microship ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const microship: Microship = await microshipService.getById(Number(microshipId), userId, role);
        return ApiResponse.success(res, microship);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getMicroshipsByUserId = async (req: Request, res: Response) => {
    try {
        const userId: string | undefined = req.params.userId;
        if (userId === undefined || userId === null) {
            return ApiResponse.badRequest(res, "User ID is required");
        }

        const microships: Microship[] = await microshipService.getByUserId(Number(userId));
        return ApiResponse.success(res, microships);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const createMicroship = async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthenticatedRequest).user.userId;
        const microship: Microship = await microshipService.create({ ...req.body, user_id: userId });
        return ApiResponse.success(res, microship, 201);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const updateMicroship = async (req: Request, res: Response) => {
    try {
        const microshipId: string | undefined = req.params.microshipId;
        if (microshipId === undefined || microshipId === null) {
            return ApiResponse.badRequest(res, "Microship ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const microship: Microship = await microshipService.update(Number(microshipId), req.body, userId, role);
        return ApiResponse.success(res, microship);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const deleteMicroship = async (req: Request, res: Response) => {
    try {
        const microshipId: string | undefined = req.params.microshipId;
        if (microshipId === undefined || microshipId === null) {
            return ApiResponse.badRequest(res, "Microship ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const microship: Microship = await microshipService.delete(Number(microshipId), userId, role);
        return ApiResponse.success(res, microship);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

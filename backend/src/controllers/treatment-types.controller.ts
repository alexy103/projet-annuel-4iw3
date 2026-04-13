import { Request, Response } from "express";
import ApiResponse from "../utils/api-responses.utils";
import { TreatmentType } from "../schemas";
import { treatmentTypeService } from "../services";
import { AuthenticatedRequest } from "../types";

export const getTreatmentTypes = async (req: Request, res: Response) => {
    try {
        const { userId, role } = (req as AuthenticatedRequest).user;
        const types: TreatmentType[] = await treatmentTypeService.getAll(userId, role);
        return ApiResponse.success(res, types);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getTreatmentTypeById = async (req: Request, res: Response) => {
    try {
        const typeId: string | undefined = req.params.typeId;
        if (typeId === undefined || typeId === null) {
            return ApiResponse.badRequest(res, "Treatment type ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const type: TreatmentType = await treatmentTypeService.getById(Number(typeId), userId, role);
        return ApiResponse.success(res, type);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getTreatmentTypesByUserId = async (req: Request, res: Response) => {
    try {
        const userId: string | undefined = req.params.userId;
        if (userId === undefined || userId === null) {
            return ApiResponse.badRequest(res, "User ID is required");
        }

        const types: TreatmentType[] = await treatmentTypeService.getByUserId(Number(userId));
        return ApiResponse.success(res, types);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getTreatmentTypesByName = async (req: Request, res: Response) => {
    try {
        const name: string | undefined = req.query.name ? String(req.query.name) : undefined;
        if (!name) {
            return ApiResponse.badRequest(res, "Name is required");
        }

        const types: TreatmentType[] = await treatmentTypeService.getByName(name);
        return ApiResponse.success(res, types);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const createTreatmentType = async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthenticatedRequest).user.userId;
        const type: TreatmentType = await treatmentTypeService.create({ ...req.body, user_id: userId });
        return ApiResponse.success(res, type, 201);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const updateTreatmentType = async (req: Request, res: Response) => {
    try {
        const typeId: string | undefined = req.params.typeId;
        if (typeId === undefined || typeId === null) {
            return ApiResponse.badRequest(res, "Treatment type ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const type: TreatmentType = await treatmentTypeService.update(Number(typeId), req.body, userId, role);
        return ApiResponse.success(res, type);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const deleteTreatmentType = async (req: Request, res: Response) => {
    try {
        const typeId: string | undefined = req.params.typeId;
        if (typeId === undefined || typeId === null) {
            return ApiResponse.badRequest(res, "Treatment type ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const type: TreatmentType = await treatmentTypeService.delete(Number(typeId), userId, role);
        return ApiResponse.success(res, type);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

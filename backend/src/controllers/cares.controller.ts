import { Request, Response } from "express";
import ApiResponse from "../utils/api-responses.utils";
import { Care } from "../schemas";
import { careService } from "../services";
import { AuthenticatedRequest } from "../types";

export const getCares = async (req: Request, res: Response) => {
    try {
        const { userId, role } = (req as AuthenticatedRequest).user;
        const cares: Care[] = await careService.getAll(userId, role);
        return ApiResponse.success(res, cares);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getCareById = async (req: Request, res: Response) => {
    try {
        const careId: string | undefined = req.params.careId;
        if (careId === undefined || careId === null) {
            return ApiResponse.badRequest(res, "Care ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const care: Care = await careService.getById(Number(careId), userId, role);
        return ApiResponse.success(res, care);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getCaresByAnimalId = async (req: Request, res: Response) => {
    try {
        const animalId: string | undefined = req.params.animalId;
        if (animalId === undefined || animalId === null) {
            return ApiResponse.badRequest(res, "Animal ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const cares: Care[] = await careService.getByAnimalId(Number(animalId), userId, role);
        return ApiResponse.success(res, cares);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getCaresByTreatmentTypeId = async (req: Request, res: Response) => {
    try {
        const treatmentTypeId: string | undefined = req.params.treatmentTypeId;
        if (treatmentTypeId === undefined || treatmentTypeId === null) {
            return ApiResponse.badRequest(res, "Treatment Type ID is required");
        }

        const cares: Care[] = await careService.getByTreatmentTypeId(Number(treatmentTypeId));
        return ApiResponse.success(res, cares);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const createCare = async (req: Request, res: Response) => {
    try {
        const { userId, role } = (req as AuthenticatedRequest).user;
        const care: Care = await careService.create(req.body, userId, role);
        return ApiResponse.success(res, care, 201);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const updateCare = async (req: Request, res: Response) => {
    try {
        const careId: string | undefined = req.params.careId;
        if (careId === undefined || careId === null) {
            return ApiResponse.badRequest(res, "Care ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const care: Care = await careService.update(Number(careId), req.body, userId, role);
        return ApiResponse.success(res, care);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const deleteCare = async (req: Request, res: Response) => {
    try {
        const careId: string | undefined = req.params.careId;
        if (careId === undefined || careId === null) {
            return ApiResponse.badRequest(res, "Care ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const care: Care = await careService.delete(Number(careId), userId, role);
        return ApiResponse.success(res, care);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

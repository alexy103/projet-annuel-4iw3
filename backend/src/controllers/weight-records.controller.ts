import { Request, Response } from "express";
import ApiResponse from "../utils/api-responses.utils";
import { WeightRecord } from "../schemas";
import { weightRecordService } from "../services";
import { AuthenticatedRequest } from "../types";

export const getWeightRecords = async (req: Request, res: Response) => {
    try {
        const { userId, role } = (req as AuthenticatedRequest).user;
        const records: WeightRecord[] = await weightRecordService.getAll(userId, role);
        return ApiResponse.success(res, records);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getWeightRecordById = async (req: Request, res: Response) => {
    try {
        const weightRecordId: string | undefined = req.params.weightRecordId;
        if (weightRecordId === undefined || weightRecordId === null) {
            return ApiResponse.badRequest(res, "Weight record ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const record: WeightRecord = await weightRecordService.getById(Number(weightRecordId), userId, role);
        return ApiResponse.success(res, record);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getWeightRecordsByAnimalId = async (req: Request, res: Response) => {
    try {
        const animalId: string | undefined = req.params.animalId;
        if (animalId === undefined || animalId === null) {
            return ApiResponse.badRequest(res, "Animal ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const records: WeightRecord[] = await weightRecordService.getByAnimalId(Number(animalId), userId, role);
        return ApiResponse.success(res, records);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const createWeightRecord = async (req: Request, res: Response) => {
    try {
        const { userId, role } = (req as AuthenticatedRequest).user;
        const record: WeightRecord = await weightRecordService.create(req.body, userId, role);
        return ApiResponse.success(res, record, 201);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const updateWeightRecord = async (req: Request, res: Response) => {
    try {
        const weightRecordId: string | undefined = req.params.weightRecordId;
        if (weightRecordId === undefined || weightRecordId === null) {
            return ApiResponse.badRequest(res, "Weight record ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const record: WeightRecord = await weightRecordService.update(Number(weightRecordId), req.body, userId, role);
        return ApiResponse.success(res, record);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const deleteWeightRecord = async (req: Request, res: Response) => {
    try {
        const weightRecordId: string | undefined = req.params.weightRecordId;
        if (weightRecordId === undefined || weightRecordId === null) {
            return ApiResponse.badRequest(res, "Weight record ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const record: WeightRecord = await weightRecordService.delete(Number(weightRecordId), userId, role);
        return ApiResponse.success(res, record);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

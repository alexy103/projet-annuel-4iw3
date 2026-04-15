import { Request, Response } from "express";
import ApiResponse from "../utils/api-responses.utils";
import { HeightRecord } from "../schemas";
import { heightRecordService } from "../services";
import { AuthenticatedRequest } from "../types";

export const getHeightRecords = async (req: Request, res: Response) => {
    try {
        const { userId, role } = (req as AuthenticatedRequest).user;
        const records: HeightRecord[] = await heightRecordService.getAll(userId, role);
        return ApiResponse.success(res, records);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getHeightRecordById = async (req: Request, res: Response) => {
    try {
        const heightRecordId: string | undefined = req.params.heightRecordId;
        if (heightRecordId === undefined || heightRecordId === null) {
            return ApiResponse.badRequest(res, "Height record ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const record: HeightRecord = await heightRecordService.getById(Number(heightRecordId), userId, role);
        return ApiResponse.success(res, record);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getHeightRecordsByAnimalId = async (req: Request, res: Response) => {
    try {
        const animalId: string | undefined = req.params.animalId;
        if (animalId === undefined || animalId === null) {
            return ApiResponse.badRequest(res, "Animal ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const records: HeightRecord[] = await heightRecordService.getByAnimalId(Number(animalId), userId, role);
        return ApiResponse.success(res, records);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const createHeightRecord = async (req: Request, res: Response) => {
    try {
        const record: HeightRecord = await heightRecordService.create(req.body);
        return ApiResponse.success(res, record, 201);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const updateHeightRecord = async (req: Request, res: Response) => {
    try {
        const heightRecordId: string | undefined = req.params.heightRecordId;
        if (heightRecordId === undefined || heightRecordId === null) {
            return ApiResponse.badRequest(res, "Height record ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const record: HeightRecord = await heightRecordService.update(Number(heightRecordId), req.body, userId, role);
        return ApiResponse.success(res, record);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const deleteHeightRecord = async (req: Request, res: Response) => {
    try {
        const heightRecordId: string | undefined = req.params.heightRecordId;
        if (heightRecordId === undefined || heightRecordId === null) {
            return ApiResponse.badRequest(res, "Height record ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const record: HeightRecord = await heightRecordService.delete(Number(heightRecordId), userId, role);
        return ApiResponse.success(res, record);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

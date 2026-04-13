import { Request, Response } from "express";
import ApiResponse from "../utils/api-responses.utils";
import { ReminderFrequency } from "../schemas";
import { reminderFrequencyService } from "../services";

export const getReminderFrequencies = async (
    req: Request,
    res: Response,
) => {
    try {
        const frequencies: ReminderFrequency[] =
            await reminderFrequencyService.getAll();

        return ApiResponse.success(res, frequencies);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getReminderFrequencyById = async (
    req: Request,
    res: Response,
) => {
    try {
        const frequencyId: string | undefined =
            req.params.frequencyId;

        if (
            frequencyId === undefined ||
            frequencyId === null
        ) {
            return ApiResponse.badRequest(
                res,
                "Frequency ID is required",
            );
        }

        const frequency: ReminderFrequency =
            await reminderFrequencyService.getById(
                Number(frequencyId),
            );

        return ApiResponse.success(res, frequency);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const createReminderFrequency = async (
    req: Request,
    res: Response,
) => {
    try {
        const frequency: ReminderFrequency =
            await reminderFrequencyService.create(req.body);

        return ApiResponse.success(res, frequency, 201);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const updateReminderFrequency = async (
    req: Request,
    res: Response,
) => {
    try {
        const frequencyId: string | undefined =
            req.params.frequencyId;

        if (
            frequencyId === undefined ||
            frequencyId === null
        ) {
            return ApiResponse.badRequest(
                res,
                "Frequency ID is required",
            );
        }

        const frequency: ReminderFrequency =
            await reminderFrequencyService.update(
                Number(frequencyId),
                req.body,
            );

        return ApiResponse.success(res, frequency);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const deleteReminderFrequency = async (
    req: Request,
    res: Response,
) => {
    try {
        const frequencyId: string | undefined =
            req.params.frequencyId;

        if (
            frequencyId === undefined ||
            frequencyId === null
        ) {
            return ApiResponse.badRequest(
                res,
                "Frequency ID is required",
            );
        }

        const frequency: ReminderFrequency =
            await reminderFrequencyService.delete(
                Number(frequencyId),
            );

        return ApiResponse.success(res, frequency);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};
import { Request, Response } from "express";
import ApiResponse from "../utils/api-responses.utils";
import { TreatmentReminder } from "../schemas";
import { treatmentReminderService } from "../services";
import { AuthenticatedRequest } from "../types";

export const getByTreatmentId = async (req: Request, res: Response) => {
    try {
        const treatmentId: string | undefined = req.params.treatmentId;
        if (treatmentId === undefined || treatmentId === null) {
            return ApiResponse.badRequest(res, "Treatment ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const reminders: TreatmentReminder[] = await treatmentReminderService.getByTreatmentId(
            Number(treatmentId),
            userId,
            role,
        );
        return ApiResponse.success(res, reminders);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getByReminderFrequencyId = async (req: Request, res: Response) => {
    try {
        const frequencyId: string | undefined = req.params.frequencyId;
        if (frequencyId === undefined || frequencyId === null) {
            return ApiResponse.badRequest(res, "Frequency ID is required");
        }

        const reminders: TreatmentReminder[] = await treatmentReminderService.getByReminderFrequencyId(
            Number(frequencyId),
        );
        return ApiResponse.success(res, reminders);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getByTreatmentAndFrequency = async (req: Request, res: Response) => {
    try {
        const treatmentId: string | undefined = req.params.treatmentId;
        const frequencyId: string | undefined = req.params.frequencyId;
        if (treatmentId === undefined || treatmentId === null || frequencyId === undefined || frequencyId === null) {
            return ApiResponse.badRequest(res, "Treatment ID and Frequency ID are required");
        }

        const reminder: TreatmentReminder | null = await treatmentReminderService.getByTreatmentAndFrequency(
            Number(treatmentId),
            Number(frequencyId),
        );
        return ApiResponse.success(res, reminder);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const createTreatmentReminder = async (req: Request, res: Response) => {
    try {
        const treatmentId: string | undefined = req.body.treatment_id;
        const frequencyId: string | undefined = req.body.reminder_frequency_id;
        if (treatmentId === undefined || treatmentId === null || frequencyId === undefined || frequencyId === null) {
            return ApiResponse.badRequest(res, "Treatment ID and Frequency ID are required");
        }

        const reminder: TreatmentReminder = await treatmentReminderService.create(req.body);
        return ApiResponse.success(res, reminder, 201);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const deleteTreatmentReminder = async (req: Request, res: Response) => {
    try {
        const treatmentId: string | undefined = req.params.treatmentId;
        const frequencyId: string | undefined = req.params.frequencyId;
        if (treatmentId === undefined || treatmentId === null || frequencyId === undefined || frequencyId === null) {
            return ApiResponse.badRequest(res, "Treatment ID and Frequency ID are required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const reminder: TreatmentReminder = await treatmentReminderService.delete(
            Number(treatmentId),
            Number(frequencyId),
            userId,
            role,
        );
        return ApiResponse.success(res, reminder);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

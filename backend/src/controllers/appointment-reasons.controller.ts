import { Request, Response } from "express";
import ApiResponse from "../utils/api-responses.utils";
import { AppointmentReason } from "../schemas";
import { appointmentReasonService } from "../services";

export const getAppointmentReasons = async (req: Request, res: Response) => {
    try {
        const reasons: AppointmentReason[] = await appointmentReasonService.getAll();
        return ApiResponse.success(res, reasons);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getAppointmentReasonById = async (req: Request, res: Response) => {
    try {
        const reasonId: string | undefined = req.params.reasonId;
        if (reasonId === undefined || reasonId === null) {
            return ApiResponse.badRequest(res, "Reason ID is required");
        }

        const reason: AppointmentReason = await appointmentReasonService.getById(Number(reasonId));
        return ApiResponse.success(res, reason);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getAppointmentReasonByLabel = async (req: Request, res: Response) => {
    try {
        const label: string | undefined = String(req.query.label);
        if (label === undefined || label === null || label === "") {
            return ApiResponse.badRequest(res, "Label is required");
        }

        const reasons: AppointmentReason[] = await appointmentReasonService.getByLabel(label);
        return ApiResponse.success(res, reasons);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const createAppointmentReason = async (req: Request, res: Response) => {
    try {
        const reason: AppointmentReason = await appointmentReasonService.create(req.body);
        return ApiResponse.success(res, reason, 201);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const updateAppointmentReason = async (req: Request, res: Response) => {
    try {
        const reasonId: string | undefined = req.params.reasonId;
        if (reasonId === undefined || reasonId === null) {
            return ApiResponse.badRequest(res, "Reason ID is required");
        }

        const reason: AppointmentReason = await appointmentReasonService.update(Number(reasonId), req.body);
        return ApiResponse.success(res, reason);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const deleteAppointmentReason = async (req: Request, res: Response) => {
    try {
        const reasonId: string | undefined = req.params.reasonId;
        if (reasonId === undefined || reasonId === null) {
            return ApiResponse.badRequest(res, "Reason ID is required");
        }

        const reason: AppointmentReason = await appointmentReasonService.delete(Number(reasonId));
        return ApiResponse.success(res, reason);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

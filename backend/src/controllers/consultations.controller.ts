import { Request, Response } from "express";
import ApiResponse from "../utils/api-responses.utils";
import { Consultation } from "../schemas";
import { consultationService } from "../services";

export const getConsultations = async (req: Request, res: Response) => {
    try {
        const consultations: Consultation[] =
            await consultationService.getAll();

        return ApiResponse.success(res, consultations);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getConsultationById = async (
    req: Request,
    res: Response,
) => {
    try {
        const consultationId: string | undefined =
            req.params.consultationId;

        if (consultationId === undefined || consultationId === null) {
            return ApiResponse.badRequest(
                res,
                "Consultation ID is required",
            );
        }

        const consultation: Consultation =
            await consultationService.getById(Number(consultationId));

        return ApiResponse.success(res, consultation);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getConsultationsByAppointmentId = async (
    req: Request,
    res: Response,
) => {
    try {
        const appointmentId: string | undefined =
            req.params.appointmentId;

        if (appointmentId === undefined || appointmentId === null) {
            return ApiResponse.badRequest(
                res,
                "Appointment ID is required",
            );
        }

        const consultations: Consultation =
            await consultationService.getByAppointmentId(
                Number(appointmentId),
            );

        return ApiResponse.success(res, consultations);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getConsultationsByVeterinarianId = async (
    req: Request,
    res: Response,
) => {
    try {
        const veterinarianId: string | undefined =
            req.params.veterinarianId;

        if (
            veterinarianId === undefined ||
            veterinarianId === null
        ) {
            return ApiResponse.badRequest(
                res,
                "Veterinarian ID is required",
            );
        }

        const consultations: Consultation[] =
            await consultationService.getByVeterinarianId(
                Number(veterinarianId),
            );

        return ApiResponse.success(res, consultations);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const createConsultation = async (
    req: Request,
    res: Response,
) => {
    try {
        const consultation: Consultation =
            await consultationService.create(req.body);

        return ApiResponse.success(res, consultation, 201);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const updateConsultation = async (
    req: Request,
    res: Response,
) => {
    try {
        const consultationId: string | undefined =
            req.params.consultationId;

        if (consultationId === undefined || consultationId === null) {
            return ApiResponse.badRequest(
                res,
                "Consultation ID is required",
            );
        }

        const consultation: Consultation =
            await consultationService.update(
                Number(consultationId),
                req.body,
            );

        return ApiResponse.success(res, consultation);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const deleteConsultation = async (
    req: Request,
    res: Response,
) => {
    try {
        const consultationId: string | undefined =
            req.params.consultationId;

        if (consultationId === undefined || consultationId === null) {
            return ApiResponse.badRequest(
                res,
                "Consultation ID is required",
            );
        }

        const consultation: Consultation =
            await consultationService.delete(Number(consultationId));

        return ApiResponse.success(res, consultation);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};
import { Request, Response } from "express";
import ApiResponse from "../utils/api-responses.utils";
import {
    Clinic,
    ClinicStatus,
    RegisterClinicPayloadSchema,
    UpdateClinicStatusPayloadSchema,
} from "../schemas";
import { clinicService } from "../services";
import { AuthenticatedRequest } from "../types";

export const getClinics = async (req: Request, res: Response) => {
    try {
        const { role, clinic_id } = (req as AuthenticatedRequest).user;
        const status: ClinicStatus | undefined = req.query.status
            ? (String(req.query.status) as ClinicStatus)
            : undefined;
        const clinics: Clinic[] = await clinicService.getAll(role, clinic_id, status);
        return ApiResponse.success(res, clinics);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getClinicById = async (req: Request, res: Response) => {
    try {
        const clinicId: string | undefined = req.params.clinicId;
        if (clinicId === undefined || clinicId === null) {
            return ApiResponse.badRequest(res, "Clinic ID is required");
        }

        const { role, clinic_id } = (req as AuthenticatedRequest).user;
        const clinic: Clinic = await clinicService.getById(Number(clinicId), role, clinic_id);
        return ApiResponse.success(res, clinic);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getClinicsByName = async (
    req: Request,
    res: Response,
) => {
    try {
        const name: string | undefined = req.query.name
            ? String(req.query.name)
            : undefined;

        if (!name) {
            return ApiResponse.badRequest(res, "Name is required");
        }

        const clinics: Clinic[] =
            await clinicService.getByName(name);

        return ApiResponse.success(res, clinics);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getClinicsByCriteria = async (req: Request, res: Response) => {
    try {
        const phoneNumber: string | undefined = req.query.phoneNumber
            ? String(req.query.phoneNumber)
            : undefined;

        const postcode: string | undefined = req.query.postcode
            ? String(req.query.postcode)
            : undefined;

        const city: string | undefined = req.query.city
            ? String(req.query.city)
            : undefined;

        const address: string | undefined = req.query.address
            ? String(req.query.address)
            : undefined;

        const clinics: Clinic[] = await clinicService.getByCriteria(
            phoneNumber,
            postcode,
            city,
            address,
        );

        return ApiResponse.success(res, clinics);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const createClinic = async (req: Request, res: Response) => {
    try {
        const clinic: Clinic = await clinicService.create(req.body);
        return ApiResponse.success(res, clinic, 201);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const registerClinic = async (req: Request, res: Response) => {
    try {
        const parsed = RegisterClinicPayloadSchema.safeParse(req.body);
        if (!parsed.success) {
            return ApiResponse.badRequest(res, parsed.error.issues[0]?.message ?? "Invalid payload");
        }

        const clinic: Clinic = await clinicService.register(parsed.data);
        return ApiResponse.success(res, clinic, 201);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const updateClinicStatus = async (req: Request, res: Response) => {
    try {
        const clinicId: string | undefined = req.params.clinicId;
        if (clinicId === undefined || clinicId === null) {
            return ApiResponse.badRequest(res, "Clinic ID is required");
        }

        const parsed = UpdateClinicStatusPayloadSchema.safeParse(req.body);
        if (!parsed.success) {
            return ApiResponse.badRequest(res, parsed.error.issues[0]?.message ?? "Invalid payload");
        }

        const clinic: Clinic = await clinicService.updateStatus(Number(clinicId), parsed.data.status);
        return ApiResponse.success(res, clinic);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const updateClinic = async (req: Request, res: Response) => {
    try {
        const clinicId: string | undefined = req.params.clinicId;
        if (clinicId === undefined || clinicId === null) {
            return ApiResponse.badRequest(res, "Clinic ID is required");
        }

        const { role, clinic_id } = (req as AuthenticatedRequest).user;
        const clinic: Clinic = await clinicService.update(Number(clinicId), req.body, role, clinic_id);
        return ApiResponse.success(res, clinic);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const deleteClinic = async (req: Request, res: Response) => {
    try {
        const clinicId: string | undefined = req.params.clinicId;
        if (clinicId === undefined || clinicId === null) {
            return ApiResponse.badRequest(res, "Clinic ID is required");
        }

        const clinic: Clinic = await clinicService.delete(Number(clinicId));
        return ApiResponse.success(res, clinic);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};
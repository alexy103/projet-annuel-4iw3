import { Request, Response } from "express";
import ApiResponse from "../utils/api-responses.utils";
import { Veterinarian } from "../schemas";
import { veterinarianService } from "../services";
import { AuthenticatedRequest } from "../types";

export const getVeterinarians = async (req: Request, res: Response) => {
    try {
        const { role, clinic_id } = (req as AuthenticatedRequest).user;
        const veterinarians: Veterinarian[] = await veterinarianService.getAll(role, clinic_id);

        return ApiResponse.success(res, veterinarians);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getVeterinarianById = async (req: Request, res: Response) => {
    try {
        const veterinarianId: string | undefined = req.params.veterinarianId;

        if (veterinarianId === undefined || veterinarianId === null) {
            return ApiResponse.badRequest(res, "Veterinarian ID is required");
        }

        const { role, clinic_id } = (req as AuthenticatedRequest).user;
        const veterinarian: Veterinarian = await veterinarianService.getById(Number(veterinarianId), role, clinic_id);

        return ApiResponse.success(res, veterinarian);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getVeterinariansByClinicId = async (
    req: Request,
    res: Response,
) => {
    try {
        const clinicId: string | undefined = req.params.clinicId;

        if (clinicId === undefined || clinicId === null) {
            return ApiResponse.badRequest(res, "Clinic ID is required");
        }

        const { role, clinic_id } = (req as AuthenticatedRequest).user;
        const veterinarians: Veterinarian[] = await veterinarianService.getByClinicId(Number(clinicId), role, clinic_id);

        return ApiResponse.success(res, veterinarians);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getVeterinariansByFullName = async (
    req: Request,
    res: Response,
) => {
    try {
        const firstName: string | undefined = req.query.firstName
            ? String(req.query.firstName)
            : undefined;

        const lastName: string | undefined = req.query.lastName
            ? String(req.query.lastName)
            : undefined;

        const { role, clinic_id } = (req as AuthenticatedRequest).user;
        const veterinarians: Veterinarian[] = await veterinarianService.getByFullName(firstName, lastName, role, clinic_id);

        return ApiResponse.success(res, veterinarians);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const createVeterinarian = async (req: Request, res: Response) => {
    try {
        const { role, clinic_id } = (req as AuthenticatedRequest).user;
        const veterinarian: Veterinarian = await veterinarianService.create(req.body, role, clinic_id);

        return ApiResponse.success(res, veterinarian, 201);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const updateVeterinarian = async (req: Request, res: Response) => {
    try {
        const veterinarianId: string | undefined = req.params.veterinarianId;

        if (veterinarianId === undefined || veterinarianId === null) {
            return ApiResponse.badRequest(res, "Veterinarian ID is required");
        }

        const { role, clinic_id } = (req as AuthenticatedRequest).user;
        const veterinarian: Veterinarian = await veterinarianService.update(Number(veterinarianId), req.body, role, clinic_id);

        return ApiResponse.success(res, veterinarian);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const setVeterinarianIsPresent = async (
    req: Request,
    res: Response,
) => {
    try {
        const veterinarianId: string | undefined = req.params.veterinarianId;

        if (veterinarianId === undefined || veterinarianId === null) {
            return ApiResponse.badRequest(res, "Veterinarian ID is required");
        }

        const isPresent: boolean = req.body.is_present;

        if (isPresent === undefined || isPresent === null) {
            return ApiResponse.badRequest(res, "is_present field is required");
        }

        const { role, clinic_id } = (req as AuthenticatedRequest).user;
        const veterinarian: Veterinarian = await veterinarianService.setIsPresent(Number(veterinarianId), isPresent, role, clinic_id);

        return ApiResponse.success(res, veterinarian);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const deleteVeterinarian = async (req: Request, res: Response) => {
    try {
        const veterinarianId: string | undefined = req.params.veterinarianId;

        if (veterinarianId === undefined || veterinarianId === null) {
            return ApiResponse.badRequest(res, "Veterinarian ID is required");
        }

        const { role, clinic_id } = (req as AuthenticatedRequest).user;
        const veterinarian: Veterinarian = await veterinarianService.delete(Number(veterinarianId), role, clinic_id);

        return ApiResponse.success(res, veterinarian);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

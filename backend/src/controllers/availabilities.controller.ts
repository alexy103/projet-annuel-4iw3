import { Request, Response } from "express";
import ApiResponse from "../utils/api-responses.utils";
import { Availability } from "../schemas";
import { availabilityService } from "../services";

export const getAvailabilities = async (req: Request, res: Response) => {
    try {
        const availabilities: Availability[] = await availabilityService.getAll();
        return ApiResponse.success(res, availabilities);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getAvailabilityById = async (req: Request, res: Response) => {
    try {
        const availabilityId: string | undefined = req.params.availabilityId;
        if (availabilityId === undefined || availabilityId === null) {
            return ApiResponse.badRequest(res, "Availability ID is required");
        }

        const availability: Availability = await availabilityService.getById(Number(availabilityId));
        return ApiResponse.success(res, availability);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getAvailabilityByClinicId = async (req: Request, res: Response) => {
    try {
        const clinicId: string | undefined = req.params.clinicId;
        if (clinicId === undefined || clinicId === null) {
            return ApiResponse.badRequest(res, "Clinic ID is required");
        }

        const availabilities: Availability[] = await availabilityService.getByClinicId(Number(clinicId));
        return ApiResponse.success(res, availabilities);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const createAvailability = async (req: Request, res: Response) => {
    try {
        const availability: Availability = await availabilityService.create(req.body);
        return ApiResponse.success(res, availability, 201);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const updateAvailability = async (req: Request, res: Response) => {
    try {
        const availabilityId: string | undefined = req.params.availabilityId;
        if (availabilityId === undefined || availabilityId === null) {
            return ApiResponse.badRequest(res, "Availability ID is required");
        }

        const availability: Availability = await availabilityService.update(
            Number(availabilityId),
            req.body,
        );
        return ApiResponse.success(res, availability);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const updateAvailabilitySlotRules = async (req: Request, res: Response) => {
    try {
        const availabilityId: string | undefined = req.params.availabilityId;
        if (availabilityId === undefined || availabilityId === null) {
            return ApiResponse.badRequest(res, "Availability ID is required");
        }

        const availability: Availability = await availabilityService.updateSlotRules(
            Number(availabilityId),
            req.body,
        );
        return ApiResponse.success(res, availability);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const deleteAvailability = async (req: Request, res: Response) => {
    try {
        const availabilityId: string | undefined = req.params.availabilityId;
        if (availabilityId === undefined || availabilityId === null) {
            return ApiResponse.badRequest(res, "Availability ID is required");
        }

        const availability: Availability = await availabilityService.delete(Number(availabilityId));
        return ApiResponse.success(res, availability);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

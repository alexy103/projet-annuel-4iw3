import { Request, Response } from "express";
import ApiResponse from "../utils/api-responses.utils";
import { Treatment } from "../schemas";
import { treatmentService } from "../services";
import { AuthenticatedRequest } from "../types";

export const getTreatments = async (req: Request, res: Response) => {
    try {
        const { userId, role } = (req as AuthenticatedRequest).user;
        const treatments: Treatment[] = await treatmentService.getAll(userId, role);
        return ApiResponse.success(res, treatments);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getTreatmentById = async (req: Request, res: Response) => {
    try {
        const treatmentId: string | undefined = req.params.treatmentId;
        if (treatmentId === undefined || treatmentId === null) {
            return ApiResponse.badRequest(res, "Treatment ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const treatment: Treatment = await treatmentService.getById(Number(treatmentId), userId, role);
        return ApiResponse.success(res, treatment);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getTreatmentsByMedicineId = async (req: Request, res: Response) => {
    try {
        const medicineId: string | undefined = req.params.medicineId;
        if (medicineId === undefined || medicineId === null) {
            return ApiResponse.badRequest(res, "Medicine ID is required");
        }

        const treatments: Treatment[] = await treatmentService.getByMedicineId(Number(medicineId));
        return ApiResponse.success(res, treatments);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getTreatmentsByAnimalId = async (req: Request, res: Response) => {
    try {
        const animalId: string | undefined = req.params.animalId;
        if (animalId === undefined || animalId === null) {
            return ApiResponse.badRequest(res, "Animal ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const treatments: Treatment[] = await treatmentService.getByAnimalId(Number(animalId), userId, role);
        return ApiResponse.success(res, treatments);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getTreatmentsByTreatmentTypeId = async (req: Request, res: Response) => {
    try {
        const typeId: string | undefined = req.params.typeId;
        if (typeId === undefined || typeId === null) {
            return ApiResponse.badRequest(res, "Treatment type ID is required");
        }

        const treatments: Treatment[] = await treatmentService.getByTreatmentTypeId(Number(typeId));
        return ApiResponse.success(res, treatments);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const createTreatment = async (req: Request, res: Response) => {
    try {
        const treatment: Treatment = await treatmentService.create(req.body);
        return ApiResponse.success(res, treatment, 201);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const updateTreatment = async (req: Request, res: Response) => {
    try {
        const treatmentId: string | undefined = req.params.treatmentId;
        if (treatmentId === undefined || treatmentId === null) {
            return ApiResponse.badRequest(res, "Treatment ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const treatment: Treatment = await treatmentService.update(Number(treatmentId), req.body, userId, role);
        return ApiResponse.success(res, treatment);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const deleteTreatment = async (req: Request, res: Response) => {
    try {
        const treatmentId: string | undefined = req.params.treatmentId;
        if (treatmentId === undefined || treatmentId === null) {
            return ApiResponse.badRequest(res, "Treatment ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const treatment: Treatment = await treatmentService.delete(Number(treatmentId), userId, role);
        return ApiResponse.success(res, treatment);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

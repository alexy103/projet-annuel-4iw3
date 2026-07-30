import { Request, Response } from "express";
import ApiResponse from "../utils/api-responses.utils";
import { Medicine } from "../schemas";
import { medicineService } from "../services";
import { AuthenticatedRequest } from "../types";

export const getMedicines = async (req: Request, res: Response) => {
    try {
        const { userId, role } = (req as AuthenticatedRequest).user;
        const medicines: Medicine[] = await medicineService.getAll(userId, role);
        return ApiResponse.success(res, medicines);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getMedicineById = async (req: Request, res: Response) => {
    try {
        const medicineId: string | undefined = req.params.medicineId;
        if (medicineId === undefined || medicineId === null) {
            return ApiResponse.badRequest(res, "Medicine ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const medicine: Medicine = await medicineService.getById(Number(medicineId), userId, role);
        return ApiResponse.success(res, medicine);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getMedicinesByUserId = async (req: Request, res: Response) => {
    try {
        const userId: string | undefined = req.params.userId;
        if (userId === undefined || userId === null) {
            return ApiResponse.badRequest(res, "User ID is required");
        }

        const medicines: Medicine[] = await medicineService.getByUserId(Number(userId));
        return ApiResponse.success(res, medicines);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getMedicinesByBrand = async (req: Request, res: Response) => {
    try {
        const brand: string | undefined = req.query.brand ? String(req.query.brand) : undefined;
        if (!brand) {
            return ApiResponse.badRequest(res, "Brand is required");
        }

        const medicines: Medicine[] = await medicineService.getByBrand(brand);
        return ApiResponse.success(res, medicines);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const createMedicine = async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthenticatedRequest).user.userId;
        const medicine: Medicine = await medicineService.create({ ...req.body, user_id: userId });
        return ApiResponse.success(res, medicine, 201);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const updateMedicine = async (req: Request, res: Response) => {
    try {
        const medicineId: string | undefined = req.params.medicineId;
        if (medicineId === undefined || medicineId === null) {
            return ApiResponse.badRequest(res, "Medicine ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const medicine: Medicine = await medicineService.update(Number(medicineId), req.body, userId, role);
        return ApiResponse.success(res, medicine);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const deleteMedicine = async (req: Request, res: Response) => {
    try {
        const medicineId: string | undefined = req.params.medicineId;
        if (medicineId === undefined || medicineId === null) {
            return ApiResponse.badRequest(res, "Medicine ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const medicine: Medicine = await medicineService.delete(Number(medicineId), userId, role);
        return ApiResponse.success(res, medicine);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

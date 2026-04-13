import { Request, Response } from "express";
import ApiResponse from "../utils/api-responses.utils";
import { Animal } from "../schemas";
import { animalService } from "../services";
import { AuthenticatedRequest } from "../types";

export const getAnimals = async (req: Request, res: Response) => {
    try {
        const { userId, role } = (req as AuthenticatedRequest).user;
        const animals: Animal[] = await animalService.getAll(userId, role);
        return ApiResponse.success(res, animals);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getAnimalById = async (req: Request, res: Response) => {
    try {
        const animalId: string | undefined = req.params.animalId;
        if (animalId === undefined || animalId === null) {
            return ApiResponse.badRequest(res, "Animal ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const animal: Animal = await animalService.getById(Number(animalId), role, userId);
        return ApiResponse.success(res, animal);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getAnimalsByUserId = async (req: Request, res: Response) => {
    try {
        const userId: string | undefined = req.params.userId;
        if (userId === undefined || userId === null) {
            return ApiResponse.badRequest(res, "User ID is required");
        }

        const animals: Animal[] = await animalService.getByUserId(Number(userId));
        return ApiResponse.success(res, animals);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getAnimalsByName = async (req: Request, res: Response) => {
    try {
        const name: string | undefined = String(req.query.name);
        if (name === undefined || name === null || name === "") {
            return ApiResponse.badRequest(res, "Name is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const animals: Animal[] = await animalService.getByName(name, userId, role);
        return ApiResponse.success(res, animals);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getSharedAnimals = async (req: Request, res: Response) => {
    try {
        const animals: Animal[] = await animalService.getSharedAnimals();
        return ApiResponse.success(res, animals);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const createAnimal = async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthenticatedRequest).user.userId;
        const animal: Animal = await animalService.create({ ...req.body, user_id: userId });
        return ApiResponse.success(res, animal, 201);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const updateAnimal = async (req: Request, res: Response) => {
    try {
        const animalId: string | undefined = req.params.animalId;
        if (animalId === undefined || animalId === null) {
            return ApiResponse.badRequest(res, "Animal ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const animal: Animal = await animalService.update(Number(animalId), req.body, userId, role);
        return ApiResponse.success(res, animal);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const assignMicroshipToAnimal = async (req: Request, res: Response) => {
    try {
        const animalId: string | undefined = req.params.animalId;
        if (animalId === undefined || animalId === null) {
            return ApiResponse.badRequest(res, "Animal ID is required");
        }

        const microshipId: number | null = req.body.microship_id ?? null;
        const { userId, role } = (req as AuthenticatedRequest).user;
        const animal: Animal = await animalService.assignMicroship(Number(animalId), microshipId, userId, role);
        return ApiResponse.success(res, animal);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const toggleAnimalIsShared = async (req: Request, res: Response) => {
    try {
        const animalId: string | undefined = req.params.animalId;
        const isShared: boolean = req.body.isShared;
        if (animalId === undefined || animalId === null || isShared === undefined || isShared == null) {
            return ApiResponse.badRequest(res, "Animal ID and isShared are required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const animal: Animal = await animalService.setIsShared(Number(animalId), isShared, userId, role);
        return ApiResponse.success(res, animal);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const toggleAnimalIsDeceased = async (req: Request, res: Response) => {
    try {
        const animalId: string | undefined = req.params.animalId;
        const isDeceased: boolean = req.body.isDeceased;
        if (animalId === undefined || animalId === null || isDeceased === undefined || isDeceased == null) {
            return ApiResponse.badRequest(res, "Animal ID and isDeceased are required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const animal: Animal = await animalService.setIsDeceased(Number(animalId), isDeceased, userId, role);
        return ApiResponse.success(res, animal);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const deleteAnimal = async (req: Request, res: Response) => {
    try {
        const animalId: string | undefined = req.params.animalId;
        if (animalId === undefined || animalId === null) {
            return ApiResponse.badRequest(res, "Animal ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const animal: Animal = await animalService.delete(Number(animalId), userId, role);
        return ApiResponse.success(res, animal);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

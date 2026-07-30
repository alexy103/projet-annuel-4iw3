import { Request, Response } from "express";
import ApiResponse from "../utils/api-responses.utils";
import { Specie } from "../schemas";
import { speciesService } from "../services";

export const getSpecies = async (req: Request, res: Response) => {
    try {
        const species: Specie[] =
            await speciesService.getAll();

        return ApiResponse.success(res, species);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getSpeciesById = async (
    req: Request,
    res: Response,
) => {
    try {
        const speciesId: string | undefined =
            req.params.speciesId;

        if (speciesId === undefined || speciesId === null) {
            return ApiResponse.badRequest(
                res,
                "Species ID is required",
            );
        }

        const specie: Specie =
            await speciesService.getById(Number(speciesId));

        return ApiResponse.success(res, specie);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getSpeciesByName = async (
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

        const species: Specie[] =
            await speciesService.getByName(name);

        return ApiResponse.success(res, species);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const createSpecies = async (
    req: Request,
    res: Response,
) => {
    try {
        const specie: Specie =
            await speciesService.create(req.body);

        return ApiResponse.success(res, specie, 201);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const updateSpecies = async (
    req: Request,
    res: Response,
) => {
    try {
        const speciesId: string | undefined =
            req.params.speciesId;

        if (speciesId === undefined || speciesId === null) {
            return ApiResponse.badRequest(
                res,
                "Species ID is required",
            );
        }

        const specie: Specie =
            await speciesService.update(
                Number(speciesId),
                req.body,
            );

        return ApiResponse.success(res, specie);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const deleteSpecies = async (
    req: Request,
    res: Response,
) => {
    try {
        const speciesId: string | undefined =
            req.params.speciesId;

        if (speciesId === undefined || speciesId === null) {
            return ApiResponse.badRequest(
                res,
                "Species ID is required",
            );
        }

        const specie: Specie =
            await speciesService.delete(
                Number(speciesId),
            );

        return ApiResponse.success(res, specie);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};
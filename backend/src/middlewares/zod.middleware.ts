import { Request, Response, NextFunction } from "express";
import { ZodError, ZodTypeAny } from "zod";
import ApiResponse from "../utils/api-responses.utils";

export const validateSchema = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return ApiResponse.badRequest(res, "Invalid Input");
      }
      next(error);
    }
  };
};

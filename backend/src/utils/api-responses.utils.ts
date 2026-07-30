import { Response } from "express";
import { AppError } from "../types";

export default class ApiResponse {
  static getError(res: Response, err: Error | any) {
    const message = err.message || "Unknown error";

    if (err instanceof AppError) {
      return ApiResponse.error(res, message, err.statusCode);
    }

    if (typeof err.code === "number") {
      switch (err.code) {
        case 400:
          return ApiResponse.badRequest(res, message);
        case 401:
          return ApiResponse.unauthorized(res, message);
        case 403:
          return ApiResponse.forbidden(res, message);
        case 404:
          return ApiResponse.notFound(res, message);
        case 409:
          return ApiResponse.conflict(res, message);
        case 500:
          return ApiResponse.serverError(res, message);
        default:
          return ApiResponse.error(res, message, err.code);
      }
    }
    return ApiResponse.serverError(res, message);
  }

  static success(res: Response, data: any, status: number = 200) {
    return res.status(status).json({
      success: true,
      data: data,
    });
  }

  static error(res: Response, message: string, status: number) {
    return res.status(status).json({
      success: false,
      error: message,
    });
  }

  static serverError(res: Response, message: string = "Server Error") {
    return this.error(res, message, 500);
  }

  static notFound(res: Response, message: string = "Resource not found") {
    return this.error(res, message, 404);
  }

  static badRequest(res: Response, message: string = "Bad request") {
    return this.error(res, message, 400);
  }

  static invalidId(res: Response) {
    return this.error(res, "Invalid ID format", 400);
  }

  static conflict(res: Response, message: string = "Conflict") {
    return this.error(res, message, 409);
  }

  static unauthorized(res: Response, message: string = "Unauthorized") {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = "Forbidden") {
    return this.error(res, message, 403);
  }
}

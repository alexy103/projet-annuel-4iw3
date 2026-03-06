import { NextFunction, Request, Response } from "express";
import ApiResponse from "../utils/api-responses.utils";

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey: string | undefined = req.header("x-api-key");
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return ApiResponse.unauthorized(res, "Invalid API Key");
  }
  next();
}

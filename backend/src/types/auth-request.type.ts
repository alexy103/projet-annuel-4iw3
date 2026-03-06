import { JwtPayload as BaseJwtPayload } from "jsonwebtoken";
import {Request} from "express";

export interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    role: string;
  };
}

export interface JwtPayload extends BaseJwtPayload {
  userId: number;
}
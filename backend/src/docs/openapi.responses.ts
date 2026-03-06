import { ZodSchema } from "zod";

/**
 * 400 - BadRequest
 */
export const BadRequest = {
  description: "Bad request",
};

/**
 * 404 – Not Found
 */
export const NotFoundResponse = {
  description: "Not Found",
};

/**
 * 500 – Internal Server Error
 */
export const ServerErrorResponse = {
  description: "Internal Server Error",
};

/**
 * 401 – Unauthorized
 */
export const UnauthorizedResponse = {
  description: "Unauthorized",
};

/**
 * 403 – Forbidden
 */
export const ForbiddenResponse = {
  description: "Forbidden",
};

/**
 * 409 - Conflict
 */
export const ConflictResponse = {
  description: "Conflict",
};

/**
 * 200 / 201 Success response helper
 */
export const JsonResponse = (schema: ZodSchema, description = "Success") => ({
  description,
  content: {
    "application/json": {
      schema,
    },
  },
});

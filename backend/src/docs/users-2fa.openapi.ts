import { registry } from "./openapi.registry";
import zod from "zod";
import {
  BadRequest,
  ConflictResponse,
  ForbiddenResponse,
  JsonResponse,
  NotFoundResponse,
  ServerErrorResponse,
  UnauthorizedResponse,
} from "./openapi.responses";
import {
  Users2FASchema,
  CreateUsers2FAPayloadSchema,
  UpdateUsers2FAPayloadSchema,
} from "../schemas";

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/users-2fa",
  tags: ["Users 2FA"],
  summary: "Get all users 2FA records",
  responses: {
    200: JsonResponse(zod.array(Users2FASchema), "List of users 2FA records"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/users-2fa/{id}",
  tags: ["Users 2FA"],
  summary: "Get users 2FA record by id",
  request: {
    params: zod.object({ id: zod.string() }),
  },
  responses: {
    200: JsonResponse(Users2FASchema, "Users 2FA record found"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/users-2fa",
  tags: ["Users 2FA"],
  summary: "Create users 2FA record",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateUsers2FAPayloadSchema,
        },
      },
    },
  },
  responses: {
    201: JsonResponse(Users2FASchema, "Users 2FA record created"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    409: ConflictResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "put",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/users-2fa/{id}",
  tags: ["Users 2FA"],
  summary: "Update users 2FA record",
  request: {
    params: zod.object({ id: zod.string() }),
    body: {
      content: {
        "application/json": { schema: UpdateUsers2FAPayloadSchema },
      },
    },
  },
  responses: {
    200: JsonResponse(Users2FASchema, "Users 2FA record updated"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    409: ConflictResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "delete",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/users-2fa/{id}",
  tags: ["Users 2FA"],
  summary: "Delete users 2FA record",
  request: {
    params: zod.object({ id: zod.string() }),
  },
  responses: {
    200: JsonResponse(Users2FASchema, "Users 2FA record deleted"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

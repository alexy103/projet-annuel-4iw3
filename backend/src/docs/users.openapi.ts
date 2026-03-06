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
  CreateUserPayloadSchema,
  UpdateUserPayloadSchema,

  UserPermissionPayloadSchema, UserPermissionSchema,
  UserSchema
} from "../schemas";
import { MessageResponseSchema } from "./openapi.schemas";

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/users",
  tags: ["Users"],
  summary: "Get all users with optionnal filter",
  request: {
    query: zod.object({
      active: zod.boolean().optional(),
    }),
  },
  responses: {
    200: JsonResponse(zod.array(UserSchema), "List of users"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/users/{userId}",
  tags: ["Users"],
  summary: "Get user by id",
  request: {
    params: zod.object({
      userId: zod.string(),
    }),
  },
  responses: {
    200: JsonResponse(UserSchema, "User found"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/users",
  tags: ["Users"],
  summary: "Create user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateUserPayloadSchema,
        },
      },
    },
  },
  responses: {
    201: JsonResponse(UserSchema, "User created"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    409: ConflictResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "put",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/users/{userId}",
  tags: ["Users"],
  summary: "Update user",
  request: {
    params: zod.object({
      userId: zod.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateUserPayloadSchema,
        },
      },
    },
  },
  responses: {
    200: JsonResponse(UserSchema, "User updated"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    409: ConflictResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "patch",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/users/{userId}/active",
  tags: ["Users"],
  summary: "Activate or disable user",
  request: {
    params: zod.object({
      userId: zod.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: zod.object({
            isActivated: zod.boolean().openapi({
              example: true,
            }),
          }),
        },
      },
    },
  },
  responses: {
    200: JsonResponse(UserSchema, "User activation updated"),
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
  path: "/users/{userId}",
  tags: ["Users"],
  summary: "Delete user",
  request: {
    params: zod.object({
      userId: zod.string(),
    }),
  },
  responses: {
    200: JsonResponse(UserSchema, "User deleted"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/users/{userId}/permissions",
  tags: ["Users"],
  summary: "Get all user permissions",
  request: {
    params: zod.object({
      userId: zod.string(),
    }),
  },
  responses: {
    200: JsonResponse(
      zod.array(UserPermissionSchema),
      "List of user permissions",
    ),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    409: ConflictResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/users/permissions",
  tags: ["Users"],
  summary: "Create permission to user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: UserPermissionPayloadSchema,
        },
      },
    },
  },
  responses: {
    200: JsonResponse(MessageResponseSchema, "User permission created"),
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
  path: "/users/{userId}/permissions/{permissionId}",
  tags: ["Users"],
  summary: "Delete permission from user",
  request: {
    params: zod.object({
      userId: zod.string(),
      permissionId: zod.string(),
    }),
  },
  responses: {
    200: JsonResponse(MessageResponseSchema, "User permission deleted"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    409: ConflictResponse,
    500: ServerErrorResponse,
  },
});
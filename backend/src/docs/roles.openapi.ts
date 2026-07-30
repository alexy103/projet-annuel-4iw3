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
import { RolePayloadSchema, RoleSchema } from "../schemas";

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/roles",
  tags: ["Roles"],
  summary: "Get all roles",
  responses: {
    200: JsonResponse(zod.array(RoleSchema), "List of roles"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/roles/{roleId}",
  tags: ["Roles"],
  summary: "Get role by id",
  request: {
    params: zod.object({
      roleId: zod.string(),
    }),
  },
  responses: {
    200: JsonResponse(zod.array(RoleSchema), "Role found"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/roles",
  tags: ["Roles"],
  summary: "Create role",
  request: {
    body: {
      content: {
        "application/json": {
          schema: RolePayloadSchema,
        },
      },
    },
  },
  responses: {
    201: JsonResponse(zod.array(RoleSchema), "Role created"),
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
  path: "/roles/{roleId}",
  tags: ["Roles"],
  summary: "Update role",
  request: {
    params: zod.object({
      roleId: zod.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: RolePayloadSchema,
        },
      },
    },
  },
  responses: {
    200: JsonResponse(zod.array(RoleSchema), "Role updated"),
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
  path: "/roles/{roleId}",
  tags: ["Roles"],
  summary: "Delete role",
  request: {
    params: zod.object({
      roleId: zod.string(),
    }),
  },
  responses: {
    200: JsonResponse(zod.array(RoleSchema), "Role deleted"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

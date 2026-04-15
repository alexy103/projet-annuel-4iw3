import { registry } from "./openapi.registry";
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
  PermissionPayloadSchema,
  PermissionSchema
} from "../schemas";
import zod from "zod";

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/permissions",
  tags: ["Permissions"],
  summary: "Get all permissions",
  responses: {
    200: JsonResponse(zod.array(PermissionSchema), "List of permissions"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/permissions/{permissionId}",
  tags: ["Permissions"],
  summary: "Get permission by id",
  request: {
    params: zod.object({
      permissionId: zod.string(),
    }),
  },
  responses: {
    200: JsonResponse(zod.array(PermissionSchema), "Permission found"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/permissions/{label}/label",
  tags: ["Permissions"],
  summary: "Get permission by label",
  request: {
    params: zod.object({
      label: zod.string(),
    }),
  },
  responses: {
    200: JsonResponse(zod.array(PermissionSchema), "Permission found"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/permissions",
  tags: ["Permissions"],
  summary: "Create permission",
  request: {
    body: {
      content: {
        "application/json": {
          schema: PermissionPayloadSchema,
        },
      },
    },
  },
  responses: {
    201: JsonResponse(zod.array(PermissionSchema), "Permission created"),
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
  path: "/permissions/{permissionId}",
  tags: ["Permissions"],
  summary: "Update permission",
  request: {
    params: zod.object({
      permissionId: zod.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: PermissionPayloadSchema,
        },
      },
    },
  },
  responses: {
    200: JsonResponse(zod.array(PermissionSchema), "Permission updated"),
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
  path: "/permissions/{permissionId}",
  tags: ["Permissions"],
  summary: "Delete permission",
  request: {
    params: zod.object({
      permissionId: zod.string(),
    }),
  },
  responses: {
    200: JsonResponse(zod.array(PermissionSchema), "Permission deleted"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    409: ConflictResponse,
    500: ServerErrorResponse,
  },
});

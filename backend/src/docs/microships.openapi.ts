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
  MicroshipSchema,
  CreateMicroshipPayloadSchema,
  UpdateMicroshipPayloadSchema,
} from "../schemas";

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/microships",
  tags: ["Microships"],
  summary: "Get all microships",
  responses: {
    200: JsonResponse(zod.array(MicroshipSchema), "List of microships"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/microships/user/{userId}",
  tags: ["Microships"],
  summary: "Get microships by user id",
  request: {
    params: zod.object({ userId: zod.string() }),
  },
  responses: {
    200: JsonResponse(zod.array(MicroshipSchema), "List of microships for user"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/microships/{microshipId}",
  tags: ["Microships"],
  summary: "Get microship by id",
  request: {
    params: zod.object({ microshipId: zod.string() }),
  },
  responses: {
    200: JsonResponse(MicroshipSchema, "Microship found"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/microships",
  tags: ["Microships"],
  summary: "Create microship",
  request: {
    body: {
      content: {
        "application/json": { schema: CreateMicroshipPayloadSchema },
      },
    },
  },
  responses: {
    201: JsonResponse(MicroshipSchema, "Microship created"),
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
  path: "/microships/{microshipId}",
  tags: ["Microships"],
  summary: "Update microship",
  request: {
    params: zod.object({ microshipId: zod.string() }),
    body: {
      content: {
        "application/json": { schema: UpdateMicroshipPayloadSchema },
      },
    },
  },
  responses: {
    200: JsonResponse(MicroshipSchema, "Microship updated"),
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
  path: "/microships/{microshipId}",
  tags: ["Microships"],
  summary: "Delete microship",
  request: {
    params: zod.object({ microshipId: zod.string() }),
  },
  responses: {
    200: JsonResponse(MicroshipSchema, "Microship deleted"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    409: ConflictResponse,
    500: ServerErrorResponse,
  },
});

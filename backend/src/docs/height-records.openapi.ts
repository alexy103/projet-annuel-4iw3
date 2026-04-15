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
  HeightRecordSchema,
  CreateHeightRecordPayloadSchema,
  UpdateHeightRecordPayloadSchema,
} from "../schemas";

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/height-records",
  tags: ["Height Records"],
  summary: "Get all height records",
  responses: {
    200: JsonResponse(zod.array(HeightRecordSchema), "List of height records"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/height-records/{heightRecordId}",
  tags: ["Height Records"],
  summary: "Get height record by id",
  request: {
    params: zod.object({ heightRecordId: zod.string() }),
  },
  responses: {
    200: JsonResponse(HeightRecordSchema, "Height record found"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/height-records/animal/{animalId}",
  tags: ["Height Records"],
  summary: "Get height records by animal id",
  request: {
    params: zod.object({ animalId: zod.string() }),
  },
  responses: {
    200: JsonResponse(zod.array(HeightRecordSchema), "List of height records for animal"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/height-records",
  tags: ["Height Records"],
  summary: "Create height record",
  request: {
    body: {
      content: {
        "application/json": { schema: CreateHeightRecordPayloadSchema },
      },
    },
  },
  responses: {
    201: JsonResponse(HeightRecordSchema, "Height record created"),
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
  path: "/height-records/{heightRecordId}",
  tags: ["Height Records"],
  summary: "Update height record",
  request: {
    params: zod.object({ heightRecordId: zod.string() }),
    body: {
      content: {
        "application/json": { schema: UpdateHeightRecordPayloadSchema },
      },
    },
  },
  responses: {
    200: JsonResponse(HeightRecordSchema, "Height record updated"),
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
  path: "/height-records/{heightRecordId}",
  tags: ["Height Records"],
  summary: "Delete height record",
  request: {
    params: zod.object({ heightRecordId: zod.string() }),
  },
  responses: {
    200: JsonResponse(HeightRecordSchema, "Height record deleted"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

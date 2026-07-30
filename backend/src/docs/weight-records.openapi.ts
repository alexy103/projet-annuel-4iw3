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
  WeightRecordSchema,
  CreateWeightRecordPayloadSchema,
  UpdateWeightRecordPayloadSchema,
} from "../schemas";

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/weight-records",
  tags: ["Weight Records"],
  summary: "Get all weight records",
  responses: {
    200: JsonResponse(zod.array(WeightRecordSchema), "List of weight records"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/weight-records/{weightRecordId}",
  tags: ["Weight Records"],
  summary: "Get weight record by id",
  request: {
    params: zod.object({ weightRecordId: zod.string() }),
  },
  responses: {
    200: JsonResponse(WeightRecordSchema, "Weight record found"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/weight-records/animal/{animalId}",
  tags: ["Weight Records"],
  summary: "Get weight records by animal id",
  request: {
    params: zod.object({ animalId: zod.string() }),
  },
  responses: {
    200: JsonResponse(zod.array(WeightRecordSchema), "List of weight records for animal"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/weight-records",
  tags: ["Weight Records"],
  summary: "Create weight record",
  request: {
    body: {
      content: {
        "application/json": { schema: CreateWeightRecordPayloadSchema },
      },
    },
  },
  responses: {
    201: JsonResponse(WeightRecordSchema, "Weight record created"),
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
  path: "/weight-records/{weightRecordId}",
  tags: ["Weight Records"],
  summary: "Update weight record",
  request: {
    params: zod.object({ weightRecordId: zod.string() }),
    body: {
      content: {
        "application/json": { schema: UpdateWeightRecordPayloadSchema },
      },
    },
  },
  responses: {
    200: JsonResponse(WeightRecordSchema, "Weight record updated"),
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
  path: "/weight-records/{weightRecordId}",
  tags: ["Weight Records"],
  summary: "Delete weight record",
  request: {
    params: zod.object({ weightRecordId: zod.string() }),
  },
  responses: {
    200: JsonResponse(WeightRecordSchema, "Weight record deleted"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

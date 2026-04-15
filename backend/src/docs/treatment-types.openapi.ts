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
  TreatmentTypeSchema,
  CreateTreatmentTypePayloadSchema,
  UpdateTreatmentTypePayloadSchema,
} from "../schemas";

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/treatment-types",
  tags: ["Treatment Types"],
  summary: "Get all treatment types",
  responses: {
    200: JsonResponse(zod.array(TreatmentTypeSchema), "List of treatment types"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/treatment-types/search",
  tags: ["Treatment Types"],
  summary: "Search treatment types by name",
  request: {
    query: zod.object({
      name: zod.string().openapi({ example: "Vaccination" }),
    }),
  },
  responses: {
    200: JsonResponse(zod.array(TreatmentTypeSchema), "List of treatment types matching name"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/treatment-types/{typeId}",
  tags: ["Treatment Types"],
  summary: "Get treatment type by id",
  request: {
    params: zod.object({ typeId: zod.string() }),
  },
  responses: {
    200: JsonResponse(TreatmentTypeSchema, "Treatment type found"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/treatment-types",
  tags: ["Treatment Types"],
  summary: "Create treatment type",
  request: {
    body: {
      content: {
        "application/json": { schema: CreateTreatmentTypePayloadSchema },
      },
    },
  },
  responses: {
    201: JsonResponse(TreatmentTypeSchema, "Treatment type created"),
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
  path: "/treatment-types/{typeId}",
  tags: ["Treatment Types"],
  summary: "Update treatment type",
  request: {
    params: zod.object({ typeId: zod.string() }),
    body: {
      content: {
        "application/json": { schema: UpdateTreatmentTypePayloadSchema },
      },
    },
  },
  responses: {
    200: JsonResponse(TreatmentTypeSchema, "Treatment type updated"),
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
  path: "/treatment-types/{typeId}",
  tags: ["Treatment Types"],
  summary: "Delete treatment type",
  request: {
    params: zod.object({ typeId: zod.string() }),
  },
  responses: {
    200: JsonResponse(TreatmentTypeSchema, "Treatment type deleted"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

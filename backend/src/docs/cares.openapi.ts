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
  CareSchema,
  CreateCarePayloadSchema,
  UpdateCarePayloadSchema,
} from "../schemas";

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/cares",
  tags: ["Cares"],
  summary: "Get all cares",
  responses: {
    200: JsonResponse(zod.array(CareSchema), "List of cares"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/cares/{careId}",
  tags: ["Cares"],
  summary: "Get care by id",
  request: {
    params: zod.object({ careId: zod.string() }),
  },
  responses: {
    200: JsonResponse(CareSchema, "Care found"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/cares/animal/{animalId}",
  tags: ["Cares"],
  summary: "Get cares by animal id",
  request: {
    params: zod.object({ animalId: zod.string() }),
  },
  responses: {
    200: JsonResponse(zod.array(CareSchema), "List of cares for animal"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/cares/treatment-type/{treatmentTypeId}",
  tags: ["Cares"],
  summary: "Get cares by treatment type id",
  request: {
    params: zod.object({ treatmentTypeId: zod.string() }),
  },
  responses: {
    200: JsonResponse(zod.array(CareSchema), "List of cares for treatment type"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/cares",
  tags: ["Cares"],
  summary: "Create care",
  request: {
    body: {
      content: {
        "application/json": { schema: CreateCarePayloadSchema },
      },
    },
  },
  responses: {
    201: JsonResponse(CareSchema, "Care created"),
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
  path: "/cares/{careId}",
  tags: ["Cares"],
  summary: "Update care",
  request: {
    params: zod.object({ careId: zod.string() }),
    body: {
      content: {
        "application/json": { schema: UpdateCarePayloadSchema },
      },
    },
  },
  responses: {
    200: JsonResponse(CareSchema, "Care updated"),
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
  path: "/cares/{careId}",
  tags: ["Cares"],
  summary: "Delete care",
  request: {
    params: zod.object({ careId: zod.string() }),
  },
  responses: {
    200: JsonResponse(CareSchema, "Care deleted"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

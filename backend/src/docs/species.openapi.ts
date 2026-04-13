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
  SpecieSchema,
  CreateSpeciePayloadSchema,
  UpdateSpeciePayloadSchema,
} from "../schemas";

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/species",
  tags: ["Species"],
  summary: "Get all species",
  responses: {
    200: JsonResponse(zod.array(SpecieSchema), "List of species"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/species/search",
  tags: ["Species"],
  summary: "Search species by name",
  request: {
    query: zod.object({
      name: zod.string().openapi({ example: "Labrador" }),
    }),
  },
  responses: {
    200: JsonResponse(zod.array(SpecieSchema), "List of species matching name"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/species/{speciesId}",
  tags: ["Species"],
  summary: "Get species by id",
  request: {
    params: zod.object({ speciesId: zod.string() }),
  },
  responses: {
    200: JsonResponse(SpecieSchema, "Species found"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/species",
  tags: ["Species"],
  summary: "Create species",
  request: {
    body: {
      content: {
        "application/json": { schema: CreateSpeciePayloadSchema },
      },
    },
  },
  responses: {
    201: JsonResponse(SpecieSchema, "Species created"),
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
  path: "/species/{speciesId}",
  tags: ["Species"],
  summary: "Update species",
  request: {
    params: zod.object({ speciesId: zod.string() }),
    body: {
      content: {
        "application/json": { schema: UpdateSpeciePayloadSchema },
      },
    },
  },
  responses: {
    200: JsonResponse(SpecieSchema, "Species updated"),
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
  path: "/species/{speciesId}",
  tags: ["Species"],
  summary: "Delete species",
  request: {
    params: zod.object({ speciesId: zod.string() }),
  },
  responses: {
    200: JsonResponse(SpecieSchema, "Species deleted"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

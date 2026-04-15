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
  AnimalSchema,
  CreateAnimalPayloadSchema,
  UpdateAnimalPayloadSchema,
} from "../schemas";

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/animals",
  tags: ["Animals"],
  summary: "Get all animals",
  responses: {
    200: JsonResponse(zod.array(AnimalSchema), "List of animals"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/animals/search",
  tags: ["Animals"],
  summary: "Search animals by name",
  request: {
    query: zod.object({
      name: zod.string().openapi({ example: "Max" }),
    }),
  },
  responses: {
    200: JsonResponse(zod.array(AnimalSchema), "List of animals matching name"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/animals/{animalId}",
  tags: ["Animals"],
  summary: "Get animal by id",
  request: {
    params: zod.object({ animalId: zod.string() }),
  },
  responses: {
    200: JsonResponse(AnimalSchema, "Animal found"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/animals/user/{userId}",
  tags: ["Animals"],
  summary: "Get animals by user id",
  request: {
    params: zod.object({ userId: zod.string() }),
  },
  responses: {
    200: JsonResponse(zod.array(AnimalSchema), "List of animals for user"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/animals",
  tags: ["Animals"],
  summary: "Create animal",
  request: {
    body: {
      content: {
        "application/json": { schema: CreateAnimalPayloadSchema },
      },
    },
  },
  responses: {
    201: JsonResponse(AnimalSchema, "Animal created"),
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
  path: "/animals/{animalId}",
  tags: ["Animals"],
  summary: "Update animal",
  request: {
    params: zod.object({ animalId: zod.string() }),
    body: {
      content: {
        "application/json": { schema: UpdateAnimalPayloadSchema },
      },
    },
  },
  responses: {
    200: JsonResponse(AnimalSchema, "Animal updated"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "patch",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/animals/{animalId}/shared",
  tags: ["Animals"],
  summary: "Toggle animal is_shared",
  request: {
    params: zod.object({ animalId: zod.string() }),
    body: {
      content: {
        "application/json": {
          schema: zod.object({
            isShared: zod.boolean().openapi({ example: true }),
          }),
        },
      },
    },
  },
  responses: {
    200: JsonResponse(AnimalSchema, "Animal sharing updated"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "patch",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/animals/{animalId}/deceased",
  tags: ["Animals"],
  summary: "Toggle animal is_deceased",
  request: {
    params: zod.object({ animalId: zod.string() }),
    body: {
      content: {
        "application/json": {
          schema: zod.object({
            isDeceased: zod.boolean().openapi({ example: false }),
          }),
        },
      },
    },
  },
  responses: {
    200: JsonResponse(AnimalSchema, "Animal deceased status updated"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "patch",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/animals/{animalId}/microship",
  tags: ["Animals"],
  summary: "Assign or remove a microship from an animal",
  request: {
    params: zod.object({ animalId: zod.string() }),
    body: {
      content: {
        "application/json": {
          schema: zod.object({
            microship_id: zod.number().nullable().openapi({ example: 1 }),
          }),
        },
      },
    },
  },
  responses: {
    200: JsonResponse(AnimalSchema, "Animal microship updated"),
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
  path: "/animals/{animalId}",
  tags: ["Animals"],
  summary: "Delete animal",
  request: {
    params: zod.object({ animalId: zod.string() }),
  },
  responses: {
    200: JsonResponse(AnimalSchema, "Animal deleted"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

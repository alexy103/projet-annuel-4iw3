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
  VeterinarianSchema,
  CreateVeterinarianPayloadSchema,
  UpdateVeterinarianPayloadSchema,
} from "../schemas";

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/veterinarians",
  tags: ["Veterinarians"],
  summary: "Get all veterinarians",
  responses: {
    200: JsonResponse(zod.array(VeterinarianSchema), "List of veterinarians"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/veterinarians/search",
  tags: ["Veterinarians"],
  summary: "Search veterinarians by full name",
  request: {
    query: zod.object({
      firstName: zod.string().optional().openapi({ example: "John" }),
      lastName: zod.string().optional().openapi({ example: "DOE" }),
    }),
  },
  responses: {
    200: JsonResponse(zod.array(VeterinarianSchema), "List of matching veterinarians"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/veterinarians/{veterinarianId}",
  tags: ["Veterinarians"],
  summary: "Get veterinarian by id",
  request: {
    params: zod.object({ veterinarianId: zod.string() }),
  },
  responses: {
    200: JsonResponse(VeterinarianSchema, "Veterinarian found"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/veterinarians/clinic/{clinicId}",
  tags: ["Veterinarians"],
  summary: "Get veterinarians by clinic id",
  request: {
    params: zod.object({ clinicId: zod.string() }),
  },
  responses: {
    200: JsonResponse(zod.array(VeterinarianSchema), "List of veterinarians for clinic"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/veterinarians",
  tags: ["Veterinarians"],
  summary: "Create veterinarian",
  request: {
    body: {
      content: {
        "application/json": { schema: CreateVeterinarianPayloadSchema },
      },
    },
  },
  responses: {
    201: JsonResponse(VeterinarianSchema, "Veterinarian created"),
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
  path: "/veterinarians/{veterinarianId}",
  tags: ["Veterinarians"],
  summary: "Update veterinarian",
  request: {
    params: zod.object({ veterinarianId: zod.string() }),
    body: {
      content: {
        "application/json": { schema: UpdateVeterinarianPayloadSchema },
      },
    },
  },
  responses: {
    200: JsonResponse(VeterinarianSchema, "Veterinarian updated"),
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
  path: "/veterinarians/{veterinarianId}/presence",
  tags: ["Veterinarians"],
  summary: "Set veterinarian presence",
  request: {
    params: zod.object({ veterinarianId: zod.string() }),
    body: {
      content: {
        "application/json": {
          schema: zod.object({
            is_present: zod.boolean().openapi({ example: true }),
          }),
        },
      },
    },
  },
  responses: {
    200: JsonResponse(VeterinarianSchema, "Veterinarian presence updated"),
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
  path: "/veterinarians/{veterinarianId}",
  tags: ["Veterinarians"],
  summary: "Delete veterinarian",
  request: {
    params: zod.object({ veterinarianId: zod.string() }),
  },
  responses: {
    200: JsonResponse(VeterinarianSchema, "Veterinarian deleted"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

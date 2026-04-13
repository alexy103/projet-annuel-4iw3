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
  ClinicSchema,
  CreateClinicPayloadSchema, SpecieSchema,
  UpdateClinicPayloadSchema,
} from "../schemas";

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/clinics",
  tags: ["Clinics"],
  summary: "Get all clinics",
  responses: {
    200: JsonResponse(zod.array(ClinicSchema), "List of clinics"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/clinics/search-name",
  tags: ["Clinics"],
  summary: "Search clinics by name",
  request: {
    query: zod.object({
      name: zod.string().openapi({ example: "Clinique Vétérinaire du Parc" }),
    }),
  },
  responses: {
    200: JsonResponse(zod.array(ClinicSchema), "List of clinics matching name"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/clinics/search",
  tags: ["Clinics"],
  summary: "Search clinics by criteria",
  request: {
    query: zod.object({
      phoneNumber: zod.string().optional().openapi({ example: "0123456789" }),
      postcode: zod.string().optional().openapi({ example: "75001" }),
      city: zod.string().optional().openapi({ example: "Paris" }),
      address: zod.string().optional().openapi({ example: "123 Rue de Paris" }),
    }),
  },
  responses: {
    200: JsonResponse(zod.array(ClinicSchema), "List of matching clinics"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/clinics/{clinicId}",
  tags: ["Clinics"],
  summary: "Get clinic by id",
  request: {
    params: zod.object({ clinicId: zod.string() }),
  },
  responses: {
    200: JsonResponse(ClinicSchema, "Clinic found"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/clinics",
  tags: ["Clinics"],
  summary: "Create clinic",
  request: {
    body: {
      content: {
        "application/json": { schema: CreateClinicPayloadSchema },
      },
    },
  },
  responses: {
    201: JsonResponse(ClinicSchema, "Clinic created"),
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
  path: "/clinics/{clinicId}",
  tags: ["Clinics"],
  summary: "Update clinic",
  request: {
    params: zod.object({ clinicId: zod.string() }),
    body: {
      content: {
        "application/json": { schema: UpdateClinicPayloadSchema },
      },
    },
  },
  responses: {
    200: JsonResponse(ClinicSchema, "Clinic updated"),
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
  path: "/clinics/{clinicId}",
  tags: ["Clinics"],
  summary: "Delete clinic",
  request: {
    params: zod.object({ clinicId: zod.string() }),
  },
  responses: {
    200: JsonResponse(ClinicSchema, "Clinic deleted"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

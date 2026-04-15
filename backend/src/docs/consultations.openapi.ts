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
  ConsultationSchema,
  CreateConsultationPayloadSchema,
  UpdateConsultationPayloadSchema,
} from "../schemas";

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/consultations",
  tags: ["Consultations"],
  summary: "Get all consultations",
  responses: {
    200: JsonResponse(zod.array(ConsultationSchema), "List of consultations"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/consultations/{consultationId}",
  tags: ["Consultations"],
  summary: "Get consultation by id",
  request: {
    params: zod.object({ consultationId: zod.string() }),
  },
  responses: {
    200: JsonResponse(ConsultationSchema, "Consultation found"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/consultations/appointment/{appointmentId}",
  tags: ["Consultations"],
  summary: "Get consultations by appointment id",
  request: {
    params: zod.object({ appointmentId: zod.string() }),
  },
  responses: {
    200: JsonResponse(ConsultationSchema, "List of consultations for appointment"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/consultations/veterinarian/{veterinarianId}",
  tags: ["Consultations"],
  summary: "Get consultations by veterinarian id",
  request: {
    params: zod.object({ veterinarianId: zod.string() }),
  },
  responses: {
    200: JsonResponse(zod.array(ConsultationSchema), "List of consultations for veterinarian"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/consultations",
  tags: ["Consultations"],
  summary: "Create consultation",
  request: {
    body: {
      content: {
        "application/json": { schema: CreateConsultationPayloadSchema },
      },
    },
  },
  responses: {
    201: JsonResponse(ConsultationSchema, "Consultation created"),
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
  path: "/consultations/{consultationId}",
  tags: ["Consultations"],
  summary: "Update consultation",
  request: {
    params: zod.object({ consultationId: zod.string() }),
    body: {
      content: {
        "application/json": { schema: UpdateConsultationPayloadSchema },
      },
    },
  },
  responses: {
    200: JsonResponse(ConsultationSchema, "Consultation updated"),
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
  path: "/consultations/{consultationId}",
  tags: ["Consultations"],
  summary: "Delete consultation",
  request: {
    params: zod.object({ consultationId: zod.string() }),
  },
  responses: {
    200: JsonResponse(ConsultationSchema, "Consultation deleted"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

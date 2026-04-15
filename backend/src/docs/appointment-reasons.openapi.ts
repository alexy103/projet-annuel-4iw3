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
  AppointmentReasonSchema,
  CreateAppointmentReasonPayloadSchema,
  UpdateAppointmentReasonPayloadSchema,
} from "../schemas";

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/appointment-reasons",
  tags: ["Appointment Reasons"],
  summary: "Get all appointment reasons",
  responses: {
    200: JsonResponse(zod.array(AppointmentReasonSchema), "List of appointment reasons"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/appointment-reasons/search",
  tags: ["Appointment Reasons"],
  summary: "Search appointment reason by label",
  request: {
    query: zod.object({
      label: zod.string().openapi({ example: "Vaccination" }),
    }),
  },
  responses: {
    200: JsonResponse(zod.array(AppointmentReasonSchema), "Appointment reason found"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/appointment-reasons/{reasonId}",
  tags: ["Appointment Reasons"],
  summary: "Get appointment reason by id",
  request: {
    params: zod.object({ reasonId: zod.string() }),
  },
  responses: {
    200: JsonResponse(AppointmentReasonSchema, "Appointment reason found"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/appointment-reasons",
  tags: ["Appointment Reasons"],
  summary: "Create appointment reason",
  request: {
    body: {
      content: {
        "application/json": { schema: CreateAppointmentReasonPayloadSchema },
      },
    },
  },
  responses: {
    201: JsonResponse(AppointmentReasonSchema, "Appointment reason created"),
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
  path: "/appointment-reasons/{reasonId}",
  tags: ["Appointment Reasons"],
  summary: "Update appointment reason",
  request: {
    params: zod.object({ reasonId: zod.string() }),
    body: {
      content: {
        "application/json": { schema: UpdateAppointmentReasonPayloadSchema },
      },
    },
  },
  responses: {
    200: JsonResponse(AppointmentReasonSchema, "Appointment reason updated"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "delete",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/appointment-reasons/{reasonId}",
  tags: ["Appointment Reasons"],
  summary: "Delete appointment reason",
  request: {
    params: zod.object({ reasonId: zod.string() }),
  },
  responses: {
    200: JsonResponse(AppointmentReasonSchema, "Appointment reason deleted"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

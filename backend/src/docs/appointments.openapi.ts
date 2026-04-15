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
  AppointmentSchema,
  CreateAppointmentPayloadSchema,
  UpdateAppointmentPayloadSchema,
} from "../schemas";

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/appointments",
  tags: ["Appointments"],
  summary: "Get all appointments",
  responses: {
    200: JsonResponse(zod.array(AppointmentSchema), "List of appointments"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/appointments/{appointmentId}",
  tags: ["Appointments"],
  summary: "Get appointment by id",
  request: {
    params: zod.object({ appointmentId: zod.string() }),
  },
  responses: {
    200: JsonResponse(AppointmentSchema, "Appointment found"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/appointments/user/{userId}",
  tags: ["Appointments"],
  summary: "Get appointments by user id",
  request: {
    params: zod.object({ userId: zod.string() }),
  },
  responses: {
    200: JsonResponse(zod.array(AppointmentSchema), "List of appointments for user"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/appointments/animal/{animalId}",
  tags: ["Appointments"],
  summary: "Get appointments by animal id",
  request: {
    params: zod.object({ animalId: zod.string() }),
  },
  responses: {
    200: JsonResponse(zod.array(AppointmentSchema), "List of appointments for animal"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/appointments/clinic/{clinicId}",
  tags: ["Appointments"],
  summary: "Get appointments by clinic id",
  request: {
    params: zod.object({ clinicId: zod.string() }),
  },
  responses: {
    200: JsonResponse(zod.array(AppointmentSchema), "List of appointments for clinic"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/appointments/reason/{reasonId}",
  tags: ["Appointments"],
  summary: "Get appointments by reason id",
  request: {
    params: zod.object({ reasonId: zod.string() }),
  },
  responses: {
    200: JsonResponse(zod.array(AppointmentSchema), "List of appointments for reason"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/appointments",
  tags: ["Appointments"],
  summary: "Create appointment",
  request: {
    body: {
      content: {
        "application/json": { schema: CreateAppointmentPayloadSchema },
      },
    },
  },
  responses: {
    201: JsonResponse(AppointmentSchema, "Appointment created"),
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
  path: "/appointments/{appointmentId}",
  tags: ["Appointments"],
  summary: "Update appointment",
  request: {
    params: zod.object({ appointmentId: zod.string() }),
    body: {
      content: {
        "application/json": { schema: UpdateAppointmentPayloadSchema },
      },
    },
  },
  responses: {
    200: JsonResponse(AppointmentSchema, "Appointment updated"),
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
  path: "/appointments/{appointmentId}/completed",
  tags: ["Appointments"],
  summary: "Toggle appointment is_completed",
  request: {
    params: zod.object({ appointmentId: zod.string() }),
    body: {
      content: {
        "application/json": {
          schema: zod.object({
            isCompleted: zod.boolean().openapi({ example: true }),
          }),
        },
      },
    },
  },
  responses: {
    200: JsonResponse(AppointmentSchema, "Appointment completion updated"),
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
  path: "/appointments/{appointmentId}",
  tags: ["Appointments"],
  summary: "Delete appointment",
  request: {
    params: zod.object({ appointmentId: zod.string() }),
  },
  responses: {
    200: JsonResponse(AppointmentSchema, "Appointment deleted"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

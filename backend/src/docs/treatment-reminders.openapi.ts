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
  TreatmentReminderSchema,
  CreateTreatmentReminderPayloadSchema,
} from "../schemas";

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/treatment-reminders/treatment/{treatmentId}",
  tags: ["Treatment Reminders"],
  summary: "Get treatment reminders by treatment id",
  request: {
    params: zod.object({ treatmentId: zod.string() }),
  },
  responses: {
    200: JsonResponse(zod.array(TreatmentReminderSchema), "List of reminders for treatment"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/treatment-reminders/frequency/{frequencyId}",
  tags: ["Treatment Reminders"],
  summary: "Get treatment reminders by frequency id",
  request: {
    params: zod.object({ frequencyId: zod.string() }),
  },
  responses: {
    200: JsonResponse(zod.array(TreatmentReminderSchema), "List of reminders for frequency"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/treatment-reminders/treatment/{treatmentId}/frequency/{frequencyId}",
  tags: ["Treatment Reminders"],
  summary: "Get treatment reminder by treatment and frequency",
  request: {
    params: zod.object({
      treatmentId: zod.string(),
      frequencyId: zod.string(),
    }),
  },
  responses: {
    200: JsonResponse(TreatmentReminderSchema, "Treatment reminder found"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/treatment-reminders",
  tags: ["Treatment Reminders"],
  summary: "Create treatment reminder",
  request: {
    body: {
      content: {
        "application/json": { schema: CreateTreatmentReminderPayloadSchema },
      },
    },
  },
  responses: {
    201: JsonResponse(TreatmentReminderSchema, "Treatment reminder created"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    409: ConflictResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "delete",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/treatment-reminders/treatment/{treatmentId}/frequency/{frequencyId}",
  tags: ["Treatment Reminders"],
  summary: "Delete treatment reminder",
  request: {
    params: zod.object({
      treatmentId: zod.string(),
      frequencyId: zod.string(),
    }),
  },
  responses: {
    200: JsonResponse(TreatmentReminderSchema, "Treatment reminder deleted"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

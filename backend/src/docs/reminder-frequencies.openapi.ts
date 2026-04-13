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
  ReminderFrequencySchema,
  CreateReminderFrequencyPayloadSchema,
  UpdateReminderFrequencyPayloadSchema,
} from "../schemas";

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/reminder-frequencies",
  tags: ["Reminder Frequencies"],
  summary: "Get all reminder frequencies",
  responses: {
    200: JsonResponse(zod.array(ReminderFrequencySchema), "List of reminder frequencies"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/reminder-frequencies/{frequencyId}",
  tags: ["Reminder Frequencies"],
  summary: "Get reminder frequency by id",
  request: {
    params: zod.object({ frequencyId: zod.string() }),
  },
  responses: {
    200: JsonResponse(ReminderFrequencySchema, "Reminder frequency found"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/reminder-frequencies",
  tags: ["Reminder Frequencies"],
  summary: "Create reminder frequency",
  request: {
    body: {
      content: {
        "application/json": { schema: CreateReminderFrequencyPayloadSchema },
      },
    },
  },
  responses: {
    201: JsonResponse(ReminderFrequencySchema, "Reminder frequency created"),
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
  path: "/reminder-frequencies/{frequencyId}",
  tags: ["Reminder Frequencies"],
  summary: "Update reminder frequency",
  request: {
    params: zod.object({ frequencyId: zod.string() }),
    body: {
      content: {
        "application/json": { schema: UpdateReminderFrequencyPayloadSchema },
      },
    },
  },
  responses: {
    200: JsonResponse(ReminderFrequencySchema, "Reminder frequency updated"),
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
  path: "/reminder-frequencies/{frequencyId}",
  tags: ["Reminder Frequencies"],
  summary: "Delete reminder frequency",
  request: {
    params: zod.object({ frequencyId: zod.string() }),
  },
  responses: {
    200: JsonResponse(ReminderFrequencySchema, "Reminder frequency deleted"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

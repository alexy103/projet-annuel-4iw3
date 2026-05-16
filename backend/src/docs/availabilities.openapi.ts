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
  AvailabilitySchema,
  CreateAvailabilityPayloadSchema,
  UpdateAvailabilityPayloadSchema,
} from "../schemas";

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/availabilities",
  tags: ["Availabilities"],
  summary: "Get all availabilities",
  responses: {
    200: JsonResponse(zod.array(AvailabilitySchema), "List of availabilities"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/availabilities/{availabilityId}",
  tags: ["Availabilities"],
  summary: "Get availability by id",
  request: {
    params: zod.object({ availabilityId: zod.string() }),
  },
  responses: {
    200: JsonResponse(AvailabilitySchema, "Availability found"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/availabilities/clinic/{clinicId}",
  tags: ["Availabilities"],
  summary: "Get availability by clinic id",
  request: {
    params: zod.object({ clinicId: zod.string() }),
  },
  responses: {
    200: JsonResponse(zod.array(AvailabilitySchema), "List of availabilities for the clinic"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/availabilities",
  tags: ["Availabilities"],
  summary: "Create availability",
  request: {
    body: {
      content: {
        "application/json": { schema: CreateAvailabilityPayloadSchema },
      },
    },
  },
  responses: {
    201: JsonResponse(AvailabilitySchema, "Availability created"),
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
  path: "/availabilities/{availabilityId}",
  tags: ["Availabilities"],
  summary: "Update availability",
  request: {
    params: zod.object({ availabilityId: zod.string() }),
    body: {
      content: {
        "application/json": { schema: UpdateAvailabilityPayloadSchema },
      },
    },
  },
  responses: {
    200: JsonResponse(AvailabilitySchema, "Availability updated"),
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
  path: "/availabilities/{availabilityId}/slot-rules",
  tags: ["Availabilities"],
  summary: "Update availability slot rules",
  request: {
    params: zod.object({ availabilityId: zod.string() }),
    body: {
      content: {
        "application/json": {
          schema: zod.object({
            slot_rules: zod.unknown().openapi({
              example: { break: { start: 12, end: 13 }, interval: 15, capacity: 1 },
            }),
          }),
        },
      },
    },
  },
  responses: {
    200: JsonResponse(AvailabilitySchema, "Slot rules updated"),
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
  path: "/availabilities/{availabilityId}",
  tags: ["Availabilities"],
  summary: "Delete availability",
  request: {
    params: zod.object({ availabilityId: zod.string() }),
  },
  responses: {
    200: JsonResponse(AvailabilitySchema, "Availability deleted"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

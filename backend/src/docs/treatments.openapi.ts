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
  TreatmentSchema,
  CreateTreatmentPayloadSchema,
  UpdateTreatmentPayloadSchema,
} from "../schemas";

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/treatments",
  tags: ["Treatments"],
  summary: "Get all treatments",
  responses: {
    200: JsonResponse(zod.array(TreatmentSchema), "List of treatments"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/treatments/{treatmentId}",
  tags: ["Treatments"],
  summary: "Get treatment by id",
  request: {
    params: zod.object({ treatmentId: zod.string() }),
  },
  responses: {
    200: JsonResponse(TreatmentSchema, "Treatment found"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/treatments/medicine/{medicineId}",
  tags: ["Treatments"],
  summary: "Get treatments by medicine id",
  request: {
    params: zod.object({ medicineId: zod.string() }),
  },
  responses: {
    200: JsonResponse(zod.array(TreatmentSchema), "List of treatments for medicine"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/treatments/animal/{animalId}",
  tags: ["Treatments"],
  summary: "Get treatments by animal id",
  request: {
    params: zod.object({ animalId: zod.string() }),
  },
  responses: {
    200: JsonResponse(zod.array(TreatmentSchema), "List of treatments for animal"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/treatments/type/{typeId}",
  tags: ["Treatments"],
  summary: "Get treatments by treatment type id",
  request: {
    params: zod.object({ typeId: zod.string() }),
  },
  responses: {
    200: JsonResponse(zod.array(TreatmentSchema), "List of treatments for type"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/treatments",
  tags: ["Treatments"],
  summary: "Create treatment",
  request: {
    body: {
      content: {
        "application/json": { schema: CreateTreatmentPayloadSchema },
      },
    },
  },
  responses: {
    201: JsonResponse(TreatmentSchema, "Treatment created"),
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
  path: "/treatments/{treatmentId}",
  tags: ["Treatments"],
  summary: "Update treatment",
  request: {
    params: zod.object({ treatmentId: zod.string() }),
    body: {
      content: {
        "application/json": { schema: UpdateTreatmentPayloadSchema },
      },
    },
  },
  responses: {
    200: JsonResponse(TreatmentSchema, "Treatment updated"),
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
  path: "/treatments/{treatmentId}",
  tags: ["Treatments"],
  summary: "Delete treatment",
  request: {
    params: zod.object({ treatmentId: zod.string() }),
  },
  responses: {
    200: JsonResponse(TreatmentSchema, "Treatment deleted"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

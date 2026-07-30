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
  MedicineSchema,
  CreateMedicinePayloadSchema,
  UpdateMedicinePayloadSchema,
} from "../schemas";

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/medicines",
  tags: ["Medicines"],
  summary: "Get all medicines",
  responses: {
    200: JsonResponse(zod.array(MedicineSchema), "List of medicines"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/medicines/search",
  tags: ["Medicines"],
  summary: "Search medicines by brand",
  request: {
    query: zod.object({
      brand: zod.string().openapi({ example: "Doliprane" }),
    }),
  },
  responses: {
    200: JsonResponse(zod.array(MedicineSchema), "List of medicines matching brand"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/medicines/{medicineId}",
  tags: ["Medicines"],
  summary: "Get medicine by id",
  request: {
    params: zod.object({ medicineId: zod.string() }),
  },
  responses: {
    200: JsonResponse(MedicineSchema, "Medicine found"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/medicines",
  tags: ["Medicines"],
  summary: "Create medicine",
  request: {
    body: {
      content: {
        "application/json": { schema: CreateMedicinePayloadSchema },
      },
    },
  },
  responses: {
    201: JsonResponse(MedicineSchema, "Medicine created"),
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
  path: "/medicines/{medicineId}",
  tags: ["Medicines"],
  summary: "Update medicine",
  request: {
    params: zod.object({ medicineId: zod.string() }),
    body: {
      content: {
        "application/json": { schema: UpdateMedicinePayloadSchema },
      },
    },
  },
  responses: {
    200: JsonResponse(MedicineSchema, "Medicine updated"),
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
  path: "/medicines/{medicineId}",
  tags: ["Medicines"],
  summary: "Delete medicine",
  request: {
    params: zod.object({ medicineId: zod.string() }),
  },
  responses: {
    200: JsonResponse(MedicineSchema, "Medicine deleted"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: ServerErrorResponse,
  },
});

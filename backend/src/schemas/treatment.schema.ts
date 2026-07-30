import zod from "zod";
import { registry } from "../docs/openapi.registry";

const TreatmentBaseSchema = zod
  .object({
    date: zod.coerce.date().openapi({
      description: "Date of the treatment",
      example: "2024-03-20",
    }),

    note: zod.string().trim().optional().openapi({
      description: "Optional note about the treatment",
      example: "Given after meal",
    }),

    quantity: zod
      .number()
      .int("Quantity must be an integer")
      .min(1, "Quantity must be at least 1")
      .max(32767, "Quantity too large")
      .optional()
      .openapi({
        description: "Quantity of treatment",
        example: 2,
      }),

    treatment_type_id: zod
      .number()
      .int("Treatment type ID must be an integer")
      .positive("Treatment type ID must be positive")
      .openapi({
        description: "Treatment type ID",
        example: 1,
      }),

    medicine_id: zod
      .number()
      .int("Medicine ID must be an integer")
      .positive("Medicine ID must be positive")
      .optional()
      .openapi({
        description: "Medicine ID (optional)",
        example: 1,
      }),

    animal_id: zod
      .number()
      .int("Animal ID must be an integer")
      .positive("Animal ID must be positive")
      .openapi({
        description: "Animal ID",
        example: 1,
      }),
  })
  .strict();

export const CreateTreatmentPayloadSchema = TreatmentBaseSchema;
registry.register("CreateTreatmentPayload", CreateTreatmentPayloadSchema);

export const UpdateTreatmentPayloadSchema = TreatmentBaseSchema.partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

registry.register("UpdateTreatmentPayload", UpdateTreatmentPayloadSchema);

export const TreatmentSchema = TreatmentBaseSchema.extend({
  id: zod.number(),
  created_at: zod.date(),
  updated_at: zod.date(),
});

registry.register("Treatment", TreatmentSchema);

export type Treatment = zod.infer<typeof TreatmentSchema>;
export type CreateTreatmentPayload = zod.infer<
  typeof CreateTreatmentPayloadSchema
>;
export type UpdateTreatmentPayload = zod.infer<
  typeof UpdateTreatmentPayloadSchema
>;

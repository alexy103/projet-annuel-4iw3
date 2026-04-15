import zod from "zod";
import { registry } from "../docs/openapi.registry";

const CareBaseSchema = zod
  .object({
    date: zod.coerce.date().openapi({
      description: "Date of the care",
      example: "2024-03-20",
    }),

    treatment_type_id: zod
      .number()
      .int("Treatment type ID must be an integer")
      .positive("Treatment type ID must be positive")
      .openapi({
        description: "Treatment type ID",
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

export const CreateCarePayloadSchema = CareBaseSchema;
registry.register("CreateCarePayload", CreateCarePayloadSchema);

export const UpdateCarePayloadSchema = CareBaseSchema.partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

registry.register("UpdateCarePayload", UpdateCarePayloadSchema);

export const CareSchema = CareBaseSchema.extend({
  id: zod.number(),
  created_at: zod.date(),
  updated_at: zod.date(),
});

registry.register("Care", CareSchema);

export type Care = zod.infer<typeof CareSchema>;
export type CreateCarePayload = zod.infer<typeof CreateCarePayloadSchema>;
export type UpdateCarePayload = zod.infer<typeof UpdateCarePayloadSchema>;

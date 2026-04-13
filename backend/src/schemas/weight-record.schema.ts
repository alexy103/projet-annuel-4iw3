import zod from "zod";
import { registry } from "../docs/openapi.registry";

const WeightRecordBaseSchema = zod
  .object({
    date: zod.coerce.date().openapi({
      description: "Date of the weight record",
      example: "2024-03-20",
    }),

    weight: zod
      .number()
      .int("Weight must be an integer")
      .min(1)
      .max(100000)
      .positive("Weight must be positive")
      .openapi({
        description: "Weight of the animal (in kg)",
        example: 5.5,
      }),

    animal_id: zod
      .number()
      .int("Animal ID must be an integer")
      .positive("Animal ID must be positive")
      .openapi({
        description: "Related animal ID",
        example: 1,
      }),
  })
  .strict();

export const CreateWeightRecordPayloadSchema = WeightRecordBaseSchema;
registry.register("CreateWeightRecordPayload", CreateWeightRecordPayloadSchema);

export const UpdateWeightRecordPayloadSchema = WeightRecordBaseSchema.partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

registry.register("UpdateWeightRecordPayload", UpdateWeightRecordPayloadSchema);

export const WeightRecordSchema = WeightRecordBaseSchema.extend({
  id: zod.number(),
  created_at: zod.date(),
  updated_at: zod.date(),
});

registry.register("WeightRecord", WeightRecordSchema);

export type WeightRecord = zod.infer<typeof WeightRecordSchema>;
export type CreateWeightRecordPayload = zod.infer<
  typeof CreateWeightRecordPayloadSchema
>;
export type UpdateWeightRecordPayload = zod.infer<
  typeof UpdateWeightRecordPayloadSchema
>;

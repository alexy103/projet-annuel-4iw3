import zod from "zod";
import { registry } from "../docs/openapi.registry";

const HeightRecordBaseSchema = zod
  .object({
    date: zod.coerce.date().openapi({
      description: "Date of the height record",
      example: "2024-03-20",
    }),

    height: zod
      .number()
      .int("Height must be an integer")
      .min(1)
      .max(300)
      .positive("Height must be positive")
      .openapi({
        description: "Height of the animal (in m)",
        example: 1.50,
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

export const CreateHeightRecordPayloadSchema = HeightRecordBaseSchema;
registry.register("CreateHeightRecordPayload", CreateHeightRecordPayloadSchema);

export const UpdateHeightRecordPayloadSchema = HeightRecordBaseSchema.partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

registry.register("UpdateHeightRecordPayload", UpdateHeightRecordPayloadSchema);

export const HeightRecordSchema = HeightRecordBaseSchema.extend({
  id: zod.number(),
  created_at: zod.date(),
  updated_at: zod.date(),
});

registry.register("HeightRecord", HeightRecordSchema);

export type HeightRecord = zod.infer<typeof HeightRecordSchema>;
export type CreateHeightRecordPayload = zod.infer<
  typeof CreateHeightRecordPayloadSchema
>;
export type UpdateHeightRecordPayload = zod.infer<
  typeof UpdateHeightRecordPayloadSchema
>;

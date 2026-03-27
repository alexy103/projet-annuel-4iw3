import zod from "zod";
import { registry } from "../docs/openapi.registry";

const MicroshipBaseSchema = zod
  .object({
    number: zod
      .string()
      .trim()
      .min(1, "Number is required")
      .max(150, "Number too long (max 150)")
      .refine(
        (number: string): boolean => number !== "",
        "Number cannot be empty",
      )
      .openapi({
        description: "Microship number",
        minLength: 1,
        maxLength: 150,
        example: "250268743912345",
      }),

    position: zod
      .string()
      .trim()
      .min(1, "Position is required")
      .max(100, "Position too long (max 100)")
      .refine(
        (position: string): boolean => position !== "",
        "Position cannot be empty",
      )
      .openapi({
        description: "Position of the microship",
        minLength: 1,
        maxLength: 100,
        example: "Left shoulder",
      }),
  })
  .strict();

export const CreateMicroshipPayloadSchema = MicroshipBaseSchema;
registry.register("CreateMicroshipPayload", CreateMicroshipPayloadSchema);

export const UpdateMicroshipPayloadSchema = MicroshipBaseSchema.partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

registry.register("UpdateMicroshipPayload", UpdateMicroshipPayloadSchema);

export const MicroshipSchema = MicroshipBaseSchema.extend({
  id: zod.number(),
  created_at: zod.date(),
  updated_at: zod.date(),
});

registry.register("Microship", MicroshipSchema);

export type Microship = zod.infer<typeof MicroshipSchema>;
export type CreateMicroshipPayload = zod.infer<
  typeof CreateMicroshipPayloadSchema
>;
export type UpdateMicroshipPayload = zod.infer<
  typeof UpdateMicroshipPayloadSchema
>;

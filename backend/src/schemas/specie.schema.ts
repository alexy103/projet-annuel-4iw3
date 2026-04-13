import zod from "zod";
import { registry } from "../docs/openapi.registry";

const SpecieBaseSchema = zod
  .object({
    name: zod
      .string()
      .trim()
      .min(1, "Name is required")
      .max(255, "Name too long (max 255)")
      .refine((name: string): boolean => name !== "", "Name cannot be empty")
      .openapi({
        description: "Species name",
        minLength: 1,
        maxLength: 255,
        example: "Labrador",
      }),
  })
  .strict();

export const CreateSpeciePayloadSchema = SpecieBaseSchema;
registry.register("CreateSpeciesPayload", CreateSpeciePayloadSchema);

export const UpdateSpeciePayloadSchema = SpecieBaseSchema.partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

registry.register("UpdateSpeciesPayload", UpdateSpeciePayloadSchema);

export const SpecieSchema = SpecieBaseSchema.extend({
  id: zod.number(),
  created_at: zod.date(),
  updated_at: zod.date(),
});

registry.register("Specie", SpecieSchema);

export type Specie = zod.infer<typeof SpecieSchema>;
export type CreateSpeciePayload = zod.infer<typeof CreateSpeciePayloadSchema>;
export type UpdateSpeciePayload = zod.infer<typeof UpdateSpeciePayloadSchema>;

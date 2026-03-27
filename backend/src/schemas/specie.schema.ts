import zod from "zod";
import { registry } from "../docs/openapi.registry";

const SpeciesBaseSchema = zod
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

export const CreateSpeciesPayloadSchema = SpeciesBaseSchema;
registry.register("CreateSpeciesPayload", CreateSpeciesPayloadSchema);

export const UpdateSpeciesPayloadSchema = SpeciesBaseSchema.partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

registry.register("UpdateSpeciesPayload", UpdateSpeciesPayloadSchema);

export const SpeciesSchema = SpeciesBaseSchema.extend({
  id: zod.number(),
  created_at: zod.date(),
  updated_at: zod.date(),
});

registry.register("Species", SpeciesSchema);

export type Species = zod.infer<typeof SpeciesSchema>;
export type CreateSpeciesPayload = zod.infer<typeof CreateSpeciesPayloadSchema>;
export type UpdateSpeciesPayload = zod.infer<typeof UpdateSpeciesPayloadSchema>;

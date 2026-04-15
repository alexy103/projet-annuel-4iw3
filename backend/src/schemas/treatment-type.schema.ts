import zod from "zod";
import { registry } from "../docs/openapi.registry";

const TreatmentTypeBaseSchema = zod
  .object({
    user_id: zod.number().openapi({ description: "Owner user ID", example: 1 }),

    name: zod
      .string()
      .trim()
      .min(1, "Name is required")
      .max(255, "Name too long (max 255)")
      .refine((name: string): boolean => name !== "", "Name cannot be empty")
      .openapi({
        description: "Treatment type name",
        minLength: 1,
        maxLength: 255,
        example: "Vaccination",
      }),
  })
  .strict();

export const CreateTreatmentTypePayloadSchema = TreatmentTypeBaseSchema.omit({ user_id: true });
registry.register("CreateTreatmentTypePayload", CreateTreatmentTypePayloadSchema);

export const UpdateTreatmentTypePayloadSchema = TreatmentTypeBaseSchema.omit({ user_id: true })
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

registry.register("UpdateTreatmentTypePayload", UpdateTreatmentTypePayloadSchema);

export const TreatmentTypeSchema = TreatmentTypeBaseSchema.extend({
  id: zod.number(),
  created_at: zod.date(),
  updated_at: zod.date(),
});

registry.register("TreatmentType", TreatmentTypeSchema);

export type TreatmentType = zod.infer<typeof TreatmentTypeSchema>;
export type CreateTreatmentTypePayload = zod.infer<typeof CreateTreatmentTypePayloadSchema>;
export type UpdateTreatmentTypePayload = zod.infer<typeof UpdateTreatmentTypePayloadSchema>;

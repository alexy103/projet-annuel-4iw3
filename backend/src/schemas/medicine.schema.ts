import zod from "zod";
import { registry } from "../docs/openapi.registry";

const MedicineBaseSchema = zod
  .object({
    user_id: zod.number().openapi({ description: "Owner user ID", example: 1 }),

    brand: zod
      .string()
      .trim()
      .min(1, "Brand is required")
      .max(100, "Brand too long (max 100)")
      .refine((brand: string): boolean => brand !== "", "Brand cannot be empty")
      .openapi({
        description: "Medicine brand name",
        minLength: 1,
        maxLength: 100,
        example: "Doliprane",
      }),
  })
  .strict();

export const CreateMedicinePayloadSchema = MedicineBaseSchema.omit({ user_id: true });
registry.register("CreateMedicinePayload", CreateMedicinePayloadSchema);

export const UpdateMedicinePayloadSchema = MedicineBaseSchema.omit({ user_id: true })
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

registry.register("UpdateMedicinePayload", UpdateMedicinePayloadSchema);

export const MedicineSchema = MedicineBaseSchema.extend({
  id: zod.number(),
  created_at: zod.date(),
  updated_at: zod.date(),
});

registry.register("Medicine", MedicineSchema);

export type Medicine = zod.infer<typeof MedicineSchema>;
export type CreateMedicinePayload = zod.infer<typeof CreateMedicinePayloadSchema>;
export type UpdateMedicinePayload = zod.infer<typeof UpdateMedicinePayloadSchema>;

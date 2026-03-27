import zod from "zod";
import { registry } from "../docs/openapi.registry";

const VeterinarianBaseSchema = zod
  .object({
    first_name: zod
      .string()
      .trim()
      .min(1, "First name is required")
      .max(150, "First name too long (max 150)")
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Invalid characters")
      .openapi({
        description: "Veterinarian first name",
        example: "John",
      }),

    last_name: zod
      .string()
      .trim()
      .min(1, "Last name is required")
      .max(150, "Last name too long (max 150)")
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Invalid characters")
      .openapi({
        description: "Veterinarian last name",
        example: "DOE",
      }),

    is_present: zod.boolean().default(true).openapi({
      description: "Whether the veterinarian is present",
      example: true,
    }),

    clinic_id: zod
      .number()
      .int("Clinic ID must be an integer")
      .positive("Clinic ID must be positive")
      .openapi({
        description: "Clinic ID",
        example: 1,
      }),
  })
  .strict();

export const CreateVeterinarianPayloadSchema = VeterinarianBaseSchema;
registry.register("CreateVeterinarianPayload", CreateVeterinarianPayloadSchema);

export const UpdateVeterinarianPayloadSchema = VeterinarianBaseSchema.partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

registry.register("UpdateVeterinarianPayload", UpdateVeterinarianPayloadSchema);

export const VeterinarianSchema = VeterinarianBaseSchema.extend({
  id: zod.number(),
  created_at: zod.date(),
  updated_at: zod.date(),
});

registry.register("Veterinarian", VeterinarianSchema);

export type Veterinarian = zod.infer<typeof VeterinarianSchema>;
export type CreateVeterinarianPayload = zod.infer<
  typeof CreateVeterinarianPayloadSchema
>;
export type UpdateVeterinarianPayload = zod.infer<
  typeof UpdateVeterinarianPayloadSchema
>;

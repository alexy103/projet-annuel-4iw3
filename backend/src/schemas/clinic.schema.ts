import zod from "zod";
import { registry } from "../docs/openapi.registry";

const ClinicBaseSchema = zod
  .object({
    address: zod
      .string()
      .trim()
      .min(1, "Address is required")
      .max(255, "Address too long (max 255)")
      .openapi({
        description: "Clinic address",
        minLength: 1,
        maxLength: 255,
        example: "123 Rue de Paris",
      }),

    city: zod
      .string()
      .trim()
      .min(1, "City is required")
      .max(255, "City too long (max 255)")
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Invalid characters")
      .openapi({
        description: "City of clinic",
        minLength: 1,
        maxLength: 255,
        example: "Paris",
      }),

    postcode: zod
      .string()
      .trim()
      .min(1, "Postcode is required")
      .max(6, "Postcode too long (max 6)")
      .regex(/^[0-9]{4,6}$/, "Invalid postcode")
      .openapi({
        description: "Postcode",
        example: "75001",
      }),

    phone_number: zod
      .string()
      .trim()
      .min(1, "Phone number is required")
      .max(12, "Phone number too long (max 12)")
      .regex(/^[0-9+\s-]+$/, "Invalid phone number")
      .openapi({
        description: "Clinic phone number",
        example: "0123456789",
      }),

    availability_id: zod
      .number()
      .int("Availability ID must be an integer")
      .positive("Availability ID must be positive")
      .openapi({
        description: "Linked availability ID",
        example: 1,
      }),
  })
  .strict();

export const CreateClinicPayloadSchema = ClinicBaseSchema;
registry.register("CreateClinicPayload", CreateClinicPayloadSchema);

export const UpdateClinicPayloadSchema = ClinicBaseSchema.partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

registry.register("UpdateClinicPayload", UpdateClinicPayloadSchema);

export const ClinicSchema = ClinicBaseSchema.extend({
  id: zod.number(),
  created_at: zod.date(),
  updated_at: zod.date(),
});

registry.register("Clinic", ClinicSchema);

export type Clinic = zod.infer<typeof ClinicSchema>;
export type CreateClinicPayload = zod.infer<typeof CreateClinicPayloadSchema>;
export type UpdateClinicPayload = zod.infer<typeof UpdateClinicPayloadSchema>;

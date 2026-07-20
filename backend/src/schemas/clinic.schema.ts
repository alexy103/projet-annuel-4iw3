import zod from "zod";
import { registry } from "../docs/openapi.registry";

const ClinicBaseSchema = zod
  .object({
    name: zod
      .string()
      .trim()
      .min(1, "Name is required")
      .max(255, "Name too long (max 255)")
      .refine((name: string): boolean => name !== "", "Name cannot be empty")
      .openapi({
          description: "Clinic name",
          minLength: 1,
          maxLength: 255,
          example: "Clinique Vétérinaire du Parc",
      }),
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

  })
  .strict();

export const CLINIC_STATUSES = ["pending", "approved", "rejected"] as const;

export const ClinicStatusSchema = zod.enum(CLINIC_STATUSES).openapi({
  description: "Clinic account status",
  example: "approved",
});

export const CreateClinicPayloadSchema = ClinicBaseSchema;
registry.register("CreateClinicPayload", CreateClinicPayloadSchema);

export const RegisterClinicPayloadSchema = ClinicBaseSchema;
registry.register("RegisterClinicPayload", RegisterClinicPayloadSchema);

export const UpdateClinicPayloadSchema = ClinicBaseSchema.partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

registry.register("UpdateClinicPayload", UpdateClinicPayloadSchema);

export const UpdateClinicStatusPayloadSchema = zod
  .object({
    status: ClinicStatusSchema,
  })
  .strict();

registry.register("UpdateClinicStatusPayload", UpdateClinicStatusPayloadSchema);

export const ClinicSchema = ClinicBaseSchema.extend({
  id: zod.number(),
  status: ClinicStatusSchema,
  created_at: zod.date(),
  updated_at: zod.date(),
});

registry.register("Clinic", ClinicSchema);

export type Clinic = zod.infer<typeof ClinicSchema>;
export type ClinicStatus = zod.infer<typeof ClinicStatusSchema>;
export type CreateClinicPayload = zod.infer<typeof CreateClinicPayloadSchema>;
export type RegisterClinicPayload = zod.infer<typeof RegisterClinicPayloadSchema>;
export type UpdateClinicPayload = zod.infer<typeof UpdateClinicPayloadSchema>;
export type UpdateClinicStatusPayload = zod.infer<
  typeof UpdateClinicStatusPayloadSchema
>;

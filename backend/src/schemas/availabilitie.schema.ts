import zod from "zod";
import { registry } from "../docs/openapi.registry";

const AvailabilityBaseSchema = zod
  .object({
    clinic_id: zod
      .number()
      .int("Clinic ID must be an integer")
      .positive("Clinic ID must be positive")
      .openapi({
        description: "Linked clinic ID",
        example: 1,
      }),

    day: zod
      .string()
      .trim()
      .min(1, "Day is required")
      .max(25, "Day too long (max 25)")
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Invalid characters")
      .refine((day: string): boolean => day !== "", "day cannot be empty")
      .openapi({
        description: "Day of availability (maximum 25 characters)",
        minLength: 1,
        maxLength: 25,
        example: "Monday",
      }),

    opening: zod
      .number()
      .int("Opening must be an integer")
      .min(0, "Opening must be at least 0")
      .max(23, "Opening must be at most 23")
      .openapi({
        description: "Opening hour",
        example: 9,
      }),

    closing: zod
      .number()
      .int("Closing must be an integer")
      .min(0, "Closing must be at least 0")
      .max(23, "Closing must be at most 23")
      .openapi({
        description: "Closing hour",
        example: 18,
      }),

    slot_rules: zod.unknown().openapi({
      description: "Slot rules in JSON format",
      example: {
        break: {
            start: 12,
            end: 13
        },
        interval: 15,
      },
    }),
  })
  .strict();

export const CreateAvailabilityPayloadSchema = AvailabilityBaseSchema.strict();
registry.register("CreateAvailabilityPayload", CreateAvailabilityPayloadSchema);

export const UpdateAvailabilityPayloadSchema = AvailabilityBaseSchema.partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  })
  .refine(
    (data) => {
      if (data.opening !== undefined && data.closing !== undefined) {
        return data.opening < data.closing;
      }
      return true;
    },
    {
      message: "Opening must be lower than closing",
      path: ["opening"],
    },
  );

registry.register("UpdateAvailabilityPayload", UpdateAvailabilityPayloadSchema);

export const AvailabilitySchema = AvailabilityBaseSchema.extend({
  id: zod.number(),
  created_at: zod.date(),
  updated_at: zod.date(),
});

registry.register("Availability", AvailabilitySchema);

export type Availability = zod.infer<typeof AvailabilitySchema>;
export type CreateAvailabilityPayload = zod.infer<
  typeof CreateAvailabilityPayloadSchema
>;
export type UpdateAvailabilityPayload = zod.infer<
  typeof UpdateAvailabilityPayloadSchema
>;

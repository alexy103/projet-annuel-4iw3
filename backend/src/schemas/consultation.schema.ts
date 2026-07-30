import zod from "zod";
import { registry } from "../docs/openapi.registry";

const ConsultationBaseSchema = zod
  .object({
    veterinarian_id: zod
      .number()
      .int("Veterinarian ID must be an integer")
      .positive("Veterinarian ID must be positive")
      .openapi({
        description: "Veterinarian ID",
        example: 1,
      }),

    summary: zod.string().trim().min(1, "Summary is required").openapi({
      description: "Consultation summary",
      example: "Routine check-up, everything is normal",
    }),

    prescription: zod
      .string()
      .trim()
      .min(1, "Prescription is required")
      .openapi({
        description: "Prescription details",
        example: "Give 1 tablet per day for 5 days",
      }),

    appointment_id: zod
      .number()
      .int("Appointment ID must be an integer")
      .positive("Appointment ID must be positive")
      .openapi({
        description: "Related appointment ID",
        example: 1,
      }),
  })
  .strict();

export const CreateConsultationPayloadSchema = ConsultationBaseSchema;
registry.register("CreateConsultationPayload", CreateConsultationPayloadSchema);

export const UpdateConsultationPayloadSchema = ConsultationBaseSchema.partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

registry.register("UpdateConsultationPayload", UpdateConsultationPayloadSchema);

export const ConsultationSchema = ConsultationBaseSchema.extend({
  id: zod.number(),
  created_at: zod.date(),
  updated_at: zod.date(),
});

registry.register("Consultation", ConsultationSchema);

export type Consultation = zod.infer<typeof ConsultationSchema>;
export type CreateConsultationPayload = zod.infer<
  typeof CreateConsultationPayloadSchema
>;
export type UpdateConsultationPayload = zod.infer<
  typeof UpdateConsultationPayloadSchema
>;

import zod from "zod";
import { registry } from "../docs/openapi.registry";

const AppointmentReasonBaseSchema = zod
  .object({
    label: zod
      .string()
      .trim()
      .min(1, "Label is required")
      .max(255, "Label too long (max 255)")
      .refine((label: string): boolean => label !== "", "Label cannot be empty")
      .openapi({
        description: "Appointment reason label",
        minLength: 1,
        maxLength: 255,
        example: "Vaccination",
      }),
  })
  .strict();

export const CreateAppointmentReasonPayloadSchema = AppointmentReasonBaseSchema;
registry.register("CreateAppointmentReasonPayload", CreateAppointmentReasonPayloadSchema);

export const UpdateAppointmentReasonPayloadSchema = AppointmentReasonBaseSchema.partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

registry.register("UpdateAppointmentReasonPayload", UpdateAppointmentReasonPayloadSchema);

export const AppointmentReasonSchema = AppointmentReasonBaseSchema.extend({
  id: zod.number(),
  created_at: zod.date(),
  updated_at: zod.date(),
});

registry.register("AppointmentReason", AppointmentReasonSchema);

export type AppointmentReason = zod.infer<typeof AppointmentReasonSchema>;
export type CreateAppointmentReasonPayload = zod.infer<typeof CreateAppointmentReasonPayloadSchema>;
export type UpdateAppointmentReasonPayload = zod.infer<typeof UpdateAppointmentReasonPayloadSchema>;

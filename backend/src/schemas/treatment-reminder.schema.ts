import zod from "zod";
import { registry } from "../docs/openapi.registry";

const TreatmentReminderBaseSchema = zod
  .object({
    treatment_id: zod
      .number()
      .int("Treatment ID must be an integer")
      .positive("Treatment ID must be positive")
      .openapi({
        description: "Treatment ID",
        example: 1,
      }),

    reminder_frequency_id: zod
      .number()
      .int("Reminder frequency ID must be an integer")
      .positive("Reminder frequency ID must be positive")
      .openapi({
        description: "Reminder frequency ID",
        example: 1,
      }),

    amount: zod
      .number()
      .int("Amount must be an integer")
      .min(1, "Amount must be at least 1")
      .max(20, "Amount too large")
      .openapi({
        description: "Amount for the reminder frequency",
        example: 2,
      }),
  })
  .strict();

export const CreateTreatmentReminderPayloadSchema = TreatmentReminderBaseSchema;
registry.register(
  "CreateTreatmentReminderPayload",
  CreateTreatmentReminderPayloadSchema,
);

export const UpdateTreatmentReminderPayloadSchema =
  TreatmentReminderBaseSchema.partial()
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    });

registry.register(
  "UpdateTreatmentReminderPayload",
  UpdateTreatmentReminderPayloadSchema,
);

export const TreatmentReminderSchema = TreatmentReminderBaseSchema.extend({
  created_at: zod.date(),
  updated_at: zod.date(),
});

registry.register("TreatmentReminder", TreatmentReminderSchema);

export type TreatmentReminder = zod.infer<typeof TreatmentReminderSchema>;
export type CreateTreatmentReminderPayload = zod.infer<
  typeof CreateTreatmentReminderPayloadSchema
>;
export type UpdateTreatmentReminderPayload = zod.infer<
  typeof UpdateTreatmentReminderPayloadSchema
>;

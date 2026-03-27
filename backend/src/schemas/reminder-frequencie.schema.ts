import zod from "zod";
import { registry } from "../docs/openapi.registry";

const frequencies = ["Jour(s)", "Semaine(s)", "Mois", "An(s)"] as const;

const ReminderFrequencyBaseSchema = zod
  .object({
    frequency: zod.enum(frequencies).openapi({
      description: "Reminder frequency",
      example: "Mois",
    }),
  })
  .strict();

export const CreateReminderFrequencyPayloadSchema = ReminderFrequencyBaseSchema;
registry.register(
  "CreateReminderFrequencyPayload",
  CreateReminderFrequencyPayloadSchema,
);

export const UpdateReminderFrequencyPayloadSchema =
  ReminderFrequencyBaseSchema.partial()
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    });

registry.register(
  "UpdateReminderFrequencyPayload",
  UpdateReminderFrequencyPayloadSchema,
);

export const ReminderFrequencySchema = ReminderFrequencyBaseSchema.extend({
  id: zod.number(),
  created_at: zod.date(),
  updated_at: zod.date(),
});

registry.register("ReminderFrequency", ReminderFrequencySchema);

export type ReminderFrequency = zod.infer<typeof ReminderFrequencySchema>;
export type CreateReminderFrequencyPayload = zod.infer<
  typeof CreateReminderFrequencyPayloadSchema
>;
export type UpdateReminderFrequencyPayload = zod.infer<
  typeof UpdateReminderFrequencyPayloadSchema
>;

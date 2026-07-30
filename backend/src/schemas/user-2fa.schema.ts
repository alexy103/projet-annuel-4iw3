import zod from "zod";
import { registry } from "../docs/openapi.registry";

const Users2FAPayloadFieldsSchema = zod.object({
  totp_secret: zod
    .string()
    .trim()
    .min(1, "TOTP secret cannot be empty")
    .optional()
    .openapi({
      description: "TOTP secret for 2FA",
      example: "JBSWY3DPEHPK3PXP",
    }),

  is_enabled: zod.boolean().default(false).openapi({
    description: "Whether 2FA is enabled",
    example: false,
  }),

  recovery_codes: zod
    .unknown()
    .optional()
    .openapi({
      description: "Recovery codes for 2FA",
      example: ["code1", "code2", "code3"],
    }),
});

const Users2FABaseSchema = Users2FAPayloadFieldsSchema.extend({
  user_id: zod
    .number()
    .int("User ID must be an integer")
    .positive("User ID must be positive")
    .openapi({
      description: "User ID linked to 2FA",
      example: 1,
    }),
}).strict();

export const CreateUsers2FAPayloadSchema = Users2FABaseSchema.refine(
  (data) => {
    if (data.is_enabled) {
      return !!data.totp_secret;
    }
    return true;
  },
  {
    message: "TOTP secret is required when 2FA is enabled",
    path: ["totp_secret"],
  },
);

const CreateUsers2FAPayloadDocSchema = Users2FAPayloadFieldsSchema.strict();
registry.register("CreateUsers2FAPayload", CreateUsers2FAPayloadDocSchema);

export const UpdateUsers2FAPayloadSchema = Users2FABaseSchema.partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  })
  .refine(
    (data) => {
      if (data.is_enabled === true && data.totp_secret !== undefined) {
        return data.totp_secret.length > 0;
      }
      return true;
    },
    {
      message: "TOTP secret cannot be empty when enabling 2FA",
      path: ["totp_secret"],
    },
  );

// Schéma docs OpenAPI (sans refine)
const UpdateUsers2FAPayloadDocSchema =
  Users2FAPayloadFieldsSchema.partial().strict();
registry.register("UpdateUsers2FAPayload", UpdateUsers2FAPayloadDocSchema);

export const Users2FASchema = Users2FABaseSchema.extend({
  id: zod.number(),
  created_at: zod.date(),
});

registry.register("Users2FA", Users2FASchema);

export type Users2FA = zod.infer<typeof Users2FASchema>;
export type CreateUsers2FAPayload = zod.infer<
  typeof CreateUsers2FAPayloadSchema
>;
export type UpdateUsers2FAPayload = zod.infer<
  typeof UpdateUsers2FAPayloadSchema
>;

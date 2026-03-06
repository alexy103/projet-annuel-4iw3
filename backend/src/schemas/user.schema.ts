import zod from "zod";
import { registry } from "../docs/openapi.registry";
import { AppError } from "../types";

const domain: string | undefined = process.env.DOMAIN;
if (!domain) throw new AppError("Server Error", 500);

const UserBaseSchema = zod
  .object({
    last_name: zod
      .string()
      .trim()
      .min(1, "Last name is required")
      .max(150, "Last name to long (max 150)")
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Invalid characters")
      .refine(
        (last_name: string): boolean => last_name !== "",
        "last_name cannot be empty",
      )
      .openapi({
        description: "Last name of user (maximum 150 characters)",
        minLength: 1,
        maxLength: 150,
        example: "DOE",
      }),
    first_name: zod
      .string()
      .trim()
      .min(1, "First name is required")
      .max(150, "First name to long (max 150)")
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Invalid characters")
      .refine(
        (first_name: string): boolean => first_name !== "",
        "first_name cannot be empty",
      )
      .openapi({
        description: "First name of user (maximum 150 characters)",
        minLength: 1,
        maxLength: 150,
        example: "John",
      }),
    email: zod
      .email()
      .max(254, "Email too long")
      .refine((email) => email.endsWith(domain), {
        message: "Invalid email",
      })
      .openapi({
        description: "User email",
        example: "john.doe@test.com",
      }),
    role_id: zod.number().int().positive("Vaild role ID").openapi({
      example: 1,
    }),
    must_change_password: zod.boolean().optional().openapi({
      description: "User change password",
      example: true,
    }),
  })
  .strict();

export const CreateUserPayloadSchema = UserBaseSchema.strict();
registry.register("CreateUserPayload", CreateUserPayloadSchema);

export const UpdateUserPayloadSchema = UserBaseSchema.partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

registry.register("UpdateUserPayload", UpdateUserPayloadSchema);

export const UserSchema = UserBaseSchema.extend({
  id: zod.number(),
  password_hash: zod
    .string()
    .min(12, "Password too short (minimum 12 characters)")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
      "Password must contain uppercase, lowercase, number, special char",
    )
    .openapi({
      description: "User password (minimum 8 characters)",
      minLength: 12,
      format: "password",
      example: "P@ssw0rd1234",
    }),
  email_verified: zod.boolean(),
  email_verification_code: zod.string().min(0).max(6).nullable(),
  email_verification_expires_at: zod.date().nullable(),
  is_activated: zod.boolean(),
  password_temp_expires_at: zod.date().nullable(),
  created_at: zod.date(),
  updated_at: zod.date(),
});

registry.register("User", UserSchema);

export type User = zod.infer<typeof UserSchema>;
export type CreateUserPayload = zod.infer<typeof CreateUserPayloadSchema>;
export type UpdateUserPayload = zod.infer<typeof UpdateUserPayloadSchema>;

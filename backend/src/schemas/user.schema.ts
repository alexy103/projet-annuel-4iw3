import zod from "zod";
import { registry } from "../docs/openapi.registry";

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
    clinic_id: zod.number().int().positive("Vaild clinic").optional().openapi({
        example: 2,
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
  onboarding_completed: zod.boolean(),
  password_temp_expires_at: zod.date().nullable(),
  profile_picture: zod.string().nullable().optional().openapi({
    description: "Profile picture URL",
    example: "/uploads/users/1-1234567890.jpg",
  }),
  created_at: zod.date(),
  updated_at: zod.date(),
});

registry.register("User", UserSchema);

export const UserPublicSchema = UserSchema.omit({
  password_hash: true,
  email_verification_code: true,
  email_verification_expires_at: true,
  password_temp_expires_at: true,
});

registry.register("UserPublic", UserPublicSchema);

export type User = zod.infer<typeof UserSchema>;
export type UserPublic = zod.infer<typeof UserPublicSchema>;
export type CreateUserPayload = zod.infer<typeof CreateUserPayloadSchema>;
export type UpdateUserPayload = zod.infer<typeof UpdateUserPayloadSchema>;

export function toPublicUser(user: User): UserPublic {
  const { password_hash, email_verification_code, email_verification_expires_at, password_temp_expires_at, ...publicUser } = user;
  return publicUser;
}

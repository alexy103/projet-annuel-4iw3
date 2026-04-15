import zod from "zod";
import { registry } from "../docs/openapi.registry";

export const LoginPayloadSchema = zod.object({
  email: zod.email().max(254, "Email too long"),
  password: zod
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
}).strict();
registry.register("LoginPayload", LoginPayloadSchema);

export const LoginSchema = zod.object({
  user_id: zod.string(),
  role_id: zod.string(),
  clinic_id: zod.string().optional(),
  access_token: zod.string(),
  refresh_token: zod.string(),
  session_id: zod.number().optional(),
});
registry.register("Login", LoginSchema);

export const RefreshTokenPayloadSchema = zod
  .object({
    refresh_token: zod.string().openapi({
      description: "Refresh token from login",
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    }),
  })
  .strict();
registry.register("RefreshTokenPayload", RefreshTokenPayloadSchema);

export const RefreshTokenSchema = zod.object({
  access_token: zod.string(),
  refresh_token: zod.string(),
});
registry.register("RefreshToken", RefreshTokenSchema);

export const VerifyCodePayloadSchema = zod
  .object({
    email: zod.email().max(254, "Email too long"),
    code: zod.number().openapi({
      example: "068475",
    }),
  })
  .strict();
registry.register("VerifyCodePayload", VerifyCodePayloadSchema);

export const ResendCodePayloadSchema = zod.object({
  email: zod.email().max(254, "Email too long"),
});
registry.register("ResendCodePayload", ResendCodePayloadSchema);

export const ChangePasswordPayloadSchema = zod
  .object({
    email: zod.email().max(254, "Email too long"),
    old_password: zod
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
    new_password: zod
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
        example: "P@ssw0rd12345",
      }),
  })
  .strict();
registry.register("ChangePasswordPayload", ChangePasswordPayloadSchema);

export const ResetPasswordPayloadSchema = zod
  .object({
    email: zod.email().max(254, "Email too long"),
    password: zod
      .string()
      .min(12, "Password too short (minimum 12 characters)")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
        "Password must contain uppercase, lowercase, number, special char",
      )
      .optional()
      .openapi({
        description: "User password (minimum 8 characters)",
        minLength: 12,
        format: "password",
        example: "P@ssw0rd12345",
      }),
    must_change_password: zod.boolean().optional().openapi({
      example: false,
    }),
  })
  .strict();
registry.register("ResetPasswordPayload", ResetPasswordPayloadSchema);
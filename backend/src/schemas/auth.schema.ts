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

const passwordSchema = zod
  .string()
  .min(12, "Password too short (minimum 12 characters)")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
    "Password must contain uppercase, lowercase, number, special char",
  )
  .openapi({ description: "User password", minLength: 12, format: "password", example: "P@ssw0rd1234" });

export const RegisterPayloadSchema = zod
  .object({
    last_name: zod.string().trim().min(1).max(150).regex(/^[a-zA-ZÀ-ÿ\s'-]+$/).openapi({ example: "DOE" }),
    first_name: zod.string().trim().min(1).max(150).regex(/^[a-zA-ZÀ-ÿ\s'-]+$/).openapi({ example: "John" }),
    email: zod.email().max(254).openapi({ example: "john.doe@test.com" }),
    password: passwordSchema,
    clinic_id: zod.number().int().positive().optional().openapi({ example: 1 }),
  })
  .strict();
registry.register("RegisterPayload", RegisterPayloadSchema);

export type RegisterPayload = zod.infer<typeof RegisterPayloadSchema>;

export const GithubOAuthPayloadSchema = zod
  .object({
    code: zod.string().min(1, "Authorization code is required").openapi({
      description: "GitHub OAuth authorization code returned on the redirect_uri callback",
      example: "a1b2c3d4e5f6g7h8i9j0",
    }),
  })
  .strict();
registry.register("GithubOAuthPayload", GithubOAuthPayloadSchema);

export type GithubOAuthPayload = zod.infer<typeof GithubOAuthPayloadSchema>;

export const TwoFactorStatusSchema = zod.object({
  enabled: zod.boolean().openapi({
    description: "Whether 2FA is enabled for the current user",
    example: false,
  }),
});
registry.register("TwoFactorStatus", TwoFactorStatusSchema);

export const TwoFactorSetupResponseSchema = zod.object({
  secret: zod.string().openapi({
    description: "TOTP secret (base32)",
    example: "JBSWY3DPEHPK3PXP",
  }),
  otpauthUrl: zod.string().openapi({
    description: "otpauth:// URI to render as a QR code",
    example: "otpauth://totp/VetApp:john.doe@test.com?secret=JBSWY3DPEHPK3PXP&issuer=VetApp",
  }),
});
registry.register("TwoFactorSetupResponse", TwoFactorSetupResponseSchema);

export const TwoFactorCodePayloadSchema = zod
  .object({
    code: zod.string().trim().min(6, "Code must be at least 6 characters").max(10).openapi({
      description: "TOTP code or recovery code",
      example: "123456",
    }),
  })
  .strict();
registry.register("TwoFactorCodePayload", TwoFactorCodePayloadSchema);
export type TwoFactorCodePayload = zod.infer<typeof TwoFactorCodePayloadSchema>;

export const TwoFactorVerifyPayloadSchema = zod
  .object({
    pending_token: zod.string().min(1, "pending_token is required").openapi({
      description: "Short-lived token returned by /auth/login when 2FA is required",
    }),
    code: zod.string().trim().min(6).max(10).openapi({
      description: "TOTP code or recovery code",
      example: "123456",
    }),
  })
  .strict();
registry.register("TwoFactorVerifyPayload", TwoFactorVerifyPayloadSchema);
export type TwoFactorVerifyPayload = zod.infer<typeof TwoFactorVerifyPayloadSchema>;

export const TwoFactorEnableResponseSchema = zod.object({
  recoveryCodes: zod.array(zod.string()).openapi({
    description: "One-time recovery codes, shown only once",
  }),
});
registry.register("TwoFactorEnableResponse", TwoFactorEnableResponseSchema);

export const RequiresTwoFactorSchema = zod.object({
  requiresTwoFactor: zod.literal(true),
  pendingToken: zod.string(),
});
registry.register("RequiresTwoFactor", RequiresTwoFactorSchema);

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
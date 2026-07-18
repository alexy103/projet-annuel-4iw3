import { registry } from "./openapi.registry";
import {
  BadRequest,
  ConflictResponse,
  ForbiddenResponse,
  JsonResponse,
  NotFoundResponse,
  ServerErrorResponse,
  UnauthorizedResponse,
} from "./openapi.responses";
import {  MessageResponseSchema } from "./openapi.schemas";
import {
  LoginPayloadSchema,
  LoginSchema,
  RefreshTokenSchema, RefreshTokenPayloadSchema, VerifyCodePayloadSchema, ResendCodePayloadSchema,
  ChangePasswordPayloadSchema, ResetPasswordPayloadSchema, UserSchema, RegisterPayloadSchema,
  GithubOAuthPayloadSchema,
  TwoFactorSetupResponseSchema, TwoFactorCodePayloadSchema, TwoFactorVerifyPayloadSchema,
  TwoFactorEnableResponseSchema, TwoFactorStatusSchema,
} from "../schemas";

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }],
  path: "/auth/register",
  tags: ["Auth"],
  summary: "Register",
  request: {
    body: {
      content: {
        "application/json": {
          schema: RegisterPayloadSchema,
        },
      },
    },
  },
  responses: {
    200: JsonResponse(UserSchema, "User created"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    409: ConflictResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }],
  path: "/auth/login",
  tags: ["Auth"],
  summary: "Login",
  request: {
    body: {
      content: {
        "application/json": {
          schema: LoginPayloadSchema,
        },
      },
    },
  },
  responses: {
    200: JsonResponse(LoginSchema, "User connected"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    409: ConflictResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/auth/logout",
  tags: ["Auth"],
  summary: "Logout user",
  responses: {
    200: JsonResponse(MessageResponseSchema, "User logged out"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    409: ConflictResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/auth/refresh",
  tags: ["Auth"],
  summary: "Refresh token",
  request: {
    body: {
      content: {
        "application/json": {
          schema: RefreshTokenPayloadSchema
        },
      },
    },
  },
  responses: {
    200: JsonResponse(RefreshTokenSchema, "Refresh token"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    409: ConflictResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }],
  path: "/auth/verify-code",
  tags: ["Auth"],
  summary: "Verify code verification",
  request: {
    body: {
      content: {
        "application/json": {
          schema: VerifyCodePayloadSchema
        },
      },
    },
  },
  responses: {
    200: JsonResponse(UserSchema, "User code has been verify"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    409: ConflictResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }],
  path: "/auth/resend-code",
  tags: ["Auth"],
  summary: "Resend code verification",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ResendCodePayloadSchema
        },
      },
    },
  },
  responses: {
    200: JsonResponse(UserSchema, "User code verification sended"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    409: ConflictResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }],
  path: "/auth/change-password",
  tags: ["Auth"],
  summary: "Change password for the first connection",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ChangePasswordPayloadSchema
        },
      },
    },
  },
  responses: {
    200: JsonResponse(UserSchema, "User password has been change"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    409: ConflictResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }],
  path: "/auth/oauth/github",
  tags: ["Auth"],
  summary: "Login or register with GitHub OAuth (exchanges the authorization code server-side)",
  request: {
    body: {
      content: {
        "application/json": {
          schema: GithubOAuthPayloadSchema,
        },
      },
    },
  },
  responses: {
    200: JsonResponse(LoginSchema, "Authenticated via GitHub"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "get",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/auth/2fa/status",
  tags: ["Auth"],
  summary: "Get whether 2FA is enabled for the current user",
  responses: {
    200: JsonResponse(TwoFactorStatusSchema, "2FA status"),
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/auth/2fa/setup",
  tags: ["Auth"],
  summary: "Generate a TOTP secret and otpauth URL for the current user",
  responses: {
    200: JsonResponse(TwoFactorSetupResponseSchema, "TOTP secret generated"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    409: ConflictResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/auth/2fa/enable",
  tags: ["Auth"],
  summary: "Confirm TOTP setup and enable 2FA",
  request: {
    body: {
      content: {
        "application/json": {
          schema: TwoFactorCodePayloadSchema,
        },
      },
    },
  },
  responses: {
    200: JsonResponse(TwoFactorEnableResponseSchema, "2FA enabled, recovery codes returned"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    409: ConflictResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/auth/2fa/disable",
  tags: ["Auth"],
  summary: "Disable 2FA for the current user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: TwoFactorCodePayloadSchema,
        },
      },
    },
  },
  responses: {
    200: JsonResponse(MessageResponseSchema, "2FA disabled"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    409: ConflictResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }],
  path: "/auth/2fa/verify",
  tags: ["Auth"],
  summary: "Verify TOTP/recovery code after a login requiring 2FA",
  request: {
    body: {
      content: {
        "application/json": {
          schema: TwoFactorVerifyPayloadSchema,
        },
      },
    },
  },
  responses: {
    200: JsonResponse(LoginSchema, "Authenticated after 2FA verification"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    409: ConflictResponse,
    500: ServerErrorResponse,
  },
});

registry.registerPath({
  method: "post",
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  path: "/auth/reset-password",
  tags: ["Auth"],
  summary: "Reset user password",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ResetPasswordPayloadSchema
        },
      },
    },
  },
  responses: {
    200: JsonResponse(UserSchema, "User password has been change"),
    400: BadRequest,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    409: ConflictResponse,
    500: ServerErrorResponse,
  },
});

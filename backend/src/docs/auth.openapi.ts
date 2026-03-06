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
  ChangePasswordPayloadSchema, ResetPasswordPayloadSchema, UserSchema
} from "../schemas";

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

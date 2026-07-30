import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

// Ce registry va contenir tous les schémas + routes
export const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "ApiKeyAuth", {
  type: "apiKey",
  in: "header",
  name: "x-api-key",
});

// Bearer séparé pour plus tard
registry.registerComponent("securitySchemes", "BearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

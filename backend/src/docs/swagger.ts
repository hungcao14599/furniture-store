import { Express, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./openapi.js";

const buildOpenApiDocument = (request: Request) => ({
  ...openApiDocument,
  servers: [
    {
      url: `${request.protocol}://${request.get("host")}`,
      description: "Current server",
    },
  ],
});

export const setupSwagger = (app: Express) => {
  app.get("/docs-json", (request: Request, response: Response) => {
    response.json(buildOpenApiDocument(request));
  });

  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(null, {
      explorer: true,
      customSiteTitle: "Lumina Maison API Docs",
      swaggerOptions: {
        url: "/docs-json",
        persistAuthorization: true,
        docExpansion: "list",
        filter: true,
        displayRequestDuration: true,
      },
      customCss: `
        .swagger-ui .topbar { display: none; }
        .swagger-ui .scheme-container { box-shadow: none; border-bottom: 1px solid #e7ddd1; }
      `,
    }),
  );
};

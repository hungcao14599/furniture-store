import { Express, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./openapi.js";

export const setupSwagger = (app: Express) => {
  app.get("/docs-json", (_request: Request, response: Response) => {
    response.json(openApiDocument);
  });

  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      explorer: true,
      customSiteTitle: "Lumina Maison API Docs",
      swaggerOptions: {
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

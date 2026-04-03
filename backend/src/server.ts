import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";

const startServer = async () => {
  try {
    app.listen(env.PORT, () => {
      console.log(`Backend listening on http://localhost:${env.PORT}`);
    });

    prisma
      .$connect()
      .then(() => {
        console.log("Prisma connected successfully");
      })
      .catch((error) => {
        console.error("Prisma connection failed. Server is running in degraded mode.", error);
      });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();

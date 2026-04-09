import { prisma } from "../config/prisma.js";
import { productEmbeddingService } from "../services/productEmbedding.service.js";

const run = async () => {
  const summary = await productEmbeddingService.syncAllProductEmbeddings();

  console.info(
    `[embedding] synced=${summary.synced} skipped=${summary.skipped} failed=${summary.failed} total=${summary.total}`,
  );
};

run()
  .catch((error) => {
    console.error("[embedding] backfill failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

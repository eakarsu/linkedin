CREATE TABLE "runtime_ai_results" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "prompt" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "providerReceipt" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "runtime_ai_results_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "runtime_ai_results_userId_createdAt_idx"
  ON "runtime_ai_results"("userId", "createdAt");

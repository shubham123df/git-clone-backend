-- CreateTable
CREATE TABLE "RepositoryToken" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "encrypted_token" TEXT NOT NULL,
    "scope_hint" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepositoryToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RepositoryToken_user_id_idx" ON "RepositoryToken"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "RepositoryToken_user_id_provider_key" ON "RepositoryToken"("user_id", "provider");

-- AddForeignKey
ALTER TABLE "RepositoryToken" ADD CONSTRAINT "RepositoryToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

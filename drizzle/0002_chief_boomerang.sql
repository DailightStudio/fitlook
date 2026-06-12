ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "provider" text DEFAULT 'guest' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "provider_id" text;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_provider_provider_id_idx" ON "users" USING btree ("provider","provider_id");
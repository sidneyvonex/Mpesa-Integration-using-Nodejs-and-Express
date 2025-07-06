CREATE TYPE "public"."paymentStatus" AS ENUM('Pending', 'Completed', 'Cancelled');--> statement-breakpoint
ALTER TABLE "transactions" RENAME COLUMN "transaction_amount" TO "amount";--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "transaction_status" SET DEFAULT 'Pending'::"public"."paymentStatus";--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "transaction_status" SET DATA TYPE "public"."paymentStatus" USING "transaction_status"::"public"."paymentStatus";--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "product_name" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" DROP COLUMN "updated_at";
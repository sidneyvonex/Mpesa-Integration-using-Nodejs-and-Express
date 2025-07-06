CREATE TABLE "transactions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"transaction_amount" integer NOT NULL,
	"transaction_status" varchar(20) NOT NULL,
	"checkout_request_id" varchar(255) NOT NULL,
	"mpesa_receipt_number" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

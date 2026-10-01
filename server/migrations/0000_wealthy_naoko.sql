CREATE TYPE "public"."account_type" AS ENUM('cash', 'credit_card', 'debit_card', 'saving');--> statement-breakpoint
CREATE TYPE "public"."currency" AS ENUM('CRC');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"name" varchar(100) NOT NULL,
	"balance" double precision,
	"icon" varchar(50) NOT NULL,
	"color" varchar(50) NOT NULL,
	"currency" "currency" DEFAULT 'CRC' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"type" "account_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_owner_name_idx" ON "accounts" USING btree ("owner_id","name");
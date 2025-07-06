import { pgTable, varchar, integer, timestamp } from "drizzle-orm/pg-core";

export const transactionTable = pgTable("transactions", {
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  transactionAmount: integer("transaction_amount").notNull(),
  transactionStatus: varchar("transaction_status", { length: 20 }).notNull(),

  checkoutRequestID: varchar("checkout_request_id", { length: 255 }).notNull().primaryKey(),
  mpesaReceiptNumber: varchar("mpesa_receipt_number", { length: 50 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

import { pgTable, varchar, timestamp, numeric, pgEnum } from "drizzle-orm/pg-core";
//Transaction Enum 


export const paymentStatusEnum = pgEnum("paymentStatus", ["Pending", "Completed", "Cancelled"]);

export const transactionTable = pgTable("transactions", {
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  transactionStatus: paymentStatusEnum("transaction_status").notNull().default("Pending"),
  productName:varchar('product_name',{ length: 100 }).notNull(),
  checkoutRequestID: varchar("checkout_request_id", { length: 255 }).notNull().primaryKey(),
  mpesaReceiptNumber: varchar("mpesa_receipt_number", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

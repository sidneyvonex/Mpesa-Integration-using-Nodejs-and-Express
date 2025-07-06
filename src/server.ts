import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { randomUUID } from "crypto";
import { getAccessToken } from "./lib/Auth.js";
import { stkPush } from "./lib/stkPushGen.js";
import db from "./drizzle/db.js";
import { transactionTable } from "./drizzle/schema.js";
import { eq } from "drizzle-orm";

dotenv.config();

interface StkRequestBody {
  phoneNumber: string;
  amount: number;
  productName: string;
}

const app: Application = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// 🏠 Welcome route
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to our Mpesa Integration Api using Node Js and Express Js");
});

// 📲 STK Push Request
app.post("/stk", async (req: Request, res: Response) => {
  try {
    const { phoneNumber, amount, productName }: StkRequestBody = req.body;

    const accessToken = await getAccessToken();

    const initiateStkResponse = await stkPush(accessToken, phoneNumber, amount, productName);

    const checkoutRequestID = initiateStkResponse?.CheckoutRequestID;
    if (!checkoutRequestID) {
    res.status(400).json({success: false,error: "Missing CheckoutRequestID from M-Pesa response",})
    return;
}
    // Save to database
    await db.insert(transactionTable).values({
      phoneNumber,
      transactionAmount: amount,
      transactionStatus: "PENDING",
      checkoutRequestID,
    });

    res.json({ success: true, initiateStkResponse });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to initiate STK",
      success: false,
    });
  }
});

// 📞 Safaricom Callback
app.post("/callback", async (req: Request, res: Response) => {
  try {
    const stkCallback = req.body?.Body?.stkCallback;

    if (!stkCallback) {
      res.status(400).json({ error: "Invalid callback format" });
      return;
    }

    const {
      ResultCode,
      CheckoutRequestID,
      CallbackMetadata,
    } = stkCallback;

    const transactionStatus = ResultCode === 0 ? "SUCCESS" : "FAILED";

    let mpesaReceiptNumber: string | undefined;
    let phoneNumber: string | undefined;
    let amount: number | undefined;

    if (CallbackMetadata?.Item) {
      for (const item of CallbackMetadata.Item) {
        if (item.Name === "MpesaReceiptNumber") mpesaReceiptNumber = item.Value;
        if (item.Name === "PhoneNumber") phoneNumber = item.Value;
        if (item.Name === "Amount") amount = item.Value;
      }
    }

    const updateData: any = {
      transactionStatus,
    };

    if (mpesaReceiptNumber) updateData.mpesaReceiptNumber = mpesaReceiptNumber;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (amount !== undefined) updateData.transactionAmount = amount;

    // Update the transaction in DB
    await db
      .update(transactionTable)
      .set(updateData)
      .where(eq(transactionTable.checkoutRequestID, CheckoutRequestID));

    res.json({ success: true, status: transactionStatus });
  } catch (error: any) {
    console.error("Callback error:", error);
    res.status(500).json({ error: "Something went wrong in the callback handler." });
  }
});

app.listen(PORT, () => {
  console.log(`🌟🌟 Server is running on http://localhost:${PORT}`);
});

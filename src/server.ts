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

await db.insert(transactionTable).values({
  phoneNumber,
  amount: amount.toString(),
  transactionStatus: "Pending",
  productName,
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
    console.log("📥 FULL CALLBACK:", JSON.stringify(req.body, null, 2));

    const stkCallback = req.body?.Body?.stkCallback;
    if (!stkCallback) {
      res.status(400).json({ error: "Missing stkCallback in body" });
      return;
    }

    const { CheckoutRequestID, ResultCode, CallbackMetadata } = stkCallback;
    if (!CheckoutRequestID) {
       res.status(400).json({ error: "Missing CheckoutRequestID" });
       return;
    }

    const transactionStatus = ResultCode === 0 ? "Completed" : "Cancelled";

    let mpesaReceiptNumber = "";
    let phoneNumber = "";
    let amount = "";

    if (CallbackMetadata?.Item?.length) {
      for (const item of CallbackMetadata.Item) {
        if (item.Name === "MpesaReceiptNumber") mpesaReceiptNumber = item.Value;
        if (item.Name === "PhoneNumber") phoneNumber = String(item.Value);
        if (item.Name === "Amount") amount = String(item.Value);
      }
    }

    const updateData: Record<string, any> = { transactionStatus };

    if (mpesaReceiptNumber) updateData.mpesaReceiptNumber = mpesaReceiptNumber;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (amount) updateData.amount = amount;

    const result = await db
      .update(transactionTable)
      .set(updateData)
      .where(eq(transactionTable.checkoutRequestID, CheckoutRequestID));

    console.log("✅ DB Update Result:", result);

    res.json({ success: true, status: transactionStatus });
    return;
  } catch (error: any) {
    console.error("🔥 Callback error:", error);
     res.status(500).json({ error: "Callback failed" });
     return;
  }
});


app.listen(PORT, () => {
  console.log(`🌟🌟 Server is running on http://localhost:${PORT}`);
});

import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import verifyToken from "../middleware/verifyToken.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PACKAGES = {
  bronze: { name: "Bronze Credit Package", credits: 50, amount: 500 }, // $5.00
  silver: { name: "Silver Credit Package", credits: 150, amount: 1000 }, // $10.00
  gold: { name: "Gold Credit Package", credits: 500, amount: 2500 }, // $25.00
};

// POST /api/payments/create-checkout-session
router.post("/create-checkout-session", verifyToken, async (req, res) => {
  const { packName } = req.body;
  const pack = PACKAGES[packName];

  if (!pack) {
    return res.status(400).json({ message: "Invalid credit package selected" });
  }

  try {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: pack.name,
              description: `Get ${pack.credits} consultation credits for your MediVoice account.`,
            },
            unit_amount: pack.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        userId: req.user._id.toString(),
        credits: pack.credits.toString(),
        amount: (pack.amount / 100).toString(),
      },
      success_url: `${clientUrl}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/pricing`,
    });

    res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe Session Creation Error:", err);
    res.status(500).json({ message: "Stripe error", error: err.message });
  }
});

// GET /api/payments/verify-session/:checkoutSessionId
router.get("/verify-session/:checkoutSessionId", verifyToken, async (req, res) => {
  const { checkoutSessionId } = req.params;

  try {
    // Check if transaction was already processed
    const alreadyProcessed = await Transaction.findOne({ sessionId: checkoutSessionId });
    if (alreadyProcessed) {
      const user = await User.findById(req.user._id);
      return res.json({ 
        message: "Payment already verified", 
        credits: user.credits 
      });
    }

    // Retrieve checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);
    if (!session) {
      return res.status(404).json({ message: "Stripe session not found" });
    }

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment was not successful" });
    }

    const userId = session.metadata.userId;
    const creditsToAdd = parseInt(session.metadata.credits, 10);
    const amountPaid = parseFloat(session.metadata.amount);

    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized payment verification" });
    }

    // Save transaction and increment user credits atomically
    await Transaction.create({
      sessionId: checkoutSessionId,
      userId: req.user._id,
      credits: creditsToAdd,
      amount: amountPaid,
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { credits: creditsToAdd } },
      { new: true }
    );

    res.json({ 
      message: "Credits added successfully", 
      credits: user.credits 
    });
  } catch (err) {
    console.error("Stripe Verification Error:", err);
    res.status(500).json({ message: "Stripe verification failed", error: err.message });
  }
});

export default router;

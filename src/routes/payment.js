const express = require("express");
const { userAuth } = require("../middleware/auth");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/payments");
const User = require('../models/user');
const { memberShipAmounts } = require("../utils/constant");

const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  const { memberShipType } = req.body;
  const { firstName, lastName, emailId } = req.user;

  const order = await razorpayInstance.orders.create({
    amount: memberShipAmounts[memberShipType] * 100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    currency: "INR",
    receipt: "order_rcptid_11",
    notes: {
      firstName,
      lastName,
      emailId,
      memberShipType: memberShipType,
    },
  });

  // Save the order details in the database
  const { id, amount, status, currency, receipt, notes } = order;
  const payment = new Payment({
    UserId: req.user._id,
    orderId: id,
    amount,
    status,
    currency,
    receipt,
    notes,
  });

  const savedPayment = await payment.save();

  // Return the order details to the Frontend
  res.json({
    message: "Order created successfully",
    data: {
      ...savedPayment.toJSON(),
      keyId: process.env.RAZORPAY_KEY_ID,
    },
  });
});

paymentRouter.post("/payment/webhook", async (req, res) => {
  const webHookSignature = req.headers["X-Razorpay-Signature"];

  try {
    const isValidateWebhookSignature = validateWebhookSignature(
      JSON.stringify(req.body),
      webHookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isValidateWebhookSignature) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    // Update the payment status based on DB
    const paymentDetails = req.body.payload.payment.entity;
    const paymentRecord = await Payment.findOne({
      orderId: paymentDetails.order_id,
    })

    paymentRecord.status = paymentDetails.status;
    await paymentRecord.save();

    const user = await User.findOne({ _id: paymentRecord.UserId });
    user.isPremiumUser = true;
    user.membershipType = paymentRecord.notes.memberShipType;
    await user.save();

    // if (req.body.event === "payment.captured") {
    // }
    // if (req.body.event === "payment.failed") {
    // }

    return res.status(200).json({ message: "Webhook received successfully" });
  } catch (err) {
    res.status(400).json({ message: "ERROR : " + err.message });
  }
});

paymentRouter.get("/premium/verify", userAuth, async (req, res) => {
  const user = req.user.toJSON();
  if (user.isPremiumUser) {
    return res.json({
      isPremiumUser: true,
    })
  }
  return res.json({
    isPremiumUser: false,
  });
});

module.exports = paymentRouter;

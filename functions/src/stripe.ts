import { onCall } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import Stripe from "stripe";
import { getFirestore } from "firebase-admin/firestore";

const db = getFirestore();

const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");

export const createPaymentIntent = onCall(
  { secrets: [STRIPE_SECRET_KEY] },
  async (request) => {
    const stripe = new Stripe(STRIPE_SECRET_KEY.value());

    const { paymentId } = request.data;

    if (!paymentId) {
      throw new Error("Payment ID required");
    }

    const paymentRef = db.collection("monthlyPayments").doc(paymentId);
    const paymentSnap = await paymentRef.get();

    if (!paymentSnap.exists) {
      throw new Error("Payment not found");
    }

    const payment = paymentSnap.data();
    if (!payment) {
      throw new Error("Payment data missing");
    }

    if (payment.status === "paid") {
      throw new Error("Payment already completed");
    }

    const intent = await stripe.paymentIntents.create({
      amount: payment.finalAmount * 100,
      currency: "sek",
      metadata: {
        paymentId,
        studentId: payment.studentId ?? "",
      },
    });

    await paymentRef.update({
      stripePaymentIntentId: intent.id,
    });

    return {
      clientSecret: intent.client_secret,
    };
  }
);

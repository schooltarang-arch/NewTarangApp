import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";


admin.initializeApp();
const db = getFirestore();

/* ================= GENERATE MONTHLY PAYMENTS ================= */

export const generateMonthlyPayments = onCall(async (request) => {
  const { month, isHalfMonth } = request.data;

  if (!month) {
    throw new Error("Month is required (YYYY-MM)");
  }

  const billingCycleRef = db.collection("billingCycles").doc(month);
  const billingCycleDoc = await billingCycleRef.get();

  // 🔒 Prevent duplicate generation
  if (billingCycleDoc.exists) {
    throw new Error(`Payments already generated for ${month}`);
  }

  // Create billing cycle lock
  await billingCycleRef.set({
    month,
    isHalfMonth,
    status: "generated",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    locked: true,
  });

  // 1️⃣ Fetch active enrollments
  const enrollmentsSnap = await db
    .collection("enrollments")
    .where("status", "==", "active")
    .get();

  const enrollments = enrollmentsSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as any[];

  // 2️⃣ Group by parent
  const parentMap: Record<string, any[]> = {};

  enrollments.forEach(enrollment => {
    if (!parentMap[enrollment.parentId]) {
      parentMap[enrollment.parentId] = [];
    }
    parentMap[enrollment.parentId].push(enrollment);
  });

  // 3️⃣ Generate payments
  for (const parentId in parentMap) {
    const parentEnrollments = parentMap[parentId];
    const householdCount = parentEnrollments.length;

    for (const enrollment of parentEnrollments) {
      const { studentId, courseId } = enrollment;

      const courseDoc = await db.collection("courses").doc(courseId).get();
      if (!courseDoc.exists) continue;

      const baseFee = courseDoc.data()?.monthlyFee ?? 0;

      const halfFactor = isHalfMonth ? 0.5 : 1;
      let amount = baseFee * halfFactor;

      let discount = 0;
      if (householdCount > 1) {
        discount = amount * 0.1;
        amount -= discount;
      }

      await db.collection("monthlyPayments").add({
        enrollmentId: enrollment.id,
        studentId,
        parentId,
        courseId,
        month,
        baseAmount: baseFee,
        halfMonthApplied: isHalfMonth,
        discountApplied: Math.round(discount),
        finalAmount: Math.round(amount),
        currency: "sek",
        status: "pending",
        stripePaymentIntentId: null,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        paidAt: null,
      });
    }
  }

  return { message: `Payments generated for ${month}` };
});

export { createPaymentIntent } from "./stripe";
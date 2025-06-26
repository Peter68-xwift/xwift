import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { UserModel } from "../../../../lib/database";

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const user = await UserModel.findUserById(userId);

    if (!user || user.role !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { purchaseRequestId, phoneNumber, transactionMessage } =
      await request.json();

    if (!purchaseRequestId || !phoneNumber || !transactionMessage) {
      return NextResponse.json(
        {
          error:
            "Purchase request ID, phone number, and transaction message are required",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise; // ✅ correct usage
    const db = client.db("mern_auth_app"); // ⬅️ use your actual DB name

    // Get the purchase request
    const purchaseRequest = await db.collection("purchaseRequests").findOne({
      _id: new ObjectId(purchaseRequestId),
      userId: user._id,
    });

    if (!purchaseRequest) {
      return NextResponse.json(
        { error: "Purchase request not found" },
        { status: 404 }
      );
    }

    if (purchaseRequest.status !== "pending_payment") {
      return NextResponse.json(
        { error: "Purchase request is not pending payment" },
        { status: 400 }
      );
    }

    // Update purchase request with payment details
    await db.collection("purchaseRequests").updateOne(
      { _id: new ObjectId(purchaseRequestId) },
      {
        $set: {
          status: "pending",
          phoneNumber,
          transactionMessage,
          paymentSubmittedAt: new Date(),
        },
      }
    );

    // Create admin notification
    await db.collection("adminNotifications").insertOne({
      type: "package_payment",
      title: "Package Payment Confirmation",
      message: `${user.fullName} (@${user.username}) has submitted payment confirmation for ${purchaseRequest.packageName} - Ksh${purchaseRequest.amount}`,
      userId: user._id,
      purchaseRequestId: new ObjectId(purchaseRequestId),
      isRead: false,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message:
        "Payment confirmation submitted successfully. Admin will verify and activate your package.",
    });
  } catch (error) {
    console.error("Confirm package payment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

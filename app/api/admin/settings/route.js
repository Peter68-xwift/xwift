// app/api/admin/settings/route.js (or .ts)
import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";

const DB_NAME = "mern_auth_app"; // Update if needed
const COLLECTION_NAME = "platformSettings";

export async function PUT(req) {
  try {
    const body = await req.json();

    // ✅ Exclude _id if it exists
    const { _id, ...safeBody } = body;

    const client = await clientPromise;
    const db = client.db("mern_auth_app");
    const settings = db.collection("platformSettings");

    await settings.updateOne(
      { key: "general" },
      { $set: { ...safeBody } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Settings Save Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const settings = db.collection(COLLECTION_NAME);

    const settingsDoc = await settings.findOne({ key: "general" });

    return NextResponse.json({
      success: true,
      settings: settingsDoc || {},
    });
  } catch (error) {
    console.error("Fetch Settings Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

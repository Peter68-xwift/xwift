import { NextResponse } from "next/server";
import { PackageModel } from "../../../../lib/database";

// GET - Fetch all packages
export async function GET() {
  try {
    const packages = await PackageModel.getAllPackages();

    return NextResponse.json({
      success: true,
      packages: packages,
      total: packages.length,
    });
  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}

// POST - Create new package
export async function POST(request) {
  try {
    const body = await request.json();

    // Validate required fields
    const { name, price, duration, roi, description, features } = body;

    if (!name || !price || !duration || !roi || !description) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate data types
    if (isNaN(price) || isNaN(duration) || isNaN(roi)) {
      return NextResponse.json(
        {
          success: false,
          message: "Price, duration, and ROI must be valid numbers",
        },
        { status: 400 }
      );
    }

    // Process features (convert string to array if needed)
    let featuresArray = features;
    if (typeof features === "string") {
      featuresArray = features
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f.length > 0);
    }

    const packageData = {
      name: name.trim(),
      price: Number.parseFloat(price),
      duration: Number.parseInt(duration),
      roi: Number.parseFloat(roi),
      description: description.trim(),
      features: featuresArray || [],
      status: "active",
    };

    const newPackage = await PackageModel.createPackage(packageData);

    return NextResponse.json({
      success: true,
      message: "Package created successfully",
      package: newPackage,
    });
  } catch (error) {
    console.error("Error creating package:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create package" },
      { status: 500 }
    );
  }
}

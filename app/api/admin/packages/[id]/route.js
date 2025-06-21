import { NextResponse } from "next/server";
import { PackageModel } from "../../../../../lib/database";
import { ObjectId } from "mongodb";

// GET - Fetch single package
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid package ID" },
        { status: 400 }
      );
    }

    const packageData = await PackageModel.getPackageById(id);

    if (!packageData) {
      return NextResponse.json(
        { success: false, message: "Package not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      package: packageData,
    });
  } catch (error) {
    console.error("Error fetching package:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch package" },
      { status: 500 }
    );
  }
}

// PATCH - Update package
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid package ID" },
        { status: 400 }
      );
    }

    // Process features if it's a string
    if (body.features && typeof body.features === "string") {
      body.features = body.features
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f.length > 0);
    }

    // Validate numeric fields if they exist
    if (body.price && isNaN(body.price)) {
      return NextResponse.json(
        { success: false, message: "Price must be a valid number" },
        { status: 400 }
      );
    }

    if (body.duration && isNaN(body.duration)) {
      return NextResponse.json(
        { success: false, message: "Duration must be a valid number" },
        { status: 400 }
      );
    }

    if (body.roi && isNaN(body.roi)) {
      return NextResponse.json(
        { success: false, message: "ROI must be a valid number" },
        { status: 400 }
      );
    }

    // Convert numeric fields
    if (body.price) body.price = Number.parseFloat(body.price);
    if (body.duration) body.duration = Number.parseInt(body.duration);
    if (body.roi) body.roi = Number.parseFloat(body.roi);

    const result = await PackageModel.updatePackage(id, body);

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Package not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Package updated successfully",
    });
  } catch (error) {
    console.error("Error updating package:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update package" },
      { status: 500 }
    );
  }
}

// DELETE - Delete package
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid package ID" },
        { status: 400 }
      );
    }

    const result = await PackageModel.deletePackage(id);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Package not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Package deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting package:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete package" },
      { status: 500 }
    );
  }
}

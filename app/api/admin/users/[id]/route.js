import { NextResponse } from "next/server";
import { UserModel } from "../../../../../lib/database";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID",
        },
        { status: 400 }
      );
    }

    const user = await UserModel.findUserById(id);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Remove password from response
    const { password, ...userResponse } = user;
    return NextResponse.json({
      success: true,
      data: userResponse,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const updateData = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID",
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await UserModel.findUserById(id);
    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Handle wallet balance updates
    if (updateData.walletBalance !== undefined) {
      const balanceDifference =
        updateData.walletBalance - (existingUser.wallet?.balance || 0);
      updateData.wallet = {
        ...existingUser.wallet,
        balance: updateData.walletBalance,
        availableBalance:
          (existingUser.wallet?.availableBalance || 0) + balanceDifference,
      };
      delete updateData.walletBalance;
    }

    // Handle profile updates
    if (updateData.profile) {
      updateData.profile = {
        ...existingUser.profile,
        ...updateData.profile,
      };
    }

    // Handle stats updates
    if (updateData.stats) {
      updateData.stats = {
        ...existingUser.stats,
        ...updateData.stats,
      };
    }

    // Update user
    const result = await UserModel.updateUser(id, updateData);

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Fetch updated user
    const updatedUser = await UserModel.findUserById(id);
    const { password, ...userResponse } = updatedUser;

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: userResponse,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID",
        },
        { status: 400 }
      );
    }

    const result = await UserModel.deleteUser(id);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete user",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

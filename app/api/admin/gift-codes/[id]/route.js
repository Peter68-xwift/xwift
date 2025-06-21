import { GiftCodeModel } from "../../../../../lib/database";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const giftCode = await GiftCodeModel.getGiftCodeById(id);

    if (!giftCode) {
      return Response.json(
        { success: false, message: "Gift code not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      giftCode,
    });
  } catch (error) {
    console.error("Error fetching gift code:", error);
    return Response.json(
      { success: false, message: "Failed to fetch gift code" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const updates = await request.json();

    const updatedGiftCode = await GiftCodeModel.updateGiftCode(id, updates);

    if (!updatedGiftCode) {
      return Response.json(
        { success: false, message: "Gift code not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Gift code updated successfully",
      giftCode: updatedGiftCode,
    });
  } catch (error) {
    console.error("Error updating gift code:", error);
    return Response.json(
      { success: false, message: "Failed to update gift code" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const deleted = await GiftCodeModel.deleteGiftCode(id);

    if (!deleted) {
      return Response.json(
        { success: false, message: "Gift code not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Gift code deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting gift code:", error);
    return Response.json(
      { success: false, message: "Failed to delete gift code" },
      { status: 500 }
    );
  }
}

import { GiftCodeModel } from "../../../../lib/database";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page")) || 1;
    const limit = Number.parseInt(searchParams.get("limit")) || 50;

    // Get all gift codes with pagination
    const result = await GiftCodeModel.getAllGiftCodes(page, limit);

    // Calculate statistics
    const stats = await GiftCodeModel.getGiftCodeStats();

    return Response.json({
      success: true,
      giftCodes: result.codes,
      stats,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching gift codes:", error);
    return Response.json(
      { success: false, message: "Failed to fetch gift codes" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const {
      amount,
      description,
      quantity = 1,
      expiresAt,
    } = await request.json();

    // Validation
    if (!amount || amount <= 0) {
      return Response.json(
        { success: false, message: "Valid amount is required" },
        { status: 400 }
      );
    }

    if (quantity < 1 || quantity > 100) {
      return Response.json(
        { success: false, message: "Quantity must be between 1 and 100" },
        { status: 400 }
      );
    }

    // Generate multiple gift codes
    const codes = [];
    const createdCodes = [];

    for (let i = 0; i < quantity; i++) {
      try {
        const giftCode = await GiftCodeModel.createGiftCode({
          amount: Number.parseFloat(amount),
          description: description || `Gift code worth $${amount}`,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          createdBy: null, // TODO: Add admin user ID when auth is implemented
        });

        codes.push(giftCode);
        createdCodes.push({
          code: giftCode.code,
          amount: giftCode.amount,
          description: giftCode.description,
        });
      } catch (error) {
        console.error(`Error creating gift code ${i + 1}:`, error);
        // Continue with other codes even if one fails
      }
    }

    if (codes.length === 0) {
      return Response.json(
        { success: false, message: "Failed to create any gift codes" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: `Successfully created ${codes.length} gift code(s)`,
      codes: createdCodes,
      generatedCodes: codes.map((code) => code.code), // Return just the codes for easy copying
    });
  } catch (error) {
    console.error("Error creating gift codes:", error);
    return Response.json(
      { success: false, message: "Failed to create gift codes" },
      { status: 500 }
    );
  }
}

import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import InventoryItem from "@/models/InventoryItem";
import Profile from "@/models/Profile";
import mongoose from "mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Request method:", req.method);
  console.log("Request query:", req.query);
  console.log("Request body:", req.body);

  const { itemId } = req.query;

  if (req.method !== "PUT") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
      message: "Only PUT requests are allowed",
    });
  }

  if (!itemId || typeof itemId !== "string") {
    return res.status(400).json({
      success: false,
      error: "Invalid Item ID",
      message: "A valid item ID is required",
    });
  }

  try {
    // Ensure database connection
    await dbConnect();

    // Find the inventory item with populated item details
    const inventoryItem = await InventoryItem.findById(itemId)
      .populate({
        path: "item",
        select: "category title", // Explicitly select needed fields
      })
      .exec();

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        error: "Item not found",
        message: `No inventory item found with ID ${itemId}`,
      });
    }

    // Type-safe type guard for populated item
    if (!inventoryItem.item || typeof inventoryItem.item === "string") {
      return res.status(404).json({
        success: false,
        error: "Item details not found",
        message: "Inventory item is missing item details",
      });
    }

    // Find the profile containing this inventory item
    const profile = await Profile.findOne({
      inventory: { $elemMatch: { $eq: inventoryItem._id } },
    }).exec();

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: "Profile not found",
        message: "No profile contains this inventory item",
      });
    }

    // Type-safe item usage logic
    const itemCategory = inventoryItem.item.category;

    switch (itemCategory) {
      case "exp_boost":
        profile.exp += 10;
        break;
      case "gold_boost":
        profile.gold += 50;
        break;
      default:
        console.warn(
          `No specific usage defined for item category: ${itemCategory}`
        );
    }

    // Reduce item quantity or remove item completely
    if (inventoryItem.quantity > 1) {
      inventoryItem.quantity -= 1;
      await inventoryItem.save();
    } else {
      // Remove the item from inventory
      await InventoryItem.findByIdAndDelete(inventoryItem._id);

      // Remove from profile's inventory
      profile.inventory = profile.inventory.filter(
        (inv: mongoose.Types.ObjectId) =>
          inv.toString() !== inventoryItem._id.toString()
      );
    }

    // Save updated profile
    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Item used successfully",
      data: {
        profileExp: profile.exp,
        profileGold: profile.gold,
        remainingQuantity: inventoryItem.quantity,
      },
    });
  } catch (error) {
    console.error("Error in item use handler:", error);
    return res.status(500).json({
      success: false,
      error: "Server error",
      message: error instanceof Error ? error.message : "Unknown server error",
    });
  }
}

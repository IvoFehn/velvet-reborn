// pages/api/shop/buy.ts
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Profile from "../../../models/Profile";
import Item, { IItem } from "../../../models/Item";
import InventoryItem, { IInventoryItem } from "@/models/InventoryItem";
import mongoose from "mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Methode nicht erlaubt" });
  }

  const { itemId } = req.body;

  if (!itemId || typeof itemId !== "string") {
    return res.status(400).json({ success: false, error: "Ungültige Item-ID" });
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    // Finde das erste Profil innerhalb der Transaktion
    const profile = await Profile.findOne({})
      .session(session)
      .populate({
        path: "inventory",
        populate: {
          path: "item",
          model: "Item",
        },
      });

    if (!profile) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, error: "Profil nicht gefunden" });
    }

    // Finde das Item
    const item = await Item.findById(itemId).session(session);
    if (!item) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, error: "Item nicht gefunden" });
    }

    // Überprüfe, ob das Profil genügend Gold hat
    if (profile.gold < item.price) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, error: "Nicht genügend Gold" });
    }

    // Überprüfe, ob das Item bereits im Inventar vorhanden ist
    const inventoryItem = profile.inventory.find((invItem: IInventoryItem) => {
      // Wenn invItem.item ein befülltes Dokument ist:
      if (
        typeof invItem.item === "object" &&
        invItem.item !== null &&
        "_id" in invItem.item
      ) {
        // Casten des _id-Feldes auf mongoose.Types.ObjectId
        const invItemDoc = invItem.item as IItem & {
          _id: mongoose.Types.ObjectId;
        };
        return invItemDoc._id.toString() === itemId;
      }
      // Ansonsten handelt es sich um eine reine ObjectId
      return invItem.item.toString() === itemId;
    });

    if (inventoryItem) {
      inventoryItem.quantity += 1;
      await inventoryItem.save({ session });
    } else {
      const newInventoryItem = new InventoryItem({
        item: itemId,
        quantity: 1,
      });
      await newInventoryItem.save({ session });
      profile.inventory.push(newInventoryItem._id);
    }

    // Aktualisiere das Gold des Profils
    profile.gold -= item.price;

    // Speichere das Profil
    await profile.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Populiere das Inventar erneut, um die aktuellen Daten zu erhalten
    const updatedProfile = await Profile.findOne({})
      .populate({
        path: "inventory",
        populate: {
          path: "item",
          model: "Item",
        },
      })
      .lean();

    return res.status(200).json({ success: true, data: updatedProfile });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Serverfehler" });
  }
}

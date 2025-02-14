/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/profile/[itemId]
import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect"; // Stelle sicher, dass dbConnect korrekt importiert ist
import InventoryItem, { IInventoryItem } from "@/models/InventoryItem";
import Profile, { IProfile } from "@/models/Profile";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { itemId } = req.query;

  console.log("Use-Handler aufgerufen mit itemId:", itemId);

  // Überprüfen, ob die Methode PUT ist
  if (req.method !== "PUT") {
    console.log("Ungültige Methode:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!itemId || typeof itemId !== "string") {
    console.log("Ungültige itemId:", itemId);
    return res.status(400).json({ error: "Ungültige Item-ID" });
  }

  try {
    // Stelle sicher, dass die Verbindung zur Datenbank besteht
    await dbConnect();

    // Finde das InventoryItem
    const inventoryItem = await InventoryItem.findById<IInventoryItem>(itemId)
      .populate("item")
      .exec();
    if (!inventoryItem) {
      console.log("InventoryItem nicht gefunden:", itemId);
      return res.status(404).json({ error: "Item nicht gefunden" });
    }

    console.log("Gefundenes InventoryItem:", inventoryItem);

    // Finde das Profil, das dieses InventoryItem enthält
    const profile = await Profile.findOne<IProfile>({
      inventory: inventoryItem._id,
    }).exec();

    if (!profile) {
      console.log(
        "Profil nicht gefunden für InventoryItem:",
        inventoryItem._id
      );
      return res.status(404).json({ error: "Profil nicht gefunden" });
    }

    // Optional: Logik zum Verwenden des Items hinzufügen
    // Beispiel: Erfahrungspunkte erhöhen, wenn das Item eine bestimmte Kategorie hat
    if (
      inventoryItem.item &&
      (inventoryItem.item as any).category === "exp_boost"
    ) {
      profile.exp += 10; // Beispielwert, anpassen nach Bedarf
      console.log("Exp nach Verwendung:", profile.exp);
    }

    // Verringere die Menge des Items
    if (inventoryItem.quantity > 1) {
      inventoryItem.quantity -= 1;
      await inventoryItem.save();
      console.log(
        `Menge des Items ${inventoryItem._id} auf ${inventoryItem.quantity} reduziert`
      );
    } else {
      await InventoryItem.findByIdAndDelete(itemId).exec();

      // Entferne das InventoryItem aus dem Profil-Inventar.
      // Erstelle zuerst die Ziel-ID als String:
      const targetId = (
        inventoryItem._id as mongoose.Types.ObjectId
      ).toString();

      if (profile.inventory.length > 0) {
        // Unterscheide, ob das Inventar aus ObjectIds oder befüllten Items besteht
        if (profile.inventory[0] instanceof mongoose.Types.ObjectId) {
          profile.inventory = (
            profile.inventory as unknown as mongoose.Types.ObjectId[]
          ).filter(
            (inv: mongoose.Types.ObjectId) => inv.toString() !== targetId
          ) as unknown as typeof profile.inventory;
        } else {
          profile.inventory = (profile.inventory as IInventoryItem[]).filter(
            (inv: IInventoryItem) =>
              (inv._id as mongoose.Types.ObjectId).toString() !== targetId
          ) as unknown as typeof profile.inventory;
        }
      }
      await profile.save();
      console.log(`InventoryItem ${itemId} gelöscht und aus Profil entfernt`);
    }

    // Speichere das Profil (falls Exp erhöht wurde)
    await profile.save();

    console.log("Item erfolgreich verwendet");

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Fehler im Use-Handler:", error);
    return res.status(500).json({ error: "Serverfehler" });
  }
}

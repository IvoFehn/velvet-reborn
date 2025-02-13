/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/dbConnect";
import Profile from "../../../models/Profile";
import CoinBook from "../../../models/CoinBook";
import CoinItem from "../../../models/CoinItem";
import Lootbox from "../../../models/Lootbox";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ success: false, message: "Methode nicht erlaubt" });
  }

  try {
    // Erwarte im Body: { modifier: string, newCoinItem: string, lootboxId: string }
    const { newCoinItem, lootboxId } = req.body;

    // Hole das Benutzerprofil und populate die verschachtelten Lootbox-Daten,
    // damit entry.lootbox als Objekt vorliegt (mit _id und type).
    const profile = await Profile.findOne({}).populate({
      path: "lootboxes.lootbox",
      model: Lootbox.modelName,
    });
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Profil nicht gefunden" });
    }

    // --- Verbrauch von Key & Lootbox ---

    // Reduziere den Keys-Zähler
    if (profile.keys === undefined || profile.keys <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Keine Keys verfügbar" });
    }
    profile.keys = profile.keys - 1;

    // Prüfe anhand der übergebenen Lootbox-ID, ob diese im Profil vorhanden ist
    if (lootboxId) {
      const lbIndex = profile.lootboxes.findIndex(
        (entry: any) =>
          entry.lootbox &&
          entry.lootbox._id &&
          entry.lootbox._id.toString() === lootboxId
      );
      if (lbIndex < 0) {
        return res.status(400).json({
          success: false,
          message: "Keine passende Lootbox vorhanden",
        });
      }
      // Reduziere die Menge oder entferne den Eintrag, wenn nur noch eine vorhanden ist
      if (
        profile.lootboxes[lbIndex].quantity &&
        profile.lootboxes[lbIndex].quantity > 1
      ) {
        profile.lootboxes[lbIndex].quantity -= 1;
      } else {
        profile.lootboxes.splice(lbIndex, 1);
      }
    }

    // Speichere das aktualisierte Profil
    await profile.save();

    // --- Update des CoinBooks ---

    if (newCoinItem) {
      let coinBook = await CoinBook.findOne({ user: profile._id });
      if (!coinBook) {
        coinBook = new CoinBook({ user: profile._id, entries: [] });
      }
      // Hole das CoinItem, um die benötigte Menge (neededAmount) zu prüfen
      const coinItemDoc = await CoinItem.findById(newCoinItem);
      if (!coinItemDoc) {
        return res
          .status(404)
          .json({ success: false, message: "CoinItem nicht gefunden" });
      }
      // Finde einen vorhandenen Eintrag im CoinBook
      const entryIndex = coinBook.entries.findIndex(
        (entry: any) => entry.coinItem.toString() === newCoinItem
      );
      if (entryIndex >= 0) {
        // Erhöhe den Eintrag nur, wenn die benötigte Menge noch nicht erreicht wurde
        if (coinBook.entries[entryIndex].quantity < coinItemDoc.neededAmount) {
          coinBook.entries[entryIndex].quantity += 1;
        }
      } else {
        coinBook.entries.push({ coinItem: newCoinItem, quantity: 1 });
      }
      await coinBook.save();
    }

    return res.status(200).json({
      success: true,
      message: "Spin erfolgreich und alle Updates durchgeführt",
      profile,
    });
  } catch (error: any) {
    console.error("Spin-API Fehler:", error);
    return res.status(500).json({
      success: false,
      message: "Serverfehler",
      error: error.message,
    });
  }
}

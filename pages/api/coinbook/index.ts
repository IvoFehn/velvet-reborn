/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/coinbook/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import CoinBook from "@/models/CoinBook";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  switch (req.method) {
    case "GET": {
      // Erwartet: ?user=<userID>
      const { user } = req.query;
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "User ID is required" });
      }
      try {
        let coinBook = await CoinBook.findOne({ user })
          .populate("entries.coinItem")
          .lean();
        // Falls kein CoinBook vorhanden, neues anlegen
        if (!coinBook) {
          coinBook = await new CoinBook({ user, entries: [] }).save();
          coinBook = await CoinBook.findOne({ user })
            .populate("entries.coinItem")
            .lean();
        }
        return res.status(200).json({ success: true, coinBook });
      } catch (error: any) {
        return res.status(500).json({
          success: false,
          message: "Server error",
          error: error.message,
        });
      }
    }

    case "POST": {
      // Erwarteter Body: { user: string, coinItem: string, quantity: number }
      const { user, coinItem, quantity } = req.body;
      if (!user || !coinItem || quantity == null) {
        return res.status(400).json({
          success: false,
          message: "User, coinItem and quantity are required",
        });
      }
      try {
        let coinBook = await CoinBook.findOne({ user });
        if (!coinBook) {
          coinBook = new CoinBook({ user, entries: [] });
        }
        const entryIndex = coinBook.entries.findIndex(
          (entry: any) => entry.coinItem.toString() === coinItem
        );
        if (entryIndex >= 0) {
          // Erhöhe die vorhandene Menge (Validator im Modell prüft, dass neededAmount nicht überschritten wird)
          coinBook.entries[entryIndex].quantity += quantity;
        } else {
          coinBook.entries.push({ coinItem, quantity });
        }
        await coinBook.save();
        return res.status(200).json({ success: true, coinBook });
      } catch (error: any) {
        return res.status(500).json({
          success: false,
          message: "Server error",
          error: error.message,
        });
      }
    }

    case "DELETE": {
      // Erwarteter Body: { user: string, coinItem: string, quantity?: number }
      // Wenn quantity angegeben ist und kleiner als der vorhandene Wert, wird die Menge reduziert.
      // Andernfalls wird der Eintrag komplett entfernt.
      const { user, coinItem, quantity } = req.body;
      if (!user || !coinItem) {
        return res.status(400).json({
          success: false,
          message: "User and coinItem are required",
        });
      }
      try {
        const coinBook = await CoinBook.findOne({ user });
        if (!coinBook) {
          return res
            .status(404)
            .json({ success: false, message: "CoinBook not found" });
        }
        const entryIndex = coinBook.entries.findIndex(
          (entry: any) => entry.coinItem.toString() === coinItem
        );
        if (entryIndex < 0) {
          return res
            .status(404)
            .json({ success: false, message: "Entry not found" });
        }
        if (
          quantity == null ||
          coinBook.entries[entryIndex].quantity <= quantity
        ) {
          // Entferne den Eintrag, wenn keine Quantity angegeben oder wenn die zu löschende Menge >= vorhandener Menge ist
          coinBook.entries.splice(entryIndex, 1);
        } else {
          // Reduziere die vorhandene Menge
          coinBook.entries[entryIndex].quantity -= quantity;
        }
        await coinBook.save();
        return res.status(200).json({ success: true, coinBook });
      } catch (error: any) {
        return res.status(500).json({
          success: false,
          message: "Server error",
          error: error.message,
        });
      }
    }

    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      return res
        .status(405)
        .json({ success: false, message: "Method not allowed" });
  }
}

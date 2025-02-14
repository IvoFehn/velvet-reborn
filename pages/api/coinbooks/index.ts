/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/coinbook/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import CoinBook from "@/models/CoinBook";
import Profile from "@/models/Profile"; // Annahme: Es gibt ein Profile-Modell

// Typisierung des Profil-Dokuments
interface IProfile {
  _id: string;
  // weitere Felder falls benötigt
}

// Hilfsfunktion: Falls das Ergebnis ein Array ist, nehmen wir das erste Element.
const normalizeDoc = <T>(doc: T | T[] | null): T | null => {
  if (!doc) return null;
  return Array.isArray(doc) ? doc[0] : doc;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  switch (req.method) {
    case "GET": {
      try {
        // Beim GET kann .lean() verwendet werden, da wir nur lesen
        let coinBook = normalizeDoc(
          await CoinBook.findOne({}).populate("entries.coinItem").lean()
        );

        // Falls kein CoinBook existiert, versuche das erste Profil zu finden und erstelle ein CoinBook
        if (!coinBook) {
          const profile = normalizeDoc(
            await Profile.findOne({}).lean()
          ) as IProfile | null;
          if (!profile || !profile._id) {
            return res.status(404).json({
              success: false,
              message: "Kein Profil gefunden, um ein CoinBook zu erstellen.",
            });
          }
          const newCoinBook = new CoinBook({
            user: profile._id,
            entries: [],
          });
          await newCoinBook.save();

          coinBook = normalizeDoc(
            await CoinBook.findOne({}).populate("entries.coinItem").lean()
          );
          if (!coinBook) {
            return res.status(500).json({
              success: false,
              message: "Fehler beim Laden des CoinBook nach Erstellung",
            });
          }
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
      // Erwarteter Body: { coinItem: string, quantity: number }
      const { coinItem, quantity } = req.body;
      if (!coinItem || quantity == null) {
        return res.status(400).json({
          success: false,
          message: "coinItem and quantity are required",
        });
      }
      try {
        // Ohne .lean(), um das Dokument bearbeiten zu können
        let coinBook = normalizeDoc(
          await CoinBook.findOne({}).populate("entries.coinItem")
        );
        if (!coinBook) {
          const profile = normalizeDoc(
            await Profile.findOne({}).lean()
          ) as IProfile | null;
          if (!profile || !profile._id) {
            return res.status(404).json({
              success: false,
              message: "Kein Profil gefunden, um ein CoinBook zu erstellen.",
            });
          }
          coinBook = new CoinBook({ user: profile._id, entries: [] });
        }

        if (!coinBook) {
          return res
            .status(500)
            .json({ success: false, message: "Kein coinBook gefunden" });
        }

        const entryIndex = coinBook.entries.findIndex((entry: any) => {
          // Wenn coinItem populiert ist, dann als String über die _id vergleichen
          if (typeof entry.coinItem === "object" && entry.coinItem._id) {
            return entry.coinItem._id.toString() === coinItem;
          }
          return entry.coinItem.toString() === coinItem;
        });

        if (entryIndex >= 0) {
          coinBook.entries[entryIndex].quantity += quantity;
        } else {
          coinBook.entries.push({ coinItem, quantity });
        }
        await coinBook.save();

        // Nach dem Speichern erneut laden
        coinBook = normalizeDoc(
          await CoinBook.findOne({}).populate("entries.coinItem").lean()
        );
        if (!coinBook) {
          return res.status(500).json({
            success: false,
            message: "Fehler beim Aktualisieren des CoinBook",
          });
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

    case "DELETE": {
      // Erwarteter Body: { coinItem: string, quantity?: number }
      const { coinItem, quantity } = req.body;
      if (!coinItem) {
        return res.status(400).json({
          success: false,
          message: "coinItem is required",
        });
      }
      try {
        // Ohne .lean(), um das Dokument bearbeiten zu können
        let coinBook = normalizeDoc(
          await CoinBook.findOne({}).populate("entries.coinItem")
        );
        if (!coinBook) {
          return res
            .status(404)
            .json({ success: false, message: "CoinBook not found" });
        }

        const entryIndex = coinBook.entries.findIndex((entry: any) => {
          if (typeof entry.coinItem === "object" && entry.coinItem._id) {
            return entry.coinItem._id.toString() === coinItem;
          }
          return entry.coinItem.toString() === coinItem;
        });

        if (entryIndex < 0) {
          return res
            .status(404)
            .json({ success: false, message: "Entry not found" });
        }
        // Wenn keine Menge angegeben wurde oder die zu löschende Menge größer gleich der vorhandenen Menge ist,
        // entferne den Eintrag komplett, ansonsten ziehe die Menge ab.
        if (
          quantity == null ||
          coinBook.entries[entryIndex].quantity <= quantity
        ) {
          coinBook.entries.splice(entryIndex, 1);
        } else {
          coinBook.entries[entryIndex].quantity -= quantity;
        }
        await coinBook.save();

        coinBook = normalizeDoc(
          await CoinBook.findOne({}).populate("entries.coinItem").lean()
        );
        if (!coinBook) {
          return res.status(500).json({
            success: false,
            message: "Fehler beim Aktualisieren des CoinBook",
          });
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

    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      return res
        .status(405)
        .json({ success: false, message: "Method not allowed" });
  }
}

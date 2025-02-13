/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/lootbox/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Lootbox, { LootboxType } from "../../../models/Lootbox";
import dbConnect from "@/lib/dbConnect";

interface Data {
  success: boolean;
  lootbox?: any;
  lootboxes?: any;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await dbConnect();

  switch (req.method) {
    case "GET": {
      try {
        // Wenn im Query-Parameter eine ID enthalten ist, wird diese spezifische Lootbox zurückgegeben.
        const { id } = req.query;
        if (id) {
          // Falls id als Array kommt (z. B. ?id=1&id=2) nehmen wir den ersten Eintrag
          const lootboxId = Array.isArray(id) ? id[0] : id;
          const lootbox = await Lootbox.findById(lootboxId);
          if (!lootbox) {
            return res
              .status(404)
              .json({ success: false, message: "Lootbox nicht gefunden" });
          }
          return res.status(200).json({ success: true, lootbox });
        } else {
          // Ohne ID: Alle Lootboxen zurückgeben
          const lootboxes = await Lootbox.find();
          return res.status(200).json({ success: true, lootboxes });
        }
      } catch (error) {
        console.error("GET Error:", error);
        return res
          .status(500)
          .json({ success: false, message: "Interner Serverfehler" });
      }
    }

    case "POST": {
      try {
        // Erwartete Felder im Request-Body: type und img
        const { type, img } = req.body;

        // Validierung: Prüfe, ob der Lootbox-Type gültig ist
        const validTypes: LootboxType[] = [
          "Normal",
          "Event",
          "Premium Lootbox",
          "Rare Lootbox",
          "Legendary Lootbox",
        ];
        if (!validTypes.includes(type)) {
          return res.status(400).json({
            success: false,
            message:
              "Ungültiger Lootbox-Typ. Erlaubt sind: " + validTypes.join(", "),
          });
        }
        if (!img) {
          return res.status(400).json({
            success: false,
            message: "Das img-Feld ist erforderlich.",
          });
        }

        // Erstelle die Lootbox
        const lootbox = await Lootbox.create({ type, img });
        return res.status(201).json({ success: true, lootbox });
      } catch (error) {
        console.error("POST Error:", error);
        return res
          .status(500)
          .json({ success: false, message: "Interner Serverfehler" });
      }
    }

    case "PUT": {
      try {
        // Für ein Update muss die Lootbox-ID als Query-Parameter übergeben werden
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({
            success: false,
            message: "Lootbox-ID fehlt im Query-Parameter",
          });
        }
        const lootboxId = Array.isArray(id) ? id[0] : id;

        // Felder, die aktualisiert werden sollen, kommen im Body (z. B. type, img)
        const { type, img } = req.body;
        const updateData: Partial<{ type: LootboxType; img: string }> = {};

        if (type) {
          // Validierung des Typs
          const validTypes: LootboxType[] = [
            "Normal",
            "Event",
            "Premium Lootbox",
            "Rare Lootbox",
            "Legendary Lootbox",
          ];
          if (!validTypes.includes(type)) {
            return res.status(400).json({
              success: false,
              message:
                "Ungültiger Lootbox-Typ. Erlaubt sind: " +
                validTypes.join(", "),
            });
          }
          updateData.type = type;
        }

        if (img) {
          updateData.img = img;
        }

        // Update durchführen
        const updatedLootbox = await Lootbox.findByIdAndUpdate(
          lootboxId,
          updateData,
          { new: true }
        );
        if (!updatedLootbox) {
          return res
            .status(404)
            .json({ success: false, message: "Lootbox nicht gefunden" });
        }
        return res.status(200).json({ success: true, lootbox: updatedLootbox });
      } catch (error) {
        console.error("PUT Error:", error);
        return res
          .status(500)
          .json({ success: false, message: "Interner Serverfehler" });
      }
    }

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT"]);
      return res
        .status(405)
        .json({ success: false, message: "Methode nicht erlaubt" });
  }
}

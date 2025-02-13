import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import CoinItem, { ICoinItem, RarityType } from "@/models/CoinItem";

interface Data {
  success: boolean;
  coinItems?: ICoinItem[];
  coinItem?: ICoinItem;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await dbConnect();

  switch (req.method) {
    case "GET":
      try {
        const coinItems = await CoinItem.find();
        return res.status(200).json({ success: true, coinItems });
      } catch (error) {
        console.error("GET Error:", error);
        return res
          .status(500)
          .json({ success: false, message: "Fehler beim Laden der CoinItems" });
      }

    case "POST":
      try {
        const { name, description, color, rarity, neededAmount } = req.body;

        if (
          !name ||
          !description ||
          !color ||
          !rarity ||
          neededAmount == null
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Bitte alle Felder angeben: name, description, color, rarity und neededAmount.",
          });
        }

        const validRarities: RarityType[] = [
          "Common",
          "Uncommon",
          "Rare",
          "Epic",
          "Legendary",
        ];
        if (!validRarities.includes(rarity)) {
          return res.status(400).json({
            success: false,
            message:
              "Ungültige rarity. Erlaubt sind: " + validRarities.join(", "),
          });
        }

        const coinItem = await CoinItem.create({
          name,
          description,
          color,
          rarity,
          neededAmount,
        });

        return res.status(201).json({ success: true, coinItem });
      } catch (error) {
        console.error("POST Error:", error);
        return res.status(500).json({
          success: false,
          message: "Fehler beim Erstellen des CoinItems",
        });
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res
        .status(405)
        .json({ success: false, message: "Methode nicht erlaubt" });
  }
}

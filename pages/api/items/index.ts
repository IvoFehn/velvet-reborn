// pages/api/items/index.ts (erweitert)
import Item from "@/models/Item";
import dbConnect from "@/lib/dbConnect";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const { category } = req.query;

      // Filterobjekt erstellen
      const filter = category ? { category } : {};

      const items = await Item.find(filter);
      res.status(200).json(items);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

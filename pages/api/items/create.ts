// pages/api/items/create.ts
import Item from "@/models/Item";
import dbConnect from "@/lib/dbConnect";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  if (req.method === "POST") {
    try {
      const { title, description, img, price, category } = req.body;

      // Validiere die Eingabedaten
      if (!title || !description || !img || !price || !category) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Erstelle ein neues Item
      const newItem = new Item({
        title,
        description,
        img,
        price: Number(price),
        category,
      });

      await newItem.save();

      res.status(201).json(newItem);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

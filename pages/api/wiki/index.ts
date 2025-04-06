// pages/api/wiki/index.js
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import WikiPage from "../../../models/WikiPage";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  try {
    if (req.method === "GET") {
      // Alle Wiki-Seiten abrufen
      const wikiPages = await WikiPage.find({}).sort({ title: 1 });
      return res.status(200).json(wikiPages);
    } else if (req.method === "POST") {
      // Neue Wiki-Seite erstellen
      const { id, title, content, author } = req.body;

      // Prüfen, ob die Seite bereits existiert
      const existingPage = await WikiPage.findOne({ id });

      if (existingPage) {
        // Seite aktualisieren
        existingPage.title = title;
        existingPage.content = content;
        existingPage.lastModified = new Date();
        existingPage.author = author;

        await existingPage.save();
        return res
          .status(200)
          .json({ success: true, message: "Seite aktualisiert" });
      } else {
        // Neue Seite erstellen
        const newPage = new WikiPage({
          id,
          title,
          content,
          lastModified: new Date(),
          author,
        });

        await newPage.save();
        return res
          .status(201)
          .json({ success: true, message: "Seite erstellt" });
      }
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("API-Fehler:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return res
      .status(500)
      .json({ error: "Internal server error", message: errorMessage });
  }
}

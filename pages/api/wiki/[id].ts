// pages/api/wiki/[id].js
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import WikiPage from "../../../models/WikiPage";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  await dbConnect();

  try {
    if (req.method === "GET") {
      // Einzelne Wiki-Seite abrufen
      const page = await WikiPage.findOne({ id });

      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }

      return res.status(200).json(page);
    } else if (req.method === "PUT") {
      // Wiki-Seite aktualisieren
      const { title, content, author } = req.body;

      const page = await WikiPage.findOne({ id });

      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }

      page.title = title;
      page.content = content;
      page.lastModified = new Date();
      if (author) page.author = author;

      await page.save();
      return res
        .status(200)
        .json({ success: true, message: "Seite aktualisiert" });
    } else if (req.method === "DELETE") {
      // Wiki-Seite löschen
      const result = await WikiPage.deleteOne({ id });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Page not found" });
      }

      return res.status(200).json({ success: true, message: "Seite gelöscht" });
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

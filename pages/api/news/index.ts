/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/dbConnect";
import News, { INews, INewsInput } from "../../../models/News";

interface SuccessResponse<T = INews | INews[] | null> {
  success: true;
  data: T;
}

interface ErrorResponse {
  success: false;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  await dbConnect();

  switch (req.method) {
    case "GET": {
      try {
        const { id, type } = req.query;
        if (id) {
          const newsItem = await News.findById(id);
          if (!newsItem) {
            return res.status(404).json({
              success: false,
              message: "Kein News‑Eintrag mit dieser ID gefunden.",
            });
          }
          return res
            .status(200)
            .json({ success: true, data: newsItem.toObject() });
        } else {
          const filter: Record<string, any> = {};
          if (type) {
            filter.type = type;
          }
          const newsItems = await News.find(filter).sort({ createdAt: -1 });
          return res
            .status(200)
            .json({
              success: true,
              data: newsItems.map((item) => item.toObject()),
            });
        }
      } catch (error) {
        console.error("Fehler beim Abrufen der News:", error);
        return res.status(500).json({
          success: false,
          message: "Serverfehler beim Abrufen der News",
        });
      }
    }

    case "POST": {
      try {
        // Nutze hier das Interface INewsInput für die Eingabedaten
        const newsData = req.body as INewsInput;
        const newNews = new News(newsData);
        const savedNews = await newNews.save();
        return res
          .status(201)
          .json({ success: true, data: savedNews.toObject() });
      } catch (error) {
        console.error("Fehler beim Speichern der News:", error);
        return res.status(500).json({
          success: false,
          message: "Serverfehler beim Speichern der News",
        });
      }
    }

    case "PATCH": {
      try {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({
            success: false,
            message: "Fehlende ID im Query-Parameter",
          });
        }
        // Erwarte z. B. { seen: true } im Request-Body
        const updateData = req.body as Partial<INewsInput>;
        const updatedNews = await News.findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: true,
        });
        if (!updatedNews) {
          return res.status(404).json({
            success: false,
            message: "News‑Eintrag nicht gefunden",
          });
        }
        return res
          .status(200)
          .json({ success: true, data: updatedNews.toObject() });
      } catch (error) {
        console.error("Fehler beim Aktualisieren der News:", error);
        return res.status(500).json({
          success: false,
          message: "Serverfehler beim Aktualisieren der News",
        });
      }
    }

    default: {
      res.setHeader("Allow", ["GET", "POST", "PATCH"]);
      return res.status(405).json({
        success: false,
        message: `Methode ${req.method} ist nicht erlaubt`,
      });
    }
  }
}

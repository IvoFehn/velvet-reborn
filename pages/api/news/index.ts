/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/dbConnect";
import News, { INews, INewsInput } from "../../../models/News";
import Profile from "../../../models/Profile";

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
          // Mit .lean() erhalten wir ein plain object, das direkt serialisiert werden kann.
          const newsItem = await News.findById(id).lean();
          console.log(newsItem);
          if (!newsItem) {
            return res.status(404).json({
              success: false,
              message: "Kein News‑Eintrag mit dieser ID gefunden.",
            });
          }
          return res.status(200).json({ success: true, data: newsItem });
        } else {
          const filter: Record<string, any> = {};

          // Falls type existiert, trennen wir bei Komma getrennte Werte und nutzen $in:
          if (type) {
            if (typeof type === "string") {
              const types = type.split(",");
              // Wenn es mehr als einen Typ gibt, nutzen wir $in
              filter.type = types.length > 1 ? { $in: types } : type;
            } else if (Array.isArray(type)) {
              // Falls type als Array übergeben wurde, kombinieren wir alle Einträge und splitten
              const types = type.flatMap((t) => t.split(","));
              filter.type = { $in: types };
            }
          }

          console.log("Filter:", filter);
          // Auch hier nutzen wir .lean() für ein Array plain objects
          const newsItems = await News.find(filter)
            .sort({ createdAt: -1 })
            .lean();
          return res.status(200).json({ success: true, data: newsItems });
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

        // Falls es sich um einen "failed"-News-Eintrag handelt,
        // ziehen wir im Profil die entsprechenden Werte ab.
        if (newsData.type === "failed") {
          const goldDeduction = newsData.goldDeduction ?? 0;
          const expDeduction = newsData.expDeduction ?? 0;

          await Profile.findOneAndUpdate(
            {},
            {
              $inc: { gold: -goldDeduction, exp: -expDeduction },
              $set: { updatedAt: new Date() },
            },
            { new: true }
          );
        }

        // Auch hier wandeln wir das gespeicherte Dokument in ein plain object um.
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
        // Direkt nach der Aktualisierung als plain object zurückgeben
        const updatedNews = await News.findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: true,
        }).lean();
        if (!updatedNews) {
          return res.status(404).json({
            success: false,
            message: "News‑Eintrag nicht gefunden",
          });
        }
        return res.status(200).json({ success: true, data: updatedNews });
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

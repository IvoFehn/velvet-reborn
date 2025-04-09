/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Generator, { IGenerator } from "@/models/Generator";
import { sendTelegramMessage } from "@/util/sendTelegramMessage";
import dayjs from "dayjs";
import MoodOverride, { IMoodOverride } from "@/models/MoodOverride";

interface SuccessResponse<T = IGenerator | IGenerator[]> {
  success: true;
  data: T;
  moodOverride?: Partial<IMoodOverride>; // Optional für Mood-Überschreibung
}

interface ErrorResponse {
  success: false;
  message: string;
}

// Mongoose Lean Document Typ für MoodOverride
type LeanMoodOverride = {
  active: boolean;
  level: number;
  expiresAt: Date | null;
  _id: any;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  await dbConnect();

  switch (req.method) {
    case "GET":
      try {
        const { id, status, exclude_status, last } = req.query;

        // Falls der Query-Parameter "last" übergeben wird, wird der zuletzt erstellte Auftrag abgerufen
        if (last && last === "true") {
          const latestGenerator = await Generator.findOne()
            .sort({ createdAt: -1 })
            .lean();

          if (!latestGenerator) {
            return res.status(404).json({
              success: false,
              message: "Kein Generator gefunden.",
            });
          }

          // Aktuelle Mood-Überschreibung abrufen (falls vorhanden)
          const moodOverrideDoc = (await MoodOverride.findOne()
            .sort({ updatedAt: -1 })
            .lean()) as LeanMoodOverride | null;

          // Prüfen, ob die Überschreibung aktiv ist und nicht abgelaufen
          if (moodOverrideDoc && moodOverrideDoc.active) {
            // Wenn ein Ablaufdatum gesetzt ist, prüfen ob es abgelaufen ist
            if (
              moodOverrideDoc.expiresAt &&
              dayjs().isAfter(dayjs(moodOverrideDoc.expiresAt))
            ) {
              // Überschreibung ist abgelaufen - nur Generator zurückgeben
              return res.status(200).json({
                success: true,
                data: latestGenerator,
              });
            } else {
              // Überschreibung ist aktiv - Generator und Überschreibung zurückgeben
              return res.status(200).json({
                success: true,
                data: latestGenerator,
                moodOverride: {
                  active: moodOverrideDoc.active,
                  level: moodOverrideDoc.level,
                  expiresAt: moodOverrideDoc.expiresAt,
                },
              });
            }
          } else {
            // Keine aktive Überschreibung
            return res.status(200).json({
              success: true,
              data: latestGenerator,
            });
          }
        }

        if (id) {
          // Einzelnen Generator per ID abrufen
          const generator = await Generator.findById(id).lean();
          if (!generator) {
            return res.status(404).json({
              success: false,
              message: "Kein Generator mit dieser ID gefunden.",
            });
          }

          return res.status(200).json({
            success: true,
            data: generator,
          });
        } else {
          // Alle Generatoren (optional gefiltert) abrufen
          const filter: Record<string, any> = {};

          // Filter nach Status
          if (status) {
            filter.status = status;
          }

          // Filter nach auszuschließenden Status
          if (exclude_status) {
            const excludedStatuses = Array.isArray(exclude_status)
              ? exclude_status
              : [exclude_status];
            filter.status = { $nin: excludedStatuses };
          }

          // Generatoren abrufen und sortieren
          const generators = await Generator.find(filter)
            .sort({ createdAt: -1 })
            .lean();

          return res.status(200).json({
            success: true,
            data: generators as IGenerator[],
          });
        }
      } catch (error) {
        console.error("Fehler beim Abrufen der Generatoren:", error);
        res.status(500).json({
          success: false,
          message: "Serverfehler beim Abrufen der Daten",
        });
      }
      break;

    case "POST":
      try {
        const generatorData = { ...req.body };

        // Konvertiere das outfit-Objekt in einen String, falls es ein Objekt ist
        if (
          typeof generatorData.outfit === "object" &&
          generatorData.outfit !== null
        ) {
          // Verwende die outfit-Eigenschaft des Objekts oder einen leeren String, falls nicht vorhanden
          generatorData.outfit = generatorData.outfit.outfit || "";

          // Optional: Füge additionalNote als separates Feld hinzu, wenn das Schema es unterstützt
          // generatorData.outfitNote = generatorData.outfit.additionalNote || '';
        }

        // Konvertiere das orgasmus-Objekt in einen String, falls es ein Objekt ist
        if (
          typeof generatorData.orgasmus === "object" &&
          generatorData.orgasmus !== null
        ) {
          // Verwende die option-Eigenschaft des Objekts oder einen leeren String, falls nicht vorhanden
          generatorData.orgasmus = generatorData.orgasmus.option || "";

          // Optional: Füge additionalNote als separates Feld hinzu, wenn das Schema es unterstützt
          // generatorData.orgasmusNote = generatorData.orgasmus.additionalNote || '';
        }

        const newGenerator = new Generator(generatorData);
        const savedGenerator = await newGenerator.save();

        // Benachrichtigung per Telegram
        await sendTelegramMessage(
          "admin",
          `Neuer Generator erstellt am ${dayjs()
            .locale("de")
            .format("DD.MM.YYYY HH:mm:ss")}`
        );

        res.status(201).json({
          success: true,
          data: savedGenerator,
        });
      } catch (error) {
        console.error("Fehler beim Speichern des Generators:", error);
        res.status(500).json({
          success: false,
          message: "Serverfehler beim Speichern",
        });
      }
      break;

    case "PUT":
      try {
        // Erwarte im Request-Body die Felder "id" und "newStatus"
        const { id, newStatus } = req.body;

        if (!id || !newStatus) {
          return res.status(400).json({
            success: false,
            message: "ID und newStatus müssen übergeben werden.",
          });
        }

        // Optionale Validierung des Status
        const allowedStatuses = [
          "NEW",
          "ACCEPTED",
          "PENDING",
          "DONE",
          "DECLINED",
          "FAILED",
        ];
        if (!allowedStatuses.includes(newStatus)) {
          return res.status(400).json({
            success: false,
            message: "Ungültiger Status.",
          });
        }

        // Aktualisiere den Generator anhand der ID
        const updatedGenerator = await Generator.findByIdAndUpdate(
          id,
          { status: newStatus },
          { new: true, runValidators: true }
        );

        if (!updatedGenerator) {
          return res.status(404).json({
            success: false,
            message: "Generator nicht gefunden.",
          });
        }

        return res.status(200).json({
          success: true,
          data: updatedGenerator,
        });
      } catch (error) {
        console.error("Fehler beim Aktualisieren des Generators:", error);
        return res.status(500).json({
          success: false,
          message: "Serverfehler beim Aktualisieren des Generators",
        });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT"]);
      res.status(405).json({
        success: false,
        message: `Methode ${req.method} ist nicht erlaubt`,
      });
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Generator, { IGenerator } from "@/models/Generator";
import { sendTelegramMessage } from "@/util/sendTelegramMessage";
import dayjs from "dayjs";

interface SuccessResponse<T = IGenerator | IGenerator[]> {
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
          return res.status(200).json({
            success: true,
            data: latestGenerator,
          });
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
        const generatorData: IGenerator = req.body;
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

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).json({
        success: false,
        message: `Methode ${req.method} ist nicht erlaubt`,
      });
  }
}

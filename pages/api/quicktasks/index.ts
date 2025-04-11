/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/quicktasks.ts
import type { NextApiRequest, NextApiResponse } from "next";
import mongoose, { Model, Document } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { sendTelegramMessage } from "@/util/sendTelegramMessage";

// Typdefinitionen
export type QuickTaskStatus = "NEW" | "ACCEPTED" | "DONE" | "FAILED";
export type Rating = 1 | 2 | 3 | 4 | 5;

// Interface für die Basisdaten eines QuickTask
export interface QuickTaskData {
  title: string;
  description: string;
  url?: string;
  createdAt: Date;
  status: QuickTaskStatus;
  seen: boolean;
  rating?: Rating;
  completionEffort?: Rating;
  creativity?: Rating;
  timeManagement?: Rating;
  followedInstructions?: Rating;
  additionalNotes?: string;
  goldReward?: number;
}

// Interface für Mongoose Schema
export interface QuickTaskDocument extends Document, QuickTaskData {}

// Typischer API Response Type
export interface QuickTaskResponse extends QuickTaskData {
  _id: string;
}

const QuickTaskSchema = new mongoose.Schema<QuickTaskDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    url: { type: String },
    createdAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["NEW", "ACCEPTED", "DONE", "FAILED"],
      default: "NEW",
      required: true,
    },
    seen: { type: Boolean, default: false },
    rating: { type: Number, enum: [1, 2, 3, 4, 5] },
    completionEffort: { type: Number, enum: [1, 2, 3, 4, 5] },
    creativity: { type: Number, enum: [1, 2, 3, 4, 5] },
    timeManagement: { type: Number, enum: [1, 2, 3, 4, 5] },
    followedInstructions: { type: Number, enum: [1, 2, 3, 4, 5] },
    additionalNotes: { type: String },
    goldReward: { type: Number },
  },
  {
    timestamps: true,
  }
);

// Mongoose Model
let QuickTaskModel: Model<QuickTaskDocument>;

// Vermeidet Neuerstellung des Models bei Hot Reloading
if (mongoose.models.QuickTask) {
  QuickTaskModel = mongoose.models.QuickTask as Model<QuickTaskDocument>;
} else {
  QuickTaskModel = mongoose.model<QuickTaskDocument>(
    "QuickTask",
    QuickTaskSchema
  );
}

// API Response Typen
interface SuccessResponse<T = any> {
  success: true;
  data: T;
}

interface ErrorResponse {
  success: false;
  message: string;
}

// Hilfsfunktion zum sicheren Konvertieren der Mongoose-Dokumente
function convertToResponseObject(doc: any): QuickTaskResponse {
  // Wenn ein Dokument übergeben wird, verwenden wir toObject
  if (doc.toObject) {
    const obj = doc.toObject();
    return {
      ...obj,
      _id: obj._id.toString(),
    };
  }

  // Wenn bereits ein Objekt übergeben wird (z.B. von .lean())
  return {
    ...doc,
    _id: doc._id.toString(),
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  await dbConnect();

  switch (req.method) {
    case "GET": {
      try {
        const { id, status } = req.query;

        if (id) {
          // Einzelnen Task abrufen
          const task = await QuickTaskModel.findById(id).lean();

          if (!task) {
            return res.status(404).json({
              success: false,
              message: "Kein Quick Task mit dieser ID gefunden.",
            });
          }

          return res.status(200).json({
            success: true,
            data: convertToResponseObject(task),
          });
        } else {
          // Filter erstellen
          const filter: Record<string, any> = {};

          // Filter für Status
          if (status) {
            if (typeof status === "string") {
              const statuses = status.split(",");
              filter.status = statuses.length > 1 ? { $in: statuses } : status;
            } else if (Array.isArray(status)) {
              const statuses = status.flatMap((s) => s.split(","));
              filter.status = { $in: statuses };
            }
          }

          // Query erstellen
          const tasks = await QuickTaskModel.find(filter)
            .sort({ createdAt: -1 })
            .lean();

          return res.status(200).json({
            success: true,
            // Konvertiere jedes Dokument im Array
            data: tasks.map((task) => convertToResponseObject(task)),
          });
        }
      } catch (error) {
        console.error("Fehler beim Abrufen der Quick Tasks:", error);
        return res.status(500).json({
          success: false,
          message: "Serverfehler beim Abrufen der Quick Tasks",
        });
      }
    }

    case "POST": {
      try {
        // Neuen Quick Task erstellen
        const { title, description, url, status, seen, createdAt } = req.body;

        if (!title || !description) {
          return res.status(400).json({
            success: false,
            message: "Titel und Beschreibung sind erforderlich",
          });
        }

        const newTask = new QuickTaskModel({
          title,
          description,
          url,
          status: status || "NEW",
          seen: seen || false,
          createdAt: createdAt || new Date(),
        });

        const savedTask = await newTask.save();

        // Bei neuen Tasks eine Benachrichtigung senden
        if (status === "NEW" || !status) {
          try {
            await sendTelegramMessage(
              "user",
              "📋 Neuer Quick Task verfügbar! Schau in deiner Auftrags-Liste nach."
            );
          } catch (error) {
            console.error("Fehler beim Senden der Telegram-Nachricht:", error);
          }
        }

        return res.status(201).json({
          success: true,
          data: convertToResponseObject(savedTask),
        });
      } catch (error) {
        console.error("Fehler beim Erstellen des Quick Tasks:", error);
        return res.status(500).json({
          success: false,
          message: "Serverfehler beim Erstellen des Quick Tasks",
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

        // Quick Task aktualisieren
        const updateData = req.body;
        const updatedTask = await QuickTaskModel.findByIdAndUpdate(
          id,
          updateData,
          {
            new: true,
            runValidators: true,
          }
        ).lean();

        if (!updatedTask) {
          return res.status(404).json({
            success: false,
            message: "Quick Task nicht gefunden",
          });
        }

        // Konvertiere zu Response-Objekt für sichere Typverwendung
        const responseTask = convertToResponseObject(updatedTask);

        // Bei Statusänderung ggf. Benachrichtigung senden
        if (updateData.status) {
          try {
            if (updateData.status === "ACCEPTED") {
              await sendTelegramMessage(
                "admin",
                `Ein Quick Task wurde angenommen: "${responseTask.title}"`
              );
            } else if (updateData.status === "DONE") {
              await sendTelegramMessage(
                "admin",
                `Ein Quick Task wurde als erledigt markiert: "${responseTask.title}"`
              );
            }
          } catch (error) {
            console.error("Fehler beim Senden der Telegram-Nachricht:", error);
          }
        }

        return res.status(200).json({
          success: true,
          data: responseTask,
        });
      } catch (error) {
        console.error("Fehler beim Aktualisieren des Quick Tasks:", error);
        return res.status(500).json({
          success: false,
          message: "Serverfehler beim Aktualisieren des Quick Tasks",
        });
      }
    }

    case "DELETE": {
      try {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({
            success: false,
            message: "Fehlende ID im Query-Parameter",
          });
        }

        const deletedTask = await QuickTaskModel.findByIdAndDelete(id).lean();

        if (!deletedTask) {
          return res.status(404).json({
            success: false,
            message: "Quick Task nicht gefunden",
          });
        }

        return res.status(200).json({
          success: true,
          data: convertToResponseObject(deletedTask),
        });
      } catch (error) {
        console.error("Fehler beim Löschen des Quick Tasks:", error);
        return res.status(500).json({
          success: false,
          message: "Serverfehler beim Löschen des Quick Tasks",
        });
      }
    }

    default: {
      res.setHeader("Allow", ["GET", "POST", "PATCH", "DELETE"]);
      return res.status(405).json({
        success: false,
        message: `Methode ${req.method} ist nicht erlaubt`,
      });
    }
  }
}

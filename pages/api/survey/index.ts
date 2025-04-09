// pages/api/survey.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Survey from "@/models/Survey";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";

interface SurveyAnswer {
  questionId: string;
  response: "yes" | "maybe" | "no";
  reason: string;
}

interface SurveyRequestBody {
  answers: SurveyAnswer[];
}

interface SurveyResponse {
  _id: mongoose.Types.ObjectId;
  answers: SurveyAnswer[];
  averageScore: number;
  submittedAt: Date;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SurveyResponse | { error: string }>
) {
  await dbConnect();

  // Nur POST-Methode erlauben
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ error: `Methode ${req.method} nicht erlaubt` });
  }

  try {
    // Überprüfen, ob der Benutzer eine neue Umfrage ausfüllen darf
    if (!(await Survey.canRetake())) {
      return res.status(400).json({
        error: "Die Umfrage kann nur alle 3 Monate ausgefüllt werden",
      });
    }

    // Sicherstellen, dass die Anfrage gültige Antworten enthält
    const body = req.body as SurveyRequestBody;
    if (
      !body.answers ||
      !Array.isArray(body.answers) ||
      body.answers.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Keine gültigen Antworten angegeben" });
    }

    // Neue Umfrage erstellen ohne userId
    const survey = new Survey({
      answers: body.answers,
    });

    // Durchschnittswert berechnen und speichern
    survey.averageScore = survey.calculateAverage();
    await survey.save();

    return res.status(201).json(survey as unknown as SurveyResponse);
  } catch (error) {
    console.error("Fehler beim Speichern der Umfrage:", error);
    return res
      .status(500)
      .json({ error: "Serverfehler beim Speichern der Umfrage" });
  }
}

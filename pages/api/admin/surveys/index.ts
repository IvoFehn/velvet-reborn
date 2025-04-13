// pages/api/admin/surveys.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Survey from "@/models/Survey";
import dbConnect from "@/lib/dbConnect";

// You might want to add authentication for admin routes
// This is a simple example without authentication

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    await dbConnect();

    // Get all surveys, sorted by submission date (newest first)
    const surveys = await Survey.find({}).sort({ submittedAt: -1 }).lean();

    // Transform the data to be more readable in the frontend
    const formattedSurveys = surveys.map((survey) => ({
      _id: survey._id.toString(),
      answers: survey.answers.map((answer) => ({
        questionId: answer.questionId,
        response: answer.response,
        reason: answer.reason,
      })),
      averageScore: survey.averageScore,
      submittedAt: survey.submittedAt,
    }));

    return res.status(200).json(formattedSurveys);
  } catch (error) {
    console.error("Error fetching surveys:", error);
    return res
      .status(500)
      .json({ error: "Server error while fetching surveys" });
  }
}

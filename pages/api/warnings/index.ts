// pages/api/warnings/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/dbConnect";
import Warning from "../../../models/Warning";
import { IWarning } from "../../../models/Warning";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    success: boolean;
    data?: IWarning[];
    count?: number;
    message: string;
    error?: string;
  }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    await dbConnect();

    // Check if we only want unacknowledged warnings
    const unacknowledgedOnly = req.query.unacknowledged === "true";

    // Build query
    const query = unacknowledgedOnly ? { acknowledged: false } : {};

    // Get warnings, newest first
    const warnings = await Warning.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: warnings,
      count: warnings.length,
      message: `${warnings.length} Warnungen gefunden`,
    });
  } catch (error) {
    console.error("Error fetching warnings:", error);
    return res.status(500).json({
      success: false,
      message: "Fehler beim Abrufen der Warnungen",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

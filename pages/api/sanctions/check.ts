// pages/api/sanctions/check.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/dbConnect";
import Sanction from "../../../models/Sanction";
import { IApiResponse, ISanctionResponse } from "@/types/index";

interface CheckSanctionsRequest extends NextApiRequest {
  body: {
    sanctionId?: string;
    checkAll?: boolean;
  };
}

export default async function handler(
  req: CheckSanctionsRequest,
  res: NextApiResponse<IApiResponse<ISanctionResponse[]>>
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    await dbConnect();

    // Entweder eine spezifische Sanktion überprüfen oder alle offenen Sanktionen
    const { sanctionId, checkAll = false } = req.body;

    let sanctions = [];
    let escalatedCount = 0;

    if (checkAll) {
      // Alle offenen Sanktionen überprüfen
      sanctions = await Sanction.find({ status: "offen" });
    } else if (sanctionId) {
      // Nur eine spezifische Sanktion überprüfen
      const sanction = await Sanction.findById(sanctionId);
      if (!sanction) {
        return res.status(404).json({
          success: false,
          message: "Sanktion nicht gefunden",
        });
      }
      sanctions = [sanction];
    } else {
      return res.status(400).json({
        success: false,
        message:
          "Bitte geben Sie eine Sanktions-ID an oder setzen Sie checkAll auf true",
      });
    }

    // Jede Sanktion überprüfen und ggf. eskalieren
    const results: ISanctionResponse[] = await Promise.all(
      sanctions.map(async (sanction) => {
        const wasEscalated = sanction.checkAndEscalate();

        if (wasEscalated) {
          await sanction.save();
          escalatedCount++;
          return {
            id: sanction._id.toString(),
            title: sanction.title,
            escalated: true,
            newAmount: sanction.amount,
            newDeadline: sanction.deadline,
          };
        }

        return {
          id: sanction._id.toString(),
          title: sanction.title,
          escalated: false,
        };
      })
    );

    // Erfolgreiche Antwort senden
    return res.status(200).json({
      success: true,
      message: `${escalatedCount} Sanktion(en) eskaliert`,
      totalChecked: sanctions.length,
      escalatedCount,
      results,
    });
  } catch (error) {
    console.error("Error checking/escalating sanctions:", error);
    return res.status(500).json({
      success: false,
      message: "Fehler bei der Überprüfung der Sanktionen",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

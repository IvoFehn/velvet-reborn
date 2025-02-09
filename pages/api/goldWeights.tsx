// pages/api/goldWeights.ts
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Wir definieren eine Schnittstelle für unsere Gewichte (Weights).
 * Die Felder stammen aus deinem Berechnungsmodell (z. B. obedience, vibeDuringSex, etc.).
 */
interface GoldWeights {
  obedience: number;
  vibeDuringSex: number;
  vibeAfterSex: number;
  orgasmIntensity: number;
  painlessness: number;
  ballsWorshipping: number;
  cumWorshipping: number;
  didEverythingForHisPleasure: number;
}

// In-Memory-Speicher (initiale Werte):
let storedWeights: GoldWeights = {
  obedience: 0.3,
  vibeDuringSex: 0.15,
  vibeAfterSex: 0.15,
  orgasmIntensity: 0.1,
  painlessness: 0.1,
  ballsWorshipping: 0.1,
  cumWorshipping: 0.05,
  didEverythingForHisPleasure: 0.05,
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // 1) Aktuelle Weights zurückgeben
    return res.status(200).json({ success: true, data: storedWeights });
  } else if (req.method === "PUT") {
    // 2) Neue Weights entgegennehmen und überschreiben
    const newWeights: Partial<GoldWeights> = req.body;
    // Im einfachsten Fall überschreiben wir nur die Felder, die tatsächlich übergeben wurden
    storedWeights = { ...storedWeights, ...newWeights };
    return res.status(200).json({ success: true, data: storedWeights });
  } else {
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`,
    });
  }
}

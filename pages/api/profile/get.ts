// pages/api/profile/get.ts
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Profile, { IProfile } from "@/models/Profile";
import Item from "@/models/Item"; // expliziter Import, der nun auch genutzt wird

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  if (req.method !== "GET") {
    console.log("Ungültige Methode:", req.method);
    return res.status(405).json({
      success: false,
      message: "Methode nicht erlaubt",
    });
  }

  try {
    const profile = await Profile.findOne<IProfile>({})
      .populate({
        path: "inventory",
        populate: {
          path: "item",
          model: Item.modelName, // Hier wird das importierte Item genutzt
        },
      })
      .lean<IProfile>()
      .exec();

    if (!profile) {
      console.log("Profil nicht gefunden");
      return res
        .status(404)
        .json({ success: false, message: "Profil nicht gefunden" });
    }

    console.log("Profil erfolgreich abgerufen:", profile._id);
    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error("Fehler beim Abrufen des Profils:", error);
    return res.status(500).json({
      success: false,
      message: "Serverfehler",
    });
  }
}

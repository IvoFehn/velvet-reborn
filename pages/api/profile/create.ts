import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/dbConnect";
import Profile from "../../../models/Profile";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  try {
    if (req.method === "POST") {
      const {
        name,
        gold = 0,
        exp = 0,
        inventory = [],
        profileImage,
      } = req.body;

      const newProfile = await Profile.create({
        name,
        gold,
        exp,
        inventory,
        profileImage,
      });

      return res.status(201).json({ success: true, data: newProfile });
    }

    return res
      .status(405)
      .json({ success: false, message: "Methode nicht erlaubt" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Serverfehler" });
  }
}

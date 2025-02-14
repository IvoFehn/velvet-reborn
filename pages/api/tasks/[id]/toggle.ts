/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../../lib/dbConnect";
import DailyTask from "@/models/DailyTask";
import { IDailyTask } from "@/models/DailyTask";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IDailyTask | { message: string }>
) {
  await dbConnect();
  const { id } = req.query;

  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res
      .status(405)
      .json({ message: `Methode ${req.method} nicht erlaubt` });
  }

  try {
    const task = await DailyTask.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Aufgabe nicht gefunden" });
    }

    // Toggle: completed-Status umkehren und completedAt entsprechend setzen
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    const updatedTask = await task.save();
    return res.status(200).json(updatedTask);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/tasks/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/dbConnect";
import DailyTask, { IDailyTask } from "@/models/DailyTask";

type Data = { message: string } | IDailyTask[] | IDailyTask;

async function resetOldCompletedTasks() {
  // Errechne den Beginn des heutigen Tages (00:00 Uhr)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Setze alle Aufgaben zurück, die als erledigt markiert wurden, deren completedAt vor heute liegt
  await DailyTask.updateMany(
    { completed: true, completedAt: { $lt: today } },
    { completed: false, completedAt: null }
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await dbConnect();

  switch (req.method) {
    case "GET":
      try {
        // Zuerst alle veralteten, erledigten Tasks zurücksetzen
        await resetOldCompletedTasks();
        const tasks: IDailyTask[] = await DailyTask.find();
        return res.status(200).json(tasks);
      } catch (error: any) {
        return res.status(500).json({ message: error.message });
      }

    case "POST":
      try {
        const { title, description } = req.body;
        if (!title || !description) {
          return res
            .status(400)
            .json({ message: "Title und Description sind erforderlich" });
        }

        const newTask = new DailyTask({ title, description });
        await newTask.save();
        return res.status(201).json(newTask);
      } catch (error: any) {
        return res.status(500).json({ message: error.message });
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res
        .status(405)
        .json({ message: `Methode ${req.method} nicht erlaubt` });
  }
}

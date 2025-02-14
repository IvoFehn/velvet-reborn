/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/tasks/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../../lib/dbConnect";
import DailyTask, { IDailyTask } from "@/models/DailyTask";

type Data = { message: string } | IDailyTask;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await dbConnect();
  const { id } = req.query;

  switch (req.method) {
    case "GET":
      try {
        const task = await DailyTask.findById(id);
        if (!task) {
          return res.status(404).json({ message: "Aufgabe nicht gefunden" });
        }
        return res.status(200).json(task);
      } catch (error: any) {
        return res.status(500).json({ message: error.message });
      }

    case "PUT":
      try {
        const { title, description, completed } = req.body;
        // Wenn der Task als erledigt markiert wird, setze completedAt auf die aktuelle Zeit
        // andernfalls wird er zurückgesetzt.
        const updateData: Partial<IDailyTask> = {
          title,
          description,
          completed,
        };
        if (completed) {
          updateData.completedAt = new Date();
        } else {
          updateData.completedAt = null;
        }
        const updatedTask = await DailyTask.findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: true,
        });
        if (!updatedTask) {
          return res.status(404).json({ message: "Aufgabe nicht gefunden" });
        }
        return res.status(200).json(updatedTask);
      } catch (error: any) {
        return res.status(500).json({ message: error.message });
      }

    case "DELETE":
      try {
        const deletedTask = await DailyTask.findByIdAndDelete(id);
        if (!deletedTask) {
          return res.status(404).json({ message: "Aufgabe nicht gefunden" });
        }
        return res.status(200).json({ message: "Aufgabe gelöscht" });
      } catch (error: any) {
        return res.status(500).json({ message: error.message });
      }

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res
        .status(405)
        .json({ message: `Methode ${req.method} nicht erlaubt` });
  }
}

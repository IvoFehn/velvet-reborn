/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Event, { IEvent } from "@/models/Event";

interface EventOccurrence {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  recurring: boolean;
  recurrence?:
    | "daily"
    | "weekly"
    | "monthly"
    | "quarterly"
    | "biannually"
    | "yearly";
  recurrenceEnd?: Date;
  duration?: number;
  isOccurrence: boolean;
  originalEventId?: string;
}

interface Data {
  success: boolean;
  message?: string;
  event?: IEvent;
  events?: EventOccurrence[];
  active?: boolean;
}

function getRecurringEventOccurrences(
  event: any,
  startWindow: Date,
  endWindow: Date
): EventOccurrence[] {
  // Immer mindestens das Originalevent zurückgeben, unabhängig von Zeitfenstern
  const occurrences: EventOccurrence[] = [
    {
      _id: event._id.toString(),
      title: event.title,
      description: event.description,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      recurring: event.recurring,
      recurrence: event.recurrence,
      recurrenceEnd: event.recurrenceEnd
        ? new Date(event.recurrenceEnd)
        : undefined,
      duration:
        event.duration ||
        new Date(event.endDate).getTime() - new Date(event.startDate).getTime(),
      isOccurrence: false,
    },
  ];

  // Wenn das Event nicht wiederkehrend ist, nur das Originalevent zurückgeben
  if (!event.recurring) {
    return occurrences;
  }

  const duration =
    event.duration ||
    new Date(event.endDate).getTime() - new Date(event.startDate).getTime();

  // Beginne mit dem Original-Datum
  let currentDate = new Date(event.startDate);

  // Generiere Wiederholungen bis zum Ende des Zeitfensters oder recurrenceEnd
  const effectiveEndDate = event.recurrenceEnd
    ? new Date(
        Math.min(endWindow.getTime(), new Date(event.recurrenceEnd).getTime())
      )
    : endWindow;

  // Gehe zum nächsten Vorkommen nach dem Original
  currentDate = getNextOccurrenceDate(currentDate, event.recurrence || "daily");

  while (currentDate <= effectiveEndDate) {
    const occurrenceEndDate = new Date(currentDate.getTime() + duration);

    // Füge das Vorkommen hinzu, wenn das Ende nach dem Anfang des Zeitfensters liegt
    if (occurrenceEndDate >= startWindow) {
      occurrences.push({
        title: event.title,
        description: event.description,
        startDate: new Date(currentDate),
        endDate: new Date(occurrenceEndDate),
        recurring: event.recurring,
        recurrence: event.recurrence,
        recurrenceEnd: event.recurrenceEnd
          ? new Date(event.recurrenceEnd)
          : undefined,
        duration: duration,
        isOccurrence: true,
        originalEventId: event._id?.toString(),
      });
    }

    currentDate = getNextOccurrenceDate(
      currentDate,
      event.recurrence || "daily"
    );
  }

  return occurrences;
}

function getNextOccurrenceDate(currentDate: Date, recurrence: string): Date {
  const nextDate = new Date(currentDate);

  switch (recurrence) {
    case "daily":
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case "weekly":
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case "monthly":
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case "quarterly":
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case "biannually":
      nextDate.setMonth(nextDate.getMonth() + 6);
      break;
    case "yearly":
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    default:
      nextDate.setDate(nextDate.getDate() + 1);
  }

  return nextDate;
}

async function checkActiveEvents(): Promise<boolean> {
  const now = new Date();

  const activeNonRecurringEvents = await Event.find({
    recurring: false,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).lean();

  if (activeNonRecurringEvents.length > 0) {
    return true;
  }

  // Prüfe wiederkehrende Events
  const recurringEvents = await Event.find({
    recurring: true,
  }).lean();

  for (const event of recurringEvents) {
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Wir prüfen nur ein kleines Zeitfenster für aktive Events
    const occurrences = getRecurringEventOccurrences(
      event,
      yesterday,
      tomorrow
    );

    const isActiveOccurrence = occurrences.some(
      (occurrence) =>
        new Date(occurrence.startDate) <= now &&
        new Date(occurrence.endDate) >= now
    );

    if (isActiveOccurrence) {
      return true;
    }
  }

  return false;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await dbConnect();

  if (req.method === "GET" && req.query.check === "active") {
    try {
      const active = await checkActiveEvents();
      return res.status(200).json({ success: true, active });
    } catch (error) {
      console.error("GET /api/events?check=active:", error);
      return res.status(500).json({
        success: false,
        message: "Fehler beim Prüfen aktiver Events",
      });
    }
  }

  if (req.method === "GET") {
    try {
      const now = new Date();
      // Wir verwenden ein größeres Zeitfenster für bessere Übersicht
      const timeWindow = req.query.timeWindow
        ? parseInt(req.query.timeWindow as string)
        : 90; // 90 Tage
      const endDate = new Date(
        now.getTime() + timeWindow * 24 * 60 * 60 * 1000
      );

      // Hole ALLE Events aus der Datenbank ohne Filter
      const allEvents = await Event.find({}).lean();

      console.log(`Gefunden: ${allEvents.length} Events in der Datenbank`);

      // Teile die Events in wiederkehrende und nicht-wiederkehrende auf
      const nonRecurringEvents = allEvents.filter((event) => !event.recurring);
      const recurringEvents = allEvents.filter((event) => event.recurring);

      console.log(`Nicht-wiederkehrende Events: ${nonRecurringEvents.length}`);
      console.log(`Wiederkehrende Events: ${recurringEvents.length}`);

      let expandedEvents: EventOccurrence[] = [];

      // Füge nicht-wiederkehrende Events hinzu
      for (const event of nonRecurringEvents) {
        expandedEvents.push({
          _id: event._id?.toString(),
          id: event._id?.toString(),
          title: event.title,
          description: event.description,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
          recurring: event.recurring,
          recurrence: event.recurrence,
          recurrenceEnd: event.recurrenceEnd,
          duration: event.duration,
          isOccurrence: false,
        });
      }

      // Füge wiederkehrende Events mit ihren Vorkommen hinzu
      for (const event of recurringEvents) {
        // Log details for debugging
        console.log(`Verarbeite wiederkehrendes Event: ${event.title}`);
        console.log(`- ID: ${event._id}`);
        console.log(`- Startdatum: ${new Date(event.startDate).toISOString()}`);
        console.log(`- Enddatum: ${new Date(event.endDate).toISOString()}`);
        console.log(`- Wiederholungstyp: ${event.recurrence}`);
        if (event.recurrenceEnd) {
          console.log(
            `- Wiederholungs-Enddatum: ${new Date(
              event.recurrenceEnd
            ).toISOString()}`
          );
        } else {
          console.log(`- Keine Wiederholungs-Enddatum definiert`);
        }

        // Generiere Vorkommen für dieses wiederkehrende Event
        // Wichtig: Wir generieren IMMER Vorkommen, auch für Events mit abgelaufenen recurrenceEnd
        const occurrences = getRecurringEventOccurrences(event, now, endDate);
        console.log(`- Generierte Vorkommen: ${occurrences.length}`);

        // Füge alle generierten Vorkommen hinzu
        expandedEvents = [...expandedEvents, ...occurrences];
      }

      // Sortiere nach Startdatum
      expandedEvents.sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

      console.log(`Insgesamt zurückgegeben: ${expandedEvents.length} Events`);

      return res.status(200).json({ success: true, events: expandedEvents });
    } catch (error) {
      console.error("GET /api/events:", error);
      return res.status(500).json({
        success: false,
        message: "Fehler beim Abrufen der Events",
      });
    }
  }

  if (req.method === "POST") {
    try {
      const {
        title,
        description,
        startDate,
        endDate,
        recurring,
        recurrence,
        recurrenceEnd,
      } = req.body;

      if (!title || !description || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Bitte alle Pflichtfelder ausfüllen.",
        });
      }

      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      if (endDateObj <= new Date() && !recurring) {
        return res.status(400).json({
          success: false,
          message: "Das Enddatum muss in der Zukunft liegen.",
        });
      }

      if (startDateObj >= endDateObj) {
        return res.status(400).json({
          success: false,
          message: "Das Startdatum muss vor dem Enddatum liegen.",
        });
      }

      const duration = endDateObj.getTime() - startDateObj.getTime();

      const newEvent = new Event({
        title,
        description,
        startDate,
        endDate,
        recurring: recurring === true || recurring === "true",
        recurrence: recurring ? recurrence : undefined,
        recurrenceEnd: recurring && recurrenceEnd ? recurrenceEnd : undefined,
        duration: duration,
      });

      const savedEvent = await newEvent.save();
      return res.status(201).json({ success: true, event: savedEvent });
    } catch (error) {
      console.error("POST /api/events:", error);
      return res.status(500).json({
        success: false,
        message: "Fehler beim Erstellen des Events",
      });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({
    success: false,
    message: `Methode ${req.method} nicht erlaubt`,
  });
}

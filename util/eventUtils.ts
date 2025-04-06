/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/eventUtils.ts
import { IEvent } from "@/models/Event";

/**
 * Berechnet die nächsten Vorkommen eines wiederkehrenden Events innerhalb eines Zeitfensters
 *
 * @param event Das wiederkehrende Event
 * @param startWindow Beginn des Zeitfensters
 * @param endWindow Ende des Zeitfensters
 * @returns Array von Event-Vorkommen mit berechneten Start- und Enddaten
 */
export function getRecurringEventOccurrences(
  event: IEvent,
  startWindow: Date,
  endWindow: Date
): any[] {
  if (!event.recurring) return [event];

  const occurrences: any[] = [];
  const duration =
    event.duration ||
    new Date(event.endDate).getTime() - new Date(event.startDate).getTime();

  // Startdatum des Events
  let currentDate = new Date(event.startDate);

  // Wenn das originale Startdatum vor dem Zeitfenster liegt, finde das erste Vorkommen im Zeitfenster
  if (currentDate < startWindow) {
    currentDate = findFirstOccurrenceInTimeWindow(event, startWindow);
  }

  // Generiere alle Vorkommen bis zum Ende des Zeitfensters oder recurrenceEnd
  const recurrenceEnd = new Date(event.recurrenceEnd || endWindow);
  const effectiveEndDate = new Date(
    Math.min(endWindow.getTime(), recurrenceEnd.getTime())
  );

  while (currentDate <= effectiveEndDate) {
    const occurrenceEndDate = new Date(currentDate.getTime() + duration);

    // Nur Vorkommen hinzufügen, die vollständig oder teilweise im Zeitfenster liegen
    if (occurrenceEndDate >= startWindow) {
      const occurrence = {
        ...JSON.parse(JSON.stringify(event)),
        startDate: new Date(currentDate),
        endDate: new Date(occurrenceEndDate),
        isOccurrence: true,
        originalEventId: event._id,
      };

      occurrences.push(occurrence);
    }

    // Berechne das nächste Vorkommen basierend auf der Recurrence-Art
    currentDate = getNextOccurrenceDate(
      currentDate,
      event.recurrence || "daily"
    );
  }

  return occurrences;
}

/**
 * Findet das erste Vorkommen eines wiederkehrenden Events innerhalb eines Zeitfensters
 */
function findFirstOccurrenceInTimeWindow(
  event: IEvent,
  startWindow: Date
): Date {
  let currentDate = new Date(event.startDate);
  const recurrence = event.recurrence || "daily";

  while (currentDate < startWindow) {
    currentDate = getNextOccurrenceDate(currentDate, recurrence);
  }

  return currentDate;
}

/**
 * Berechnet das Datum des nächsten Vorkommens basierend auf der Wiederholungsregel
 */
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
      nextDate.setDate(nextDate.getDate() + 1); // Default: täglich
  }

  return nextDate;
}

/**
 * Überprüft, ob ein Event zum aktuellen Zeitpunkt aktiv ist
 */
export async function isEventActive(): Promise<boolean> {
  try {
    const response = await fetch("/api/checkActiveEvents");
    const data = await response.json();
    return data.active;
  } catch (error) {
    console.error("Fehler beim Prüfen aktiver Events:", error);
    return false;
  }
}

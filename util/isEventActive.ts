/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/isEventActive.ts
/**
 * Prüft, ob aktuell ein Event aktiv ist, indem die Events von /api/events abgefragt werden.
 * Gibt true zurück, wenn mindestens ein Event aktiv ist, sonst false.
 */
export async function isEventActive(): Promise<boolean> {
  try {
    const response = await fetch("/api/events");
    const data = await response.json();
    if (!data.success || !data.events) {
      return false;
    }

    const nowUTC = new Date();

    const active = data.events.some((event: any) => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      const recurrenceEnd = event.recurrenceEnd
        ? new Date(event.recurrenceEnd)
        : null;

      // Für wiederkehrende Events
      if (event.recurring) {
        // Falls das Wiederholungsende überschritten wurde:
        if (recurrenceEnd && nowUTC > recurrenceEnd) return false;

        // Berechne Zeiten in Minuten
        const currentUTCTime =
          nowUTC.getUTCHours() * 60 + nowUTC.getUTCMinutes();
        const eventStartTime =
          startDate.getUTCHours() * 60 + startDate.getUTCMinutes();
        const eventEndTime =
          endDate.getUTCHours() * 60 + endDate.getUTCMinutes();

        // Beispiel: Wöchentliche Wiederholung – prüfe, ob heute der gleiche Wochentag ist und
        // die aktuelle Zeit innerhalb des Event-Zeitraums liegt.
        if (event.recurrence === "weekly") {
          return (
            nowUTC.getUTCDay() === startDate.getUTCDay() &&
            currentUTCTime >= eventStartTime &&
            currentUTCTime <= eventEndTime
          );
        }

        // Hier kannst du weitere recurrence-Typen ergänzen.
        return false;
      }

      // Für nicht-wiederkehrende Events:
      return nowUTC >= startDate && nowUTC <= endDate;
    });

    return active;
  } catch (error) {
    console.error("Fehler bei der Event-Prüfung:", error);
    return false;
  }
}

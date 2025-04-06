/**
 * Prüft, ob aktuell ein Event aktiv ist, indem die vorhandene Events-API genutzt wird.
 *
 * @returns Promise<boolean> - True, wenn mindestens ein Event aktiv ist, sonst false
 */
export async function isEventActive(): Promise<boolean> {
  try {
    console.log("Überprüfe aktive Events mit vorhandener API...");

    // Nutze die bestehende Events-API
    const response = await fetch("/api/events");

    if (!response.ok) {
      console.error("Fehler beim Abrufen der Events:", response.statusText);
      return false;
    }

    const { events } = await response.json();

    if (!events || !Array.isArray(events) || events.length === 0) {
      console.log("Keine Events vorhanden");
      return false;
    }

    // Prüfe, ob mindestens ein Event aktiv ist
    const now = new Date();
    const activeEvents = events.filter((event) => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      return startDate <= now && endDate >= now;
    });

    console.log(`${activeEvents.length} aktive Event(s) gefunden`);

    return activeEvents.length > 0;
  } catch (error) {
    console.error("Fehler in isEventActive:", error);
    return false;
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import Head from "next/head";
import dayjs from "dayjs";
import "dayjs/locale/de"; // Import german locale for dayjs
import { EventData } from "@/models/Event"; // Annahme: Pfad zu deinem Model ist korrekt
import {
  Event,
  AccessTime,
  Repeat,
  Schedule,
  ErrorOutline, // Icon für Fehlermeldung
  FiberManualRecord, // Kleineres Icon für "Live"-Status
} from "@mui/icons-material";

// Stelle sicher, dass dayjs auf Deutsch eingestellt ist
dayjs.locale("de");

const ActiveEventPage: NextPage = () => {
  const [loading, setLoading] = useState(true);
  const [activeEvents, setActiveEvents] = useState<EventData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveEvents = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error on new fetch
        const res = await fetch("/api/events"); // Nutze die vorhandene Events-API

        if (!res.ok) {
          // Versuche, eine spezifischere Fehlermeldung zu bekommen, falls möglich
          let errorMsg = "Fehler beim Laden der Events";
          try {
            const errorData = await res.json();
            errorMsg = errorData.message || errorMsg;
          } catch (jsonError) {
            // Ignoriere Fehler beim Parsen der Fehlermeldung
          }
          throw new Error(errorMsg);
        }

        const { events } = await res.json();

        // Filtern der aktiven Events
        const now = dayjs(); // Use dayjs for consistency
        const active = (events || []).filter((event: EventData) => {
          const startDate = dayjs(event.startDate);
          const endDate = dayjs(event.endDate);
          // Event is active if start is in the past (or now) and end is in the future (or now)
          return (
            startDate.isBefore(now.add(1, "second")) &&
            endDate.isAfter(now.subtract(1, "second"))
          );
          // Adding/subtracting a second handles edge cases where now might be *exactly* start/end
        });

        setActiveEvents(active);
      } catch (err: any) {
        console.error("Fehler beim Laden der aktiven Events:", err);
        setError(
          err.message ||
            "Die Event-Daten konnten nicht geladen werden. Bitte versuche es später erneut."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchActiveEvents();
    // Optional: Add a timer to refetch periodically if events can change status frequently
    // const intervalId = setInterval(fetchActiveEvents, 60000); // Fetch every minute
    // return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);

  // Berechnet die verbleibende Zeit bis zum Ende des Events
  const getRemainingTime = (endDate: string | Date) => {
    const end = dayjs(endDate);
    const now = dayjs();

    if (now.isAfter(end)) return "Beendet";

    const diffMinutes = end.diff(now, "minute");
    const diffHours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;

    const parts = [];
    if (diffHours > 0) {
      parts.push(`${diffHours} Stunde${diffHours !== 1 ? "n" : ""}`);
    }
    if (remainingMinutes > 0 || diffHours === 0) {
      // Show minutes if hours are 0 or if there are remaining minutes
      parts.push(
        `${remainingMinutes} Minute${remainingMinutes !== 1 ? "n" : ""}`
      );
    }

    if (parts.length === 0) {
      return "Endet bald"; // If less than a minute remains
    }

    return `Noch ${parts.join(" und ")}`;
  };

  // Formatiert ein Datum für die Anzeige
  const formatDate = (date: string | Date) => {
    return dayjs(date).format("DD.MM.YYYY, HH:mm [Uhr]"); // Slightly more explicit format
  };

  // Berechnet den Fortschritt des Events in Prozent
  const calculateProgress = (
    startDate: string | Date,
    endDate: string | Date
  ) => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const now = dayjs();

    if (now.isBefore(start)) return 0; // Not started yet
    if (now.isAfter(end)) return 100; // Already finished

    const totalDuration = end.diff(start, "millisecond");
    if (totalDuration <= 0) return 100; // Avoid division by zero for zero-duration events

    const elapsed = now.diff(start, "millisecond");
    const progress = Math.floor((elapsed / totalDuration) * 100);

    return Math.min(Math.max(progress, 0), 100); // Clamp between 0 and 100
  };

  // Gibt das Wiederholungslabel zurück
  const getRecurrenceLabel = (recurrence?: string) => {
    const labels: Record<string, string> = {
      daily: "Täglich",
      weekly: "Wöchentlich",
      monthly: "Monatlich",
      quarterly: "Quartalsweise",
      biannually: "Halbjährlich",
      yearly: "Jährlich",
    };
    return recurrence ? labels[recurrence] || recurrence : "Einmalig"; // Default to "Einmalig" if not recurring
  };

  return (
    <>
      <Head>
        <title>Aktive Events | Event Manager</title>
        <meta
          name="description"
          content="Aktuell laufende Events im Überblick"
        />
      </Head>

      {/* Outer container with background and padding */}
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        {/* Inner container for content alignment */}
        <div className="max-w-screen-xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-10 md:mb-12">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Event className="text-blue-600 w-8 h-8 md:w-10 md:h-10" />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">
                Aktive Events
              </h1>
            </div>
            <p className="mt-1 text-base md:text-lg text-gray-500">
              {loading
                ? "Lade Events..."
                : error
                ? "Fehler beim Laden"
                : activeEvents.length > 0
                ? `Hier siehst du ${
                    activeEvents.length
                  } aktuell laufende Event${
                    activeEvents.length !== 1 ? "s" : ""
                  }.`
                : "Momentan finden keine Events statt."}
            </p>
          </div>

          {/* Conditional Rendering: Loading, Error, Empty, Content */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent" />
            </div>
          )}

          {error && !loading && (
            <div className="max-w-2xl mx-auto bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg flex items-center gap-3">
              <ErrorOutline className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-semibold">Fehler</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && activeEvents.length === 0 && (
            <div className="text-center max-w-lg mx-auto bg-white p-8 md:p-12 rounded-xl shadow-sm border border-gray-200">
              <Schedule className="w-16 h-16 mx-auto text-gray-400 mb-5" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Keine aktiven Events gefunden
              </h2>
              <p className="text-gray-500">
                Es gibt derzeit keine laufenden Events. Komm später wieder oder
                prüfe den Eventkalender.
              </p>
            </div>
          )}

          {!loading && !error && activeEvents.length > 0 && (
            // Responsive Grid for Event Cards
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {activeEvents.map((event) => (
                <div
                  key={event._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out border border-gray-100 overflow-hidden flex flex-col group hover:-translate-y-0.5"
                >
                  {/* Progress Bar */}
                  <div className="h-1.5 bg-gray-200 w-full">
                    <div
                      className="h-full bg-blue-500 transition-all duration-500 ease-out"
                      style={{
                        width: `${calculateProgress(
                          event.startDate,
                          event.endDate
                        )}%`,
                      }}
                    />
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-grow flex flex-col">
                    {/* Card Header: Title and Live Badge */}
                    <div className="mb-3">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-lg font-bold text-gray-800 flex-1 mr-2">
                          {event.title}
                        </h3>
                        <span
                          title="Dieses Event läuft gerade"
                          className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          <FiberManualRecord className="w-2 h-2 mr-1 text-green-500" />
                          Live
                        </span>
                      </div>
                    </div>

                    {/* Event Details: Time, Remaining, Recurrence */}
                    <div className="space-y-3 mb-4 text-sm">
                      {/* Time Range */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <AccessTime className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>
                          {formatDate(event.startDate)} -{" "}
                          {formatDate(event.endDate)}
                        </span>
                      </div>

                      {/* Remaining Time */}
                      <div className="flex items-center gap-2">
                        <Schedule className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-blue-600 font-medium">
                          {getRemainingTime(event.endDate)}
                        </span>
                      </div>

                      {/* Recurrence */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Repeat className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>{getRecurrenceLabel(event.recurrence)}</span>
                      </div>
                    </div>

                    {/* Separator */}
                    <hr className="my-3 border-gray-200" />

                    {/* Description */}
                    <div className="text-sm text-gray-500 flex-grow">
                      {" "}
                      {/* Use div instead of p if rendering multiple elements */}
                      {event.description ? (
                        event.description.split("-").map((part, index) => (
                          // React.Fragment wird benötigt, um mehrere Elemente pro Iteration zurückzugeben
                          <React.Fragment key={index}>
                            {/* Füge <br /> und den Bindestrich VOR jedem Teil ein, außer dem ersten */}
                            {index > 0 && (
                              <>
                                <br />-
                              </>
                            )}
                            {/* Gebe den eigentlichen Textteil aus */}
                            {part}
                          </React.Fragment>
                        ))
                      ) : (
                        <span className="italic">
                          Keine Beschreibung verfügbar.
                        </span>
                      )}
                    </div>

                    {/* Optional: Add a Link/Button here if needed */}
                    {/* <div className="mt-4 pt-4 border-t border-gray-200">
                      <a href={`/events/${event._id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Details anzeigen &rarr;
                      </a>
                    </div> */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ActiveEventPage;

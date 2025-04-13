import React, { useEffect, useState } from "react";
import {
  BellIcon,
  DocumentTextIcon,
  HeartIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { GeneratorData } from "@/types";
import dayjs from "dayjs";
import "dayjs/locale/de";
import MoodTachometer from "@/components/moodTachometer/MoodTachometer";
import DailyRewardsWidget from "@/components/dailyRewardsWidget/DailyRewardsWidget";
import DailyTasksWidget from "@/components/dailyTaskWidget/DailyTaskWidget";
import MoodTrackerWidget from "@/components/moodTrackerWidget/MoodTrackerWidget";
import SanctionWidget from "@/components/SanctionWidget/SanctionWidget";

dayjs.locale("de");

interface NewsMessage {
  _id: string;
  title: string;
  createdAt?: string;
  seen: boolean;
}

interface QuickTaskData {
  _id: string;
  title: string;
  createdAt?: string;
  status: "NEW" | "ACCEPTED" | "DONE" | "FAILED";
}

export default function HomePage() {
  // States für Generatoren und News
  const [currentGenerators, setCurrentGenerators] = useState<GeneratorData[]>(
    []
  );
  const [loadingGenerators, setLoadingGenerators] = useState(true);
  const [errorGenerators, setErrorGenerators] = useState<string | null>(null);

  const [newsMessages, setNewsMessages] = useState<NewsMessage[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);

  // States für Quick Tasks - ohne error state
  const [quickTasks, setQuickTasks] = useState<QuickTaskData[]>([]);
  const [loadingQuickTasks, setLoadingQuickTasks] = useState(true);

  // Fetching der Generatoren
  useEffect(() => {
    const fetchGenerators = async () => {
      try {
        const response = await fetch(
          "/api/generator?exclude_status=DONE&exclude_status=DECLINED"
        );
        if (!response.ok)
          throw new Error("Fehler beim Abrufen der Generatoren");
        const data = await response.json();
        if (data.success) {
          setCurrentGenerators(data.data);
        } else {
          throw new Error(data.message || "Fehler bei der Datenverarbeitung");
        }
      } catch (error) {
        setErrorGenerators(
          error instanceof Error ? error.message : "Ein Fehler ist aufgetreten"
        );
      } finally {
        setLoadingGenerators(false);
      }
    };
    fetchGenerators();
  }, []);

  // Fetching der News-Nachrichten
  useEffect(() => {
    const fetchNewsMessages = async () => {
      try {
        // Mehrere Typen per komma-separierter Liste abfragen:
        const response = await fetch("/api/news?limit=20&type=review,failed");
        if (!response.ok) {
          throw new Error("Fehler beim Abrufen der Nachrichten");
        }
        const data = await response.json();
        if (data.success) {
          setNewsMessages(data.data);
        } else {
          throw new Error(data.message || "Fehler bei der Datenverarbeitung");
        }
      } catch (error) {
        setNewsError(
          error instanceof Error ? error.message : "Ein Fehler ist aufgetreten"
        );
      } finally {
        setNewsLoading(false);
      }
    };
    fetchNewsMessages();
  }, []);

  // Fetching der Quick Tasks mit verbesserter Fehlerbehandlung
  useEffect(() => {
    const fetchQuickTasks = async () => {
      try {
        const response = await fetch(
          "/api/quicktasks?status=NEW&status=ACCEPTED"
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setQuickTasks(data.data);
          } else {
            // Fehler leise behandeln, keine Fehlermeldung anzeigen
            console.warn("Konnte Quick Tasks nicht laden:", data.message);
            setQuickTasks([]);
          }
        } else {
          // Fehler leise behandeln, keine Fehlermeldung anzeigen
          console.warn("Fehler beim Abrufen der Quick Tasks");
          setQuickTasks([]);
        }
      } catch (error) {
        // Fehler leise behandeln, keine Fehlermeldung anzeigen
        console.warn("Fehler beim Verarbeiten der Quick Tasks:", error);
        setQuickTasks([]);
      } finally {
        setLoadingQuickTasks(false);
      }
    };
    fetchQuickTasks();
  }, []);

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Lustlevel-Karte */}
        <section className="col-span-full rounded-xl bg-white p-4 shadow-sm md:p-6">
          <div className="mb-4 flex items-center">
            <HeartIcon className="mr-2 h-5 w-5 text-red-500 md:h-6 md:w-6" />
            <h2 className="text-lg font-semibold text-gray-700 md:text-xl">
              Lust-o-meter
            </h2>
          </div>
          <MoodTachometer />
        </section>

        <DailyRewardsWidget />
        <DailyTasksWidget />

        {/* Sanktions-Widget */}
        <SanctionWidget />

        {/* News Section */}
        <section className="col-span-full rounded-xl bg-white p-4 shadow-sm md:p-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center text-lg font-semibold text-gray-700 md:text-xl">
              <BellIcon className="mr-2 h-5 w-5 text-blue-500 md:h-6 md:w-6" />
              News
            </h2>
            <div className="flex gap-2">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                {newsLoading ? "..." : `${newsMessages.length} Nachrichten`}
              </span>
            </div>
          </div>

          {newsError ? (
            <p className="py-4 text-center text-red-500">{newsError}</p>
          ) : (
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {newsLoading ? (
                [...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-lg bg-gray-100"
                  />
                ))
              ) : newsMessages.length === 0 ? (
                <p className="py-4 text-center text-gray-500">
                  Keine Nachrichten gefunden
                </p>
              ) : (
                newsMessages.map((msg) => (
                  <Link
                    key={msg._id}
                    href={`/news/${msg._id}`}
                    className="group block transition-all"
                  >
                    <div className="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50">
                      <div className="min-w-0 pr-2">
                        <p className="truncate text-sm font-medium text-gray-800 md:text-base">
                          {msg.title}
                        </p>
                        <p className="text-xs text-gray-500 md:text-sm">
                          {msg.createdAt
                            ? dayjs(msg.createdAt).format("DD MMM YYYY")
                            : "Kein Datum"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          msg.seen
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {msg.seen ? "Gesehen" : "Nicht gesehen"}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </section>

        {/* Aktive Aufträge Section */}
        <section className="rounded-xl bg-white p-4 shadow-sm md:p-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center text-lg font-semibold text-gray-700 md:text-xl">
              <DocumentTextIcon className="mr-2 h-5 w-5 text-green-500 md:h-6 md:w-6" />
              Aktive Aufträge
            </h2>
            <div className="flex gap-2">
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                {loadingGenerators || loadingQuickTasks
                  ? "..."
                  : `${currentGenerators.length + quickTasks.length} Offen`}
              </span>
            </div>
          </div>

          <div className="max-h-96 space-y-2 overflow-y-auto">
            {loadingGenerators || loadingQuickTasks ? (
              [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-lg bg-gray-100"
                />
              ))
            ) : errorGenerators ? (
              <p className="py-4 text-center text-red-500">{errorGenerators}</p>
            ) : currentGenerators.length === 0 && quickTasks.length === 0 ? (
              <p className="py-4 text-center text-gray-500">
                Keine aktiven Aufträge
              </p>
            ) : (
              <>
                {/* Generators */}
                {currentGenerators.map((generator) => (
                  <Link
                    key={generator._id}
                    href={`/generator/${generator._id}`}
                    className="group block transition-all"
                  >
                    <div className="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50">
                      <div className="min-w-0 pr-2">
                        <p className="truncate text-sm font-medium text-gray-800 md:text-base">
                          {generator.dringlichkeit?.title ||
                            "Unbekannter Kunde"}
                        </p>
                        <div className="mt-1 space-y-1">
                          <p className="text-xs text-gray-500 md:text-sm">
                            Erstellt:{" "}
                            {dayjs(generator.createdAt || new Date()).format(
                              "DD MMM YYYY"
                            )}
                          </p>
                          {generator.blueBalls && (
                            <div className="flex items-center gap-1.5">
                              <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
                              </span>
                              <span className="text-xs font-medium text-blue-600">
                                Special Care Priority
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="inline-flex h-8 items-center rounded-full bg-gray-100 px-3 text-sm font-medium text-gray-600">
                        {generator.status}
                      </span>
                    </div>
                  </Link>
                ))}

                {/* Quick Tasks */}
                {quickTasks.length > 0 &&
                  quickTasks.map((task) => (
                    <Link
                      key={task._id}
                      href={`/quicktask/${task._id}`}
                      className="group block transition-all"
                    >
                      <div className="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50">
                        <div className="min-w-0 pr-2">
                          <p className="truncate text-sm font-medium text-gray-800 md:text-base">
                            {task.title}
                          </p>
                          <div className="mt-1">
                            <p className="text-xs text-gray-500 md:text-sm">
                              Erstellt:{" "}
                              {dayjs(task.createdAt || new Date()).format(
                                "DD MMM YYYY"
                              )}
                            </p>
                          </div>
                        </div>
                        <span className="inline-flex h-8 items-center rounded-full bg-gray-100 px-3 text-sm font-medium text-gray-600">
                          {task.status === "NEW" ? "Neu" : "Angenommen"}
                        </span>
                      </div>
                    </Link>
                  ))}
              </>
            )}
          </div>
        </section>

        <section className="col-span-full rounded-xl bg-white p-4 shadow-sm md:p-6">
          <div className="mb-4 flex items-center">
            <ShieldCheckIcon className="mr-2 h-5 w-5 text-red-500 md:h-6 md:w-6" />
            <h2 className="text-lg font-semibold text-gray-700 md:text-xl">
              Wie fühlst du dich heute?
            </h2>
          </div>
          <MoodTrackerWidget />
        </section>
      </div>
    </div>
  );
}

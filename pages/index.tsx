import React, { useEffect, useState, useMemo } from "react";
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

export type CombinedItem = {
  _id: string;
  title: string;
  createdAt?: string;
  status?: "NEW" | "ACCEPTED" | "DONE" | "FAILED" | "PENDING" | "DECLINED";
  blueBalls?: boolean;
  type: "generator" | "quickTask";
};

export default function HomePage() {
  const [currentGenerators, setCurrentGenerators] = useState<GeneratorData[]>(
    []
  );
  const [loadingGenerators, setLoadingGenerators] = useState(true);
  const [errorGenerators, setErrorGenerators] = useState<string | null>(null);

  const [newsMessages, setNewsMessages] = useState<NewsMessage[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);

  const [quickTasks, setQuickTasks] = useState<QuickTaskData[]>([]);
  const [loadingQuickTasks, setLoadingQuickTasks] = useState(true);

  // Kombiniere Generatoren und Quick Tasks und sortiere nach Datum
  const combinedItems: CombinedItem[] = useMemo(() => {
    // Sichere Array-Prüfung für Generatoren
    const safeGenerators = Array.isArray(currentGenerators) ? currentGenerators : [];
    const gens: CombinedItem[] = safeGenerators.map((g) => ({
      _id: g._id ?? "",
      title: g.dringlichkeit?.title || "Unbekannter Kunde",
      createdAt: g.createdAt,
      status: g.status,
      blueBalls: g.blueBalls,
      type: "generator",
    }));

    // Sichere Array-Prüfung für QuickTasks
    const safeQuickTasks = Array.isArray(quickTasks) ? quickTasks : [];
    const tasks: CombinedItem[] = safeQuickTasks.map((t) => ({
      _id: t._id,
      title: t.title,
      createdAt: t.createdAt,
      status: t.status,
      type: "quickTask",
    }));

    return [...gens, ...tasks].sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );
  }, [currentGenerators, quickTasks]);

  // Fetch Generatoren
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          "/api/gaming?action=generator&exclude_status=DONE&exclude_status=DECLINED"
        );
        if (!res.ok) throw new Error("Fehler beim Abrufen der Generatoren");
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setCurrentGenerators(json.data);
        } else {
          console.warn("Generators API returned non-array data:", json);
          setCurrentGenerators([]);
        }
      } catch (e) {
        setErrorGenerators(e instanceof Error ? e.message : String(e));
      } finally {
        setLoadingGenerators(false);
      }
    })();
  }, []);

  // Fetch News
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/content?type=news&limit=20&category=review,failed");
        if (!res.ok) throw new Error("Fehler beim Abrufen der Nachrichten");
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setNewsMessages(json.data);
        } else {
          console.warn("News API returned non-array data:", json);
          setNewsMessages([]);
        }
      } catch (e) {
        setNewsError(e instanceof Error ? e.message : String(e));
      } finally {
        setNewsLoading(false);
      }
    })();
  }, []);

  // Fetch Quick Tasks
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/content?type=quicktasks&status=NEW&status=ACCEPTED");
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            setQuickTasks(json.data);
          } else {
            console.warn("QuickTasks API returned non-array data:", json);
            setQuickTasks([]);
          }
        } else {
          setQuickTasks([]);
        }
      } catch {
        setQuickTasks([]);
      } finally {
        setLoadingQuickTasks(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-50 px-2 sm:px-4 md:px-8">
      <div className="mx-auto grid max-w-4xl gap-4 grid-cols-1">
        {/* Lust-o-meter */}
        <section className="rounded-xl bg-white p-4 shadow-sm md:p-6 w-full">
          <div className="mb-4 flex items-center">
            <HeartIcon className="mr-2 h-5 w-5 text-red-500 md:h-6 md:w-6" />
            <h2 className="text-lg font-semibold text-gray-700 md:text-xl">
              Lust-o-meter
            </h2>
          </div>
          <MoodTachometer />
        </section>

        <div className="w-full">
          <DailyRewardsWidget />
        </div>
        <div className="w-full">
          <DailyTasksWidget />
        </div>
        <div className="w-full">
          <SanctionWidget />
        </div>

        {/* News Section */}
        <section className="rounded-xl bg-white p-4 shadow-sm md:p-6 w-full">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center text-lg font-semibold text-gray-700 md:text-xl">
              <BellIcon className="mr-2 h-5 w-5 text-blue-500 md:h-6 md:w-6" />
              News
            </h2>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
              {newsLoading ? "..." : `${newsMessages.length} Nachrichten`}
            </span>
          </div>
          {newsError ? (
            <p className="py-4 text-center text-red-500">{newsError}</p>
          ) : (
            <div className="max-h-96 space-y-2 overflow-y-auto w-full">
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
        <section className="rounded-xl bg-white p-4 shadow-sm md:p-6 w-full">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center text-lg font-semibold text-gray-700 md:text-xl">
              <DocumentTextIcon className="mr-2 h-5 w-5 text-green-500 md:h-6 md:w-6" />
              Aktive Aufträge
            </h2>
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
              {loadingGenerators || loadingQuickTasks
                ? "..."
                : combinedItems.length}
            </span>
          </div>
          <div className="max-h-96 space-y-2 overflow-y-auto w-full">
            {loadingGenerators || loadingQuickTasks ? (
              [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-lg bg-gray-100"
                />
              ))
            ) : errorGenerators ? (
              <p className="py-4 text-center text-red-500">{errorGenerators}</p>
            ) : combinedItems.length === 0 ? (
              <p className="py-4 text-center text-gray-500">
                Keine aktiven Aufträge
              </p>
            ) : (
              combinedItems.map((item) =>
                item.type === "generator" ? (
                  <Link
                    key={item._id}
                    href={`/generator/${item._id}`}
                    className="group block transition-all"
                  >
                    <div className="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50">
                      <div className="min-w-0 pr-2">
                        <p className="truncate text-sm font-medium text-gray-800 md:text-base">
                          {item.title}
                        </p>
                        <div className="mt-1 space-y-1">
                          <p className="text-xs text-gray-500 md:text-sm">
                            Erstellt:{" "}
                            {dayjs(item.createdAt || new Date()).format(
                              "DD MMM YYYY"
                            )}
                          </p>
                          {item.blueBalls && (
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
                        {item.status}
                      </span>
                    </div>
                  </Link>
                ) : (
                  <Link
                    key={item._id}
                    href={`/quicktask/${item._id}`}
                    className="group block transition-all"
                  >
                    <div className="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50">
                      <div className="min-w-0 pr-2">
                        <p className="truncate text-sm font-medium text-gray-800 md:text-base">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 md:text-sm">
                          Erstellt:{" "}
                          {dayjs(item.createdAt || new Date()).format(
                            "DD MMM YYYY"
                          )}
                        </p>
                      </div>
                      <span className="inline-flex h-8 items-center rounded-full bg-gray-100 px-3 text-sm font-medium text-gray-600">
                        {item.status === "NEW" ? "Neu" : "Angenommen"}
                      </span>
                    </div>
                  </Link>
                )
              )
            )}
          </div>
        </section>

        {/* Wie fühlst du dich heute? */}
        <section className="rounded-xl bg-white p-4 shadow-sm md:p-6 w-full">
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

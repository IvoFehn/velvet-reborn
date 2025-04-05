/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import Head from "next/head";
import {
  FaceSmileIcon,
  FaceFrownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import "dayjs/locale/de";
import { IMood, MoodFeeling } from "@/models/Mood";

dayjs.locale("de");

// Typdefinitionen
interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface MoodHistoryResponse {
  success: boolean;
  data: IMood[];
  pagination: PaginationData;
  message?: string;
}

const MoodHistoryPage: React.FC = () => {
  const [moodData, setMoodData] = useState<IMood[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit] = useState<number>(20);

  // Datumsfilter
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Lade Stimmungsdaten
  const fetchMoodHistory = async (): Promise<void> => {
    if (status !== "authenticated") return;

    setLoading(true);
    setError(null);

    try {
      // URL mit Query-Parametern
      let url = `/api/mood?page=${page}&limit=${limit}`;

      // Füge Datumsfilter hinzu, wenn vorhanden
      if (startDate && endDate) {
        url += `&start=${startDate}&end=${endDate}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Fehler beim Abrufen der Stimmungsdaten");
      }

      const data: MoodHistoryResponse = await response.json();

      if (data.success) {
        setMoodData(data.data);
        setTotalPages(data.pagination.pages);
      } else {
        throw new Error(data.message || "Ein Fehler ist aufgetreten");
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Ein unbekannter Fehler ist aufgetreten");
      }
    } finally {
      setLoading(false);
    }
  };

  // Lade Daten beim ersten Rendern und bei Änderungen der Abhängigkeiten
  useEffect(() => {
    if (status === "authenticated") {
      fetchMoodHistory();
    }
  }, [status, page, startDate, endDate]);

  // Formatiere das Datum für die Anzeige
  const formatDate = (dateString: string): string => {
    return dayjs(dateString).format("DD.MM.YYYY HH:mm");
  };

  // Stimmungs-Icon
  const MoodIcon: React.FC<{ feeling: MoodFeeling }> = ({ feeling }) => {
    if (feeling === "good") {
      return <FaceSmileIcon className="h-6 w-6 text-green-500" />;
    } else {
      return <FaceFrownIcon className="h-6 w-6 text-red-500" />;
    }
  };

  // Pagination-Steuerung
  const handlePrevPage = (): void => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = (): void => {
    if (page < totalPages) setPage(page + 1);
  };

  // Filter anwenden
  const applyDateFilter = (e: React.FormEvent): void => {
    e.preventDefault();
    fetchMoodHistory();
  };

  // Filter zurücksetzen
  const resetFilter = (): void => {
    setStartDate("");
    setEndDate("");
  };

  // Wenn Benutzer nicht angemeldet ist
  if (status === "unauthenticated") {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-gray-600">
          Bitte melde dich an, um diese Seite zu sehen.
        </p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Stimmungsverlauf | Dashboard</title>
      </Head>

      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-6 text-2xl font-bold text-gray-800 md:text-3xl">
            Stimmungsverlauf
          </h1>

          {/* Filter */}
          <div className="mb-6 rounded-xl bg-white p-4 shadow-sm md:p-6">
            <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-700">
              <CalendarIcon className="mr-2 h-5 w-5 text-blue-500" />
              Zeitraum filtern
            </h2>

            <form
              onSubmit={applyDateFilter}
              className="flex flex-wrap items-end gap-4"
            >
              <div className="w-full sm:w-auto">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Von
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 shadow-sm"
                />
              </div>

              <div className="w-full sm:w-auto">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Bis
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 shadow-sm"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Filtern
                </button>

                <button
                  type="button"
                  onClick={resetFilter}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Zurücksetzen
                </button>
              </div>
            </form>
          </div>

          {/* Stimmungsdaten-Tabelle */}
          <div className="rounded-xl bg-white p-4 shadow-sm md:p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-700">
              Stimmungsverlauf
            </h2>

            {loading ? (
              <div className="py-8 text-center">
                <ArrowPathIcon className="mx-auto h-8 w-8 animate-spin text-blue-500" />
                <p className="mt-2 text-gray-600">Daten werden geladen...</p>
              </div>
            ) : error ? (
              <div className="py-8 text-center">
                <p className="text-red-500">{error}</p>
              </div>
            ) : moodData.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-600">Keine Stimmungsdaten gefunden</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Datum
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Stimmung
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {moodData.map((entry) => (
                        <tr
                          key={String(entry._id)}
                          className="hover:bg-gray-50"
                        >
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                            {formatDate(entry.createdAt.toString())}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm">
                            <div className="flex items-center">
                              <MoodIcon feeling={entry.feeling} />
                              <span className="ml-2 capitalize">
                                {entry.feeling === "good" ? "Gut" : "Schlecht"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                  <div className="text-sm text-gray-600">
                    Seite {page} von {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={page === 1}
                      className={`rounded-lg border p-2 ${
                        page === 1
                          ? "cursor-not-allowed border-gray-200 text-gray-300"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={page === totalPages}
                      className={`rounded-lg border p-2 ${
                        page === totalPages
                          ? "cursor-not-allowed border-gray-200 text-gray-300"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MoodHistoryPage;

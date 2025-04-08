/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import { CalendarIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import "dayjs/locale/de";
import CheckIcon from "@heroicons/react/24/solid/CheckIcon";
import XMarkIcon from "@heroicons/react/24/solid/XMarkIcon";

interface HealthStatus {
  complaint: string;
  analPossible: boolean;
  vaginalPossible: boolean;
  oralPossible: boolean;
}

interface MoodEntry {
  _id: string;
  feeling: "good" | "bad";
  healthStatus?: HealthStatus;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  oldestDate?: string;
}

const AdminHealthReports: React.FC = () => {
  const [reports, setReports] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    hasMore: false,
  });

  const [feelingFilter, setFeelingFilter] = useState<"all" | "good" | "bad">(
    "all"
  );
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [dateFilterActive, setDateFilterActive] = useState<boolean>(false);
  const [onlyWithHealth, setOnlyWithHealth] = useState<boolean>(true);

  const observerTarget = useRef<HTMLDivElement>(null);

  const formatDateForInput = (date: Date): string => {
    return dayjs(date).format("YYYY-MM-DD");
  };

  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    setEndDate(formatDateForInput(end));
    setStartDate(formatDateForInput(start));
  }, []);

  const fetchReports = async (
    append = false,
    beforeDate?: string
  ): Promise<void> => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      let url = `/api/mood?limit=${pagination.limit}&feeling=${feelingFilter}`;

      if (beforeDate) {
        url += `&beforeDate=${beforeDate}`;
      } else if (dateFilterActive) {
        url += `&startDate=${startDate}T00:00:00.000Z&endDate=${endDate}T23:59:59.999Z`;
      }

      const response = await fetch(url);
      if (!response.ok)
        throw new Error("Fehler beim Abrufen der Gesundheitsberichte");

      const data = await response.json();
      if (data.success) {
        if (append) {
          setReports((prev) => [...prev, ...data.data]);
        } else {
          setReports(data.data);
        }
        setPagination(data.pagination);
      } else {
        throw new Error(data.message || "Ein Fehler ist aufgetreten");
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Ein unbekannter Fehler ist aufgetreten"
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [feelingFilter]);

  const applyDateFilter = () => {
    setDateFilterActive(true);
    fetchReports();
  };

  const resetDateFilter = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    setEndDate(formatDateForInput(end));
    setStartDate(formatDateForInput(start));
    setDateFilterActive(false);
    fetchReports();
  };

  const handleLoadMore = () => {
    if (pagination.hasMore && pagination.oldestDate && !loadingMore) {
      fetchReports(true, pagination.oldestDate);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pagination.hasMore && !loadingMore) {
          handleLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [pagination.hasMore, loadingMore]);

  const formatDate = (dateString: string): string => {
    return dayjs(dateString).locale("de").format("DD. MMMM YYYY, HH:mm [Uhr]");
  };

  const PossibilityIndicator: React.FC<{ possible: boolean }> = ({
    possible,
  }) => (
    <span className="flex items-center justify-center w-12">
      {possible ? (
        <CheckIcon className="h-5 w-5 text-emerald-600" />
      ) : (
        <XMarkIcon className="h-5 w-5 text-rose-600" />
      )}
    </span>
  );

  const FeelingIndicator: React.FC<{
    feeling: "good" | "bad";
    isLatest?: boolean;
  }> = ({ feeling, isLatest }) => (
    <div className="flex items-center space-x-2">
      <div
        className={`h-3 w-3 rounded-full ${
          feeling === "good" ? "bg-emerald-500" : "bg-amber-500"
        } ${isLatest ? "ring-4 ring-opacity-40" : ""} ${
          isLatest
            ? feeling === "good"
              ? "ring-emerald-300"
              : "ring-amber-300"
            : ""
        }`}
      />
      <span
        className={`text-sm font-medium ${
          feeling === "good" ? "text-emerald-700" : "text-amber-700"
        }`}
      >
        {feeling === "good" ? "Gut" : "Schlecht"}
        {isLatest && (
          <span className="ml-2 px-2 py-1 bg-blue-50 text-blue-800 text-xs rounded-full border border-blue-200 flex items-center">
            <CheckIcon className="h-4 w-4 mr-1" />
            Aktuell
          </span>
        )}
      </span>
    </div>
  );

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Gesundheitsberichte
          </h1>
          <p className="mt-2 text-gray-600 text-sm md:text-base">
            Verwaltung und Übersicht aller Gesundheitsmeldungen
          </p>
        </div>

        {/* Filter Section */}
        <div className="mb-6 bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Feeling Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Stimmung
              </label>
              <select
                value={feelingFilter}
                onChange={(e) =>
                  setFeelingFilter(e.target.value as "all" | "good" | "bad")
                }
                className="w-full rounded-lg border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="all">Alle anzeigen</option>
                <option value="good">Positive Meldungen</option>
                <option value="bad">Negative Meldungen</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Datumsbereich
              </label>
              <div className="flex flex-col xs:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 pr-10"
                  />
                  <CalendarIcon className="h-5 w-5 text-gray-400 absolute right-3 top-2.5" />
                </div>
                <div className="relative flex-1">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 pr-10"
                  />
                  <CalendarIcon className="h-5 w-5 text-gray-400 absolute right-3 top-2.5" />
                </div>
              </div>
            </div>

            {/* Health Status Filter */}
            <div className="flex items-center md:items-end">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={onlyWithHealth}
                  onChange={(e) => setOnlyWithHealth(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Nur mit Gesundheitsdaten
                </span>
              </label>
            </div>
          </div>

          <div className="mt-4 flex flex-col xs:flex-row gap-2">
            <button
              onClick={applyDateFilter}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Filter anwenden
            </button>
            <button
              onClick={resetDateFilter}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            >
              Zurücksetzen
            </button>
          </div>
        </div>

        {/* Content Section */}
        {loading && !loadingMore && (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg" />
            ))}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && reports.length === 0 && (
          <div className="text-center p-8 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">
              Keine Berichte im ausgewählten Zeitraum
            </p>
          </div>
        )}

        {!loading && !error && reports.length > 0 && (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto pb-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-w-[800px]">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {[
                        "Datum/Uhrzeit",
                        "Status",
                        "Beschreibung",
                        "Anal",
                        "Vaginal",
                        "Oral",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reports.map((report, index) => {
                      const isLatest = index === 0 && !loadingMore;
                      return (
                        <tr
                          key={report._id}
                          className={`hover:bg-gray-50 transition-colors ${
                            isLatest
                              ? "bg-blue-50 border-l-4 border-blue-500"
                              : ""
                          }`}
                        >
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium whitespace-nowrap">
                            {isLatest && (
                              <span className="mr-2 text-blue-500 animate-pulse">
                                ↪
                              </span>
                            )}
                            {formatDate(report.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <FeelingIndicator
                              feeling={report.feeling}
                              isLatest={isLatest}
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 max-w-[300px] 2xl:max-w-[500px] truncate">
                            {report.feeling === "good" &&
                            !report.healthStatus ? (
                              <span className="text-emerald-700">
                                Keine Beschwerden gemeldet
                              </span>
                            ) : (
                              report.healthStatus?.complaint || "-"
                            )}
                          </td>
                          {[
                            "analPossible",
                            "vaginalPossible",
                            "oralPossible",
                          ].map((field) => (
                            <td key={field} className="px-4 py-3">
                              {report.feeling === "good" &&
                              !report.healthStatus ? (
                                <CheckIcon className="h-5 w-5 text-emerald-600" />
                              ) : report.healthStatus ? (
                                <PossibilityIndicator
                                  possible={
                                    report.healthStatus[
                                      field as keyof HealthStatus
                                    ] as boolean
                                  }
                                />
                              ) : (
                                "-"
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile List */}
            <div className="lg:hidden space-y-3">
              {reports.map((report, index) => {
                const isLatest = index === 0 && !loadingMore;
                return (
                  <div
                    key={report._id}
                    className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${
                      isLatest ? "border-l-4 border-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {isLatest && (
                          <span className="mr-2 text-blue-500 animate-pulse">
                            ↪
                          </span>
                        )}
                        {formatDate(report.createdAt)}
                      </span>
                      <FeelingIndicator
                        feeling={report.feeling}
                        isLatest={isLatest}
                      />
                    </div>

                    {report.healthStatus && (
                      <div className="border-t border-gray-100 pt-3">
                        <div className="text-sm text-gray-600 mb-3 truncate">
                          {report.healthStatus.complaint ||
                            "Keine Beschreibung"}
                        </div>
                        <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-3">
                          <div className="text-center">
                            <div className="text-xs text-gray-500 mb-1">
                              Anal
                            </div>
                            <PossibilityIndicator
                              possible={report.healthStatus.analPossible}
                            />
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500 mb-1">
                              Vaginal
                            </div>
                            <PossibilityIndicator
                              possible={report.healthStatus.vaginalPossible}
                            />
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500 mb-1">
                              Oral
                            </div>
                            <PossibilityIndicator
                              possible={report.healthStatus.oralPossible}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Loading More */}
        <div ref={observerTarget} className="mt-6">
          {loadingMore && (
            <div className="flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent" />
            </div>
          )}

          {!loadingMore && pagination.hasMore && (
            <button
              onClick={handleLoadMore}
              className="w-full py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Mehr laden
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHealthReports;

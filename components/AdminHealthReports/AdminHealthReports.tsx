import React, { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
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
  pages: number;
}

const AdminHealthReports: React.FC = () => {
  const [reports, setReports] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });

  // Daten-Fetching
  const fetchReports = async (page = 1): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/mood?page=${page}&limit=10&adminView=true`
      );

      if (!response.ok) {
        throw new Error("Fehler beim Abrufen der Gesundheitsberichte");
      }

      const data = await response.json();

      if (data.success) {
        setReports(data.data);
        setPagination(data.pagination);
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

  // Initialer Abruf der Daten
  useEffect(() => {
    fetchReports();
  }, []);

  // Seitenumbruch-Handler
  const handlePageChange = (newPage: number): void => {
    if (newPage > 0 && newPage <= pagination.pages) {
      fetchReports(newPage);
    }
  };

  // Formatierung des Datums
  const formatDate = (dateString: string): string => {
    return dayjs(dateString).locale("de").format("DD. MMMM YYYY, HH:mm [Uhr]");
  };

  const PossibilityIndicator: React.FC<{ possible: boolean }> = ({
    possible,
  }) => (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        possible ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-700"
      }`}
    >
      {possible ? (
        <CheckIcon className="h-3 w-3 mr-1" />
      ) : (
        <XMarkIcon className="h-3 w-3 mr-1" />
      )}
      {possible ? "Ja" : "Nein"}
    </span>
  );

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 bg-white rounded-xl shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Gesundheitsberichte
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Übersicht aller gemeldeten Gesundheitszustände bei schlechter
          Stimmung.
        </p>
      </div>

      {loading && (
        <div className="my-8 flex justify-center">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 text-sm text-rose-700 bg-rose-50 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div className="my-8 text-center p-6 bg-gray-50 rounded-lg">
          <span className="text-gray-500">Keine Berichte gefunden</span>
        </div>
      )}

      {!loading && !error && reports.length > 0 && (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Beschwerde
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Anal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vaginal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Oral
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report._id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">
                      {report.healthStatus?.complaint || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <PossibilityIndicator
                        possible={report.healthStatus?.analPossible ?? false}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <PossibilityIndicator
                        possible={report.healthStatus?.vaginalPossible ?? false}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <PossibilityIndicator
                        possible={report.healthStatus?.oralPossible ?? false}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {reports.map((report) => (
              <div
                key={report._id}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
              >
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(report.createdAt)}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Beschwerde:</span>{" "}
                    {report.healthStatus?.complaint || "-"}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <div>
                      <span className="text-xs text-gray-500 mr-1">Anal:</span>
                      <PossibilityIndicator
                        possible={report.healthStatus?.analPossible ?? false}
                      />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 mr-1">
                        Vaginal:
                      </span>
                      <PossibilityIndicator
                        possible={report.healthStatus?.vaginalPossible ?? false}
                      />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 mr-1">Oral:</span>
                      <PossibilityIndicator
                        possible={report.healthStatus?.oralPossible ?? false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="flex-1 md:hidden">
            <div className="flex justify-between">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Zurück
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Seite {pagination.page}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Weiter
              </button>
            </div>
          </div>

          <div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
            <p className="text-sm text-gray-700">
              Zeige{" "}
              <span className="font-medium">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              bis{" "}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              von <span className="font-medium">{pagination.total}</span>{" "}
              Ergebnissen
            </p>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                    pagination.page === i + 1
                      ? "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHealthReports;

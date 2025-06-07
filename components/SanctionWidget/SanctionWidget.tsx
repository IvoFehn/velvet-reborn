// components/sanctionWidget/SanctionWidget.tsx
import React, { useState, useEffect } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import dayjs from "dayjs";
import "dayjs/locale/de";
import { ISanction } from "@/types/index";
import WarningDialog from "../WarningDialog.tsx/WarningDialog";

dayjs.locale("de");

const SanctionWidget: React.FC = () => {
  const [latestSanction, setLatestSanction] = useState<ISanction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasActiveWarning, setHasActiveWarning] = useState<boolean>(false);

  // Check for active warnings
  useEffect(() => {
    const checkForWarnings = async () => {
      try {
        const response = await fetch("/api/system?module=warnings");

        if (!response.ok) {
          throw new Error("Fehler beim Abrufen der Warnungen");
        }

        const data = await response.json();
        setHasActiveWarning(data.data && data.data.length > 0);
      } catch (error) {
        console.error("Fehler beim Prüfen auf Warnungen:", error);
      }
    };

    checkForWarnings();
  }, []);

  // Laden der neuesten Sanktion
  useEffect(() => {
    const fetchLatestSanction = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/content?type=sanctions&size=1");

        if (!response.ok) {
          throw new Error("Fehler beim Abrufen der Sanktion");
        }

        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setLatestSanction(data.data[0]);
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Ein Fehler ist aufgetreten"
        );
        console.error("Fehler beim Laden der neuesten Sanktion:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestSanction();
  }, []);

  // Status Badge basierend auf dem Status der Sanktion
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "offen":
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
            <span className="mr-1 h-1.5 w-1.5 rounded-full bg-yellow-500"></span>
            Offen
          </span>
        );
      case "erledigt":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500"></span>
            Erledigt
          </span>
        );
      case "eskaliert":
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
            <span className="mr-1 h-1.5 w-1.5 rounded-full bg-red-500"></span>
            Eskaliert
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            <span className="mr-1 h-1.5 w-1.5 rounded-full bg-gray-500"></span>
            {status}
          </span>
        );
    }
  };

  // Verbleibende Zeit berechnen
  const calculateTimeRemaining = (deadline: Date | string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();

    if (diff <= 0) return "Abgelaufen";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} Tag(e), ${hours} Std.`;

    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours} Std., ${minutes} Min.` : `${minutes} Minuten`;
  };

  // Zum Tickets-System navigieren und einen Antrag erstellen
  const handleCreateRequest = () => {
    // Navigiere zur Tickets-Seite mit extra Parameter für die Sanktion
    window.location.href = `/tickets?view=CREATE&subject=Sanktionen&sanctionId=${latestSanction?._id}`;
  };

  return (
    <>
      {hasActiveWarning && <WarningDialog />}

      <section className="rounded-xl bg-white p-4 shadow-sm md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="mr-2 h-5 w-5 text-amber-500 md:h-6 md:w-6" />
            <h2 className="text-lg font-semibold text-gray-700 md:text-xl">
              Aktuelle Sanktion
            </h2>
          </div>
          <Link
            href="/sanctions"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Alle anzeigen
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : error ? (
          <div className="rounded-lg bg-red-50 p-4 text-center text-red-800">
            {error}
          </div>
        ) : !latestSanction ? (
          <div className="rounded-lg bg-gray-50 p-4 text-center text-gray-500">
            Keine Sanktionen vorhanden
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  {latestSanction.title}
                </h3>
                {getStatusBadge(latestSanction.status)}
              </div>

              <p className="mb-3 text-sm text-gray-600">
                {latestSanction.description}
              </p>

              {/* Begründung anzeigen, falls vorhanden */}
              {latestSanction.reason && (
                <div className="mb-3 text-sm text-blue-800 bg-blue-50 rounded px-2 py-1">
                  <span className="font-medium">Begründung:</span>{" "}
                  {latestSanction.reason}
                </div>
              )}

              <div className="mb-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Aufgabe:</span>{" "}
                  {latestSanction.task}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Menge:</span>{" "}
                  {latestSanction.amount} {latestSanction.unit}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Kategorie:</span>{" "}
                  {latestSanction.category}
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Schweregrad:
                  </span>{" "}
                  {latestSanction.severity} / 5
                </div>
              </div>

              {latestSanction.status !== "erledigt" && (
                <div className="mt-2 mb-4 flex items-center gap-1 text-sm">
                  <span className="font-medium text-gray-700">Frist:</span>
                  <span
                    className={
                      new Date(latestSanction.deadline) < new Date()
                        ? "text-red-600 font-medium"
                        : "text-gray-600"
                    }
                  >
                    {calculateTimeRemaining(latestSanction.deadline)}
                  </span>
                </div>
              )}

              <div className="mt-3 flex justify-end gap-2">
                <Link
                  href={`/sanctions/${latestSanction._id}`}
                  className="rounded bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  Details
                </Link>

                <button
                  onClick={handleCreateRequest}
                  className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Antrag stellen
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default SanctionWidget;

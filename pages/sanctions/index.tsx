import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import dayjs from "dayjs";
import "dayjs/locale/de";
import {
  ExclamationTriangleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

dayjs.locale("de");

interface Sanction {
  _id: string;
  title: string;
  description?: string;
  task: string;
  severity: number;
  amount: number;
  unit: string;
  status: "offen" | "erledigt" | "eskaliert" | "abgelaufen";
  createdAt: string;
  deadline: Date;
  escalationFactor: number;
  escalationCount: number;
  category: string;
}

export default function SanctionsPage() {
  const [sanctions, setSanctions] = useState<Sanction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"offen" | "erledigt" | "alle">(
    "offen"
  );

  // Laden der Sanktionen
  useEffect(() => {
    const fetchSanctions = async () => {
      try {
        setLoading(true);
        const statusParam = activeTab !== "alle" ? `?status=${activeTab}` : "";
        const response = await fetch(`/api/sanctions${statusParam}`);

        if (!response.ok) {
          throw new Error("Fehler beim Abrufen der Sanktionen");
        }

        const data = await response.json();
        if (data.success) {
          setSanctions(data.data || []);
        } else {
          throw new Error(data.message || "Fehler bei der Datenverarbeitung");
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Ein Fehler ist aufgetreten"
        );
        console.error("Fehler beim Laden der Sanktionen:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSanctions();
  }, [activeTab]);

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
  const handleCreateRequest = (id: string) => {
    window.location.href = `/tickets?view=CREATE&subject=Sanktionen&sanctionId=${id}`;
  };

  return (
    <>
      <Head>
        <title>Sanktionen | Übersicht</title>
        <meta name="description" content="Übersicht aller Sanktionen" />
      </Head>

      <div className="mx-auto min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/*্র

          {/* Header Section */}
          <div className="flex flex-col justify-between gap-4 py-8 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="rounded-lg bg-white p-2 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Sanktionen
              </h1>
            </div>
            <Link
              href="/tickets?view=CREATE&subject=Sanktionen"
              className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            >
              Neuer Antrag
            </Link>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <nav className="flex space-x-4" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("offen")}
                className={`${
                  activeTab === "offen"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                } rounded-md px-3 py-2 text-sm font-medium transition-colors`}
              >
                Offen
              </button>
              <button
                onClick={() => setActiveTab("erledigt")}
                className={`${
                  activeTab === "erledigt"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                } rounded-md px-3 py-2 text-sm font-medium transition-colors`}
              >
                Erledigt
              </button>
              <button
                onClick={() => setActiveTab("alle")}
                className={`${
                  activeTab === "alle"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                } rounded-md px-3 py-2 text-sm font-medium transition-colors`}
              >
                Alle
              </button>
            </nav>
          </div>

          {/* Content Section */}
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
          ) : sanctions.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center shadow-sm">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Keine Sanktionen gefunden
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Es wurden keine Sanktionen für diese Ansicht gefunden.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sanctions.map((sanction) => (
                <div
                  key={sanction._id}
                  className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md"
                >
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {sanction.title}
                      </h2>
                      <div className="ml-2">
                        {getStatusBadge(sanction.status)}
                      </div>
                    </div>

                    {sanction.description && (
                      <p className="mt-3 line-clamp-3 text-sm text-gray-600">
                        {sanction.description}
                      </p>
                    )}

                    <div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-700">
                          Aufgabe
                        </span>
                        <span className="text-gray-600">{sanction.task}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-700">Menge</span>
                        <span className="text-gray-600">
                          {sanction.amount} {sanction.unit}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-700">
                          Kategorie
                        </span>
                        <span className="text-gray-600">
                          {sanction.category}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-700">
                          Schweregrad
                        </span>
                        <span className="text-gray-600">
                          {sanction.severity}/5
                        </span>
                      </div>
                    </div>

                    {sanction.status !== "erledigt" && (
                      <div className="mt-4 flex items-center justify-between rounded-md bg-yellow-50 p-3">
                        <span className="text-sm font-medium text-yellow-800">
                          Frist:
                        </span>
                        <span
                          className={`text-sm ${
                            new Date(sanction.deadline) < new Date()
                              ? "font-semibold text-red-600"
                              : "text-yellow-700"
                          }`}
                        >
                          {calculateTimeRemaining(sanction.deadline)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col border-t border-gray-200 sm:flex-row">
                    <Link
                      href={`/sanctions/${sanction._id}`}
                      className="flex-1 border-b border-gray-200 px-4 py-3 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:border-b-0 sm:border-r"
                    >
                      Details anzeigen
                    </Link>
                    <button
                      onClick={() => handleCreateRequest(sanction._id)}
                      className="flex-1 px-4 py-3 text-center text-sm font-medium text-blue-700 transition-colors hover:bg-gray-50"
                    >
                      Antrag stellen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import "dayjs/locale/de";
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
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

export default function SanctionDetailPage() {
  const router = useRouter();
  const { sanctionsFrontendId } = router.query; // Änderung von id zu sanctionsFrontendId

  const [sanction, setSanction] = useState<Sanction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Laden der Sanktionsdetails
  useEffect(() => {
    const fetchSanction = async () => {
      if (!sanctionsFrontendId) return; // Änderung von id zu sanctionsFrontendId

      try {
        setLoading(true);
        const response = await fetch(`/api/sanctions/${sanctionsFrontendId}`); // Änderung von id zu sanctionsFrontendId

        if (!response.ok) {
          throw new Error("Fehler beim Abrufen der Sanktionsdetails");
        }

        const data = await response.json();
        if (data.success) {
          setSanction(data.data);
        } else {
          throw new Error(data.message || "Fehler bei der Datenverarbeitung");
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Ein Fehler ist aufgetreten"
        );
        console.error("Fehler beim Laden der Sanktionsdetails:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSanction();
  }, [sanctionsFrontendId]); // Änderung von id zu sanctionsFrontendId

  // Ticket für eine Sanktion erstellen
  const handleCreateRequest = () => {
    if (!sanction) return;
    router.push(
      `/tickets?view=CREATE&subject=Sanktionen&sanctionId=${sanction._id}`
    );
  };

  // Verbleibende Zeit berechnen
  const calculateTimeRemaining = (deadline: Date | string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();

    if (diff <= 0) return "Abgelaufen";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let timeString = "";
    if (days > 0) timeString += `${days} Tag${days !== 1 ? "e" : ""} `;
    if (hours > 0 || days > 0)
      timeString += `${hours} Stunde${hours !== 1 ? "n" : ""} `;
    timeString += `${minutes} Minute${minutes !== 1 ? "n" : ""}`;

    return timeString.trim();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (error || !sanction) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-md rounded-lg bg-red-50 p-8 text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
          <h1 className="mt-3 text-lg font-medium text-red-800">
            {error || "Sanktion konnte nicht gefunden werden"}
          </h1>
          <p className="mt-2 text-sm text-red-700">
            Bitte versuchen Sie es später erneut oder kehren Sie zur Übersicht
            zurück.
          </p>
          <div className="mt-6">
            <Link
              href="/sanctions"
              className="rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-200"
            >
              Zurück zur Übersicht
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Status-Informationen
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "offen":
        return {
          badge: (
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
              <span className="mr-1.5 h-2 w-2 rounded-full bg-yellow-400"></span>
              Offen
            </span>
          ),
          description:
            "Diese Sanktion ist offen und muss noch erledigt werden.",
        };
      case "erledigt":
        return {
          badge: (
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
              <span className="mr-1.5 h-2 w-2 rounded-full bg-green-400"></span>
              Erledigt
            </span>
          ),
          description: "Diese Sanktion wurde erfolgreich erledigt.",
        };
      case "eskaliert":
        return {
          badge: (
            <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
              <span className="mr-1.5 h-2 w-2 rounded-full bg-red-400"></span>
              Eskaliert
            </span>
          ),
          description:
            "Diese Sanktion wurde eskaliert, da sie nicht rechtzeitig erledigt wurde.",
        };
      default:
        return {
          badge: (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
              <span className="mr-1.5 h-2 w-2 rounded-full bg-gray-400"></span>
              {status}
            </span>
          ),
          description: "Status der Sanktion.",
        };
    }
  };

  const statusInfo = getStatusInfo(sanction.status);
  const isExpired =
    sanction.status !== "erledigt" && new Date(sanction.deadline) < new Date();

  return (
    <>
      <Head>
        <title>{sanction.title} | Sanktionsdetails</title>
        <meta
          name="description"
          content={`Details zur Sanktion: ${sanction.title}`}
        />
      </Head>

      <div className="container mx-auto px-4 py-8">
        {/* Header mit Navigation */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/sanctions"
            className="rounded-full bg-gray-100 p-2 text-gray-600 transition hover:bg-gray-200"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Sanktionsdetails</h1>
        </div>

        <div className="mx-auto max-w-3xl">
          {/* Hauptinformationen */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  {sanction.title}
                </h2>
                {statusInfo.badge}
              </div>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {statusInfo.description}
              </p>
            </div>

            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Aufgabe</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {sanction.task}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Menge/Dauer
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {sanction.amount} {sanction.unit}
                    {sanction.escalationCount > 0 && (
                      <span className="ml-2 text-red-600">
                        (+{sanction.escalationCount * sanction.escalationFactor}{" "}
                        eskaliert)
                      </span>
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Kategorie
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {sanction.category}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Schweregrad
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div className="flex items-center">
                      <span className="mr-2">{sanction.severity} / 5</span>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={
                              i < sanction.severity
                                ? "text-amber-400"
                                : "text-gray-300"
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Erstellt am
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {dayjs(sanction.createdAt).format("DD. MMMM YYYY")}
                  </dd>
                </div>

                {sanction.status !== "erledigt" && (
                  <div className={isExpired ? "col-span-full" : ""}>
                    <dt className="text-sm font-medium text-gray-500">Frist</dt>
                    <dd
                      className={`mt-1 flex items-center text-sm ${
                        isExpired ? "text-red-600" : "text-gray-900"
                      }`}
                    >
                      <ClockIcon className="mr-1.5 h-4 w-4" />
                      {isExpired ? (
                        <span className="font-medium">
                          Abgelaufen am{" "}
                          {dayjs(sanction.deadline).format("DD. MMMM YYYY")}
                        </span>
                      ) : (
                        <>
                          Noch {calculateTimeRemaining(sanction.deadline)}{" "}
                          verbleibend
                          <span className="ml-1.5 text-xs text-gray-500">
                            (bis{" "}
                            {dayjs(sanction.deadline).format("DD. MMMM YYYY")})
                          </span>
                        </>
                      )}
                    </dd>
                  </div>
                )}

                {sanction.description && (
                  <div className="col-span-full">
                    <dt className="text-sm font-medium text-gray-500">
                      Beschreibung
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {sanction.description}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Aktionsbereich */}
            <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  {sanction.status === "erledigt" ? (
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircleIcon className="mr-1.5 h-5 w-5" />
                      <span>Bereits als erledigt markiert</span>
                    </div>
                  ) : isExpired ? (
                    <div className="text-sm text-red-600">
                      Diese Sanktion ist überfällig und könnte eskaliert werden.
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Beantragen Sie die Überprüfung dieser Sanktion wenn Sie
                      fertig sind.
                    </div>
                  )}
                </div>
                <button
                  onClick={handleCreateRequest}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Antrag stellen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

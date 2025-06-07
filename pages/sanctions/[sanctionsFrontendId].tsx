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
  reason?: string;
}

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <dt className="mb-1 text-sm font-medium text-gray-500">{children}</dt>
);

const Value: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <dd className="text-lg text-gray-900">{children}</dd>
);

export default function SanctionDetailPage() {
  const router = useRouter();
  const { sanctionsFrontendId } = router.query;

  const [sanction, setSanction] = useState<Sanction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    const fetchSanction = async () => {
      if (!sanctionsFrontendId) {
        setError("Keine Sanktions-ID angegeben");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/content?type=sanctions&id=${sanctionsFrontendId}`);
        if (!response.ok) {
          throw new Error("Fehler beim Abrufen der Sanktionsdetails");
        }
        const data = await response.json();
        if (data.data) {
          setSanction(data.data.sanction);
        } else {
          throw new Error(data.error?.message || "Fehler bei der Datenverarbeitung");
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Ein Fehler ist aufgetreten"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSanction();
  }, [router.isReady, sanctionsFrontendId]);

  const handleCreateRequest = () => {
    if (!sanction) return;
    router.push(
      `/tickets?view=CREATE&subject=Sanktionen&sanctionId=${sanction._id}`
    );
  };

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

  const getStatusInfo = (status: string) => {
    const baseStyle =
      "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium";

    switch (status) {
      case "offen":
        return {
          badge: (
            <span className={`${baseStyle} bg-yellow-100 text-yellow-800`}>
              <span className="mr-2 h-2 w-2 rounded-full bg-yellow-500" />
              Offen
            </span>
          ),
          description:
            "Diese Sanktion ist offen und muss noch erledigt werden.",
        };
      case "erledigt":
        return {
          badge: (
            <span className={`${baseStyle} bg-green-100 text-green-800`}>
              <span className="mr-2 h-2 w-2 rounded-full bg-green-500" />
              Erledigt
            </span>
          ),
          description: "Diese Sanktion wurde erfolgreich erledigt.",
        };
      case "eskaliert":
        return {
          badge: (
            <span className={`${baseStyle} bg-red-100 text-red-800`}>
              <span className="mr-2 h-2 w-2 rounded-full bg-red-500" />
              Eskaliert
            </span>
          ),
          description:
            "Diese Sanktion wurde eskaliert, da sie nicht rechtzeitig erledigt wurde.",
        };
      default:
        return {
          badge: (
            <span className={`${baseStyle} bg-gray-100 text-gray-800`}>
              <span className="mr-2 h-2 w-2 rounded-full bg-gray-500" />
              {status}
            </span>
          ),
          description: "Status der Sanktion.",
        };
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (error || !sanction) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="mx-auto max-w-md rounded-xl bg-white p-8 text-center shadow-sm">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
          <h1 className="mt-4 text-lg font-medium text-gray-900">
            {error || "Sanktion konnte nicht gefunden werden"}
          </h1>
          <p className="mt-2 text-gray-600">
            Bitte versuchen Sie es später erneut oder kehren Sie zur Übersicht
            zurück.
          </p>
          <div className="mt-6">
            <Link
              href="/sanctions"
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Zurück zur Übersicht
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/sanctions"
                className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                <ArrowLeftIcon className="mr-2 h-5 w-5" />
                Zurück zur Übersicht
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {statusInfo.badge}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                <div className="bg-white p-6">
                  <div className="border-b border-gray-100 pb-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {sanction.title}
                    </h1>
                    {sanction.description && (
                      <p className="mt-2 text-gray-600">
                        {sanction.description}
                      </p>
                    )}
                    {sanction.reason && (
                      <div className="mt-2 text-blue-800 bg-blue-50 rounded px-2 py-1 text-sm">
                        <span className="font-medium">Begründung:</span>{" "}
                        {sanction.reason}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-6 py-6 sm:grid-cols-2">
                    <div>
                      <Label>Kategorie</Label>
                      <Value>{sanction.category}</Value>
                    </div>
                    <div>
                      <Label>Erstellt am</Label>
                      <Value>
                        {dayjs(sanction.createdAt).format("DD. MMMM YYYY")}
                      </Value>
                    </div>
                    <div>
                      <Label>Aufgabe</Label>
                      <Value>{sanction.task}</Value>
                    </div>
                    <div>
                      <Label>Menge/Dauer</Label>
                      <Value>
                        {sanction.amount} {sanction.unit}
                        {sanction.escalationCount > 0 && (
                          <span className="ml-2 text-red-600">
                            (+
                            {sanction.escalationCount *
                              sanction.escalationFactor}{" "}
                            eskaliert)
                          </span>
                        )}
                      </Value>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900">
                  Schweregrad
                </h3>
                <div className="mt-4 flex items-center">
                  <div className="flex text-blue-500">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-2xl ${
                          i < sanction.severity
                            ? "text-blue-600"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="ml-3 text-sm text-gray-600">
                    ({sanction.severity}/5)
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900">Frist</h3>
                <div
                  className={`mt-4 flex items-center ${
                    isExpired ? "text-red-600" : "text-gray-700"
                  }`}
                >
                  <ClockIcon className="mr-2 h-6 w-6" />
                  <div>
                    <p className="font-medium">
                      {isExpired ? "Abgelaufen am" : "Fällig am"}{" "}
                      {dayjs(sanction.deadline).format("DD. MMMM YYYY")}
                    </p>
                    {!isExpired && (
                      <p className="text-sm">
                        Noch {calculateTimeRemaining(sanction.deadline)}{" "}
                        verbleibend
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-medium text-gray-900">
                  Aktionen
                </h3>
                {sanction.status === "erledigt" ? (
                  <div className="flex items-center rounded-lg bg-green-50 p-4">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    <span className="ml-3 text-sm text-green-700">
                      Diese Sanktion wurde erfolgreich abgeschlossen
                    </span>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">
                      {isExpired
                        ? "Diese Sanktion ist überfällig. Bitte ergreifen Sie umgehend Maßnahmen."
                        : "Bitte stellen Sie einen Antrag zur Überprüfung, sobald Sie die Sanktion erfüllt haben."}
                    </p>
                    <button
                      onClick={handleCreateRequest}
                      className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Antrag stellen
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

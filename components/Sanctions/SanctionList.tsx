// components/admin/SanctionsList.tsx
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  RefreshCw,
  Loader2,
  CheckCircle,
  Trash2,
  AlertTriangle,
  ArrowUpCircle,
} from "lucide-react";
import { ISanction } from "@/types/index";
import {
  completeSanction,
  deleteSanction,
  escalateSanction,
} from "@/util/sanctionUtils";
import { sendTelegramMessage } from "@/util/sendTelegramMessage";

interface SanctionsListProps {
  sanctions: ISanction[];
  loading: boolean;
  onRefresh: () => void;
}

const SanctionsList: React.FC<SanctionsListProps> = ({
  sanctions,
  loading,
  onRefresh,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>("alle");
  const [selectedCategory, setSelectedCategory] = useState<string>("alle");
  const [actionLoading, setActionLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [error, setError] = useState<string | null>(null);

  // Filter sanctions based on status and category
  const filteredSanctions = sanctions.filter((sanction) => {
    const statusMatch =
      selectedStatus === "alle" || sanction.status === selectedStatus;
    const categoryMatch =
      selectedCategory === "alle" || sanction.category === selectedCategory;
    return statusMatch && categoryMatch;
  });

  // Sort by status and then by creation date (newest first)
  const sortedSanctions = [...filteredSanctions].sort((a, b) => {
    const statusOrder = { offen: 0, eskaliert: 1, erledigt: 2, abgelaufen: 3 };
    const statusDiff =
      statusOrder[a.status as keyof typeof statusOrder] -
      statusOrder[b.status as keyof typeof statusOrder];

    if (statusDiff !== 0) return statusDiff;

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Complete a sanction
  const handleComplete = async (sanctionId: string, sanctionTitle: string) => {
    try {
      setActionLoading({ ...actionLoading, [sanctionId]: true });
      setError(null);
      await completeSanction(sanctionId);

      // Telegram-Benachrichtigung senden
      try {
        const dayjs = await import("dayjs");
        await import("dayjs/locale/de");

        await sendTelegramMessage(
          "user",
          `Sanktion "${sanctionTitle}" als erledigt markiert am ${dayjs
            .default()
            .locale("de")
            .format("DD.MM.YYYY HH:mm:ss")}`
        );
      } catch (telegramError) {
        console.error(
          "Fehler beim Senden der Telegram-Nachricht:",
          telegramError
        );
        // Die Aktion wurde trotzdem durchgeführt, wir zeigen keinen Fehler an
      }

      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setActionLoading({ ...actionLoading, [sanctionId]: false });
    }
  };

  // Escalate a sanction
  const handleEscalate = async (sanctionId: string, sanctionTitle: string) => {
    try {
      setActionLoading({ ...actionLoading, [sanctionId]: true });
      setError(null);
      await escalateSanction(sanctionId);

      // Telegram-Benachrichtigung senden
      try {
        const dayjs = await import("dayjs");
        await import("dayjs/locale/de");

        await sendTelegramMessage(
          "user",
          `Sanktion "${sanctionTitle}" wurde eskaliert am ${dayjs
            .default()
            .locale("de")
            .format("DD.MM.YYYY HH:mm:ss")}`
        );
      } catch (telegramError) {
        console.error(
          "Fehler beim Senden der Telegram-Nachricht:",
          telegramError
        );
        // Die Aktion wurde trotzdem durchgeführt, wir zeigen keinen Fehler an
      }

      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setActionLoading({ ...actionLoading, [sanctionId]: false });
    }
  };

  // Delete a sanction
  const handleDelete = async (sanctionId: string, sanctionTitle: string) => {
    try {
      setActionLoading({ ...actionLoading, [sanctionId]: true });
      setError(null);
      await deleteSanction(sanctionId);

      // Telegram-Benachrichtigung senden
      try {
        const dayjs = await import("dayjs");
        await import("dayjs/locale/de");

        await sendTelegramMessage(
          "user",
          `Sanktion "${sanctionTitle}" gelöscht am ${dayjs
            .default()
            .locale("de")
            .format("DD.MM.YYYY HH:mm:ss")}`
        );
      } catch (telegramError) {
        console.error(
          "Fehler beim Senden der Telegram-Nachricht:",
          telegramError
        );
        // Die Aktion wurde trotzdem durchgeführt, wir zeigen keinen Fehler an
      }

      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setActionLoading({ ...actionLoading, [sanctionId]: false });
    }
  };

  // Calculate remaining time
  const calculateTimeRemaining = (deadline: Date | string): string => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();

    if (diff <= 0) return "Abgelaufen";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} Tag(e), ${hours} Std.`;

    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours} Std., ${minutes} Min.`;

    return `${minutes} Minute(n)`;
  };

  // Status colors and icons
  const statusColors = {
    offen: "bg-blue-100 text-blue-800",
    erledigt: "bg-green-100 text-green-800",
    eskaliert: "bg-red-100 text-red-800",
    abgelaufen: "bg-amber-100 text-amber-800",
  };

  const categoryIcons = {
    Hausarbeit: "🧹",
    Lernen: "📚",
    Sport: "🏋️",
    Soziales: "👥",
    Sonstiges: "📝",
  };

  // Severity indicator component
  const SeverityIndicator = ({ severity }: { severity: number }) => (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`h-2 w-2 rounded-full ${
            i < severity ? "bg-amber-500" : "bg-gray-200"
          }`}
        />
      ))}
    </div>
  );

  // Time remaining component
  const TimeRemaining = ({ deadline }: { deadline: Date | string }) => {
    const remaining = calculateTimeRemaining(deadline);
    const isUrgent =
      remaining.includes("Minute") || remaining.includes("Abgelaufen");

    return (
      <div
        className={`flex items-center ${
          isUrgent ? "text-red-600" : "text-gray-600"
        }`}
      >
        {isUrgent && <AlertTriangle className="h-4 w-4 mr-1" />}
        <span className="text-sm font-medium">{remaining}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Sanktionsverwaltung
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Aktive und abgeschlossene Maßnahmen
          </p>
        </div>

        <Button
          variant="outline"
          onClick={onRefresh}
          className="w-full md:w-auto"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Aktualisieren
        </Button>
      </div>

      {/* Filter section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status filtern" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800">
            <SelectItem value="alle">Alle Status</SelectItem>
            <SelectItem value="offen">Offen</SelectItem>
            <SelectItem value="eskaliert">Eskaliert</SelectItem>
            <SelectItem value="erledigt">Erledigt</SelectItem>
            <SelectItem value="abgelaufen">Abgelaufen</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Kategorie filtern" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800">
            <SelectItem value="alle">Alle Kategorien</SelectItem>
            {Object.entries(categoryIcons).map(([key, icon]) => (
              <SelectItem key={key} value={key}>
                {icon} {key}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 p-4 rounded-lg flex items-center text-red-600">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : /* Empty state */
      filteredSanctions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Keine Sanktionen gefunden</p>
        </div>
      ) : (
        /* Sanctions grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedSanctions.map((sanction) => (
            <Card
              key={sanction._id.toString()}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-4 space-y-4">
                {/* Card header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{sanction.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statusColors[
                            sanction.status as keyof typeof statusColors
                          ]
                        }`}
                      >
                        {sanction.status}
                      </span>
                      {sanction.escalationCount > 0 && (
                        <span className="text-xs text-red-500">
                          (+{sanction.escalationCount})
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-2xl">
                    {
                      categoryIcons[
                        sanction.category as keyof typeof categoryIcons
                      ]
                    }
                  </span>
                </div>

                {/* Card details */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Menge</span>
                    <span className="font-medium">
                      {sanction.amount} {sanction.unit}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Schweregrad</span>
                    <SeverityIndicator severity={sanction.severity} />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Fälligkeit</span>
                    <TimeRemaining deadline={sanction.deadline} />
                  </div>

                  {/* Begründung anzeigen, falls vorhanden */}
                  {sanction.reason && (
                    <div className="flex items-start gap-2 mt-2">
                      <span className="text-sm text-gray-500">Begründung:</span>
                      <span className="text-sm text-gray-800 dark:text-gray-200">
                        {sanction.reason}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card actions */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  {sanction.status !== "erledigt" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleComplete(
                            sanction._id.toString(),
                            sanction.title
                          )
                        }
                        disabled={actionLoading[sanction._id.toString()]}
                        className="text-green-600 hover:bg-green-50"
                      >
                        {actionLoading[sanction._id.toString()] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Erledigen
                          </>
                        )}
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-amber-600 hover:bg-amber-50"
                            disabled={actionLoading[sanction._id.toString()]}
                          >
                            <ArrowUpCircle className="h-4 w-4 mr-2" />
                            Escalate
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white dark:bg-gray-800">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Sanktion eskalieren?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Bei einer Eskalation wird die Menge um 50% erhöht
                              und die Frist verlängert. Dies sollte nur bei
                              wiederholter Nichteinhaltung erfolgen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleEscalate(
                                  sanction._id.toString(),
                                  sanction.title
                                )
                              }
                              className="bg-amber-600 hover:bg-amber-700"
                            >
                              Eskalation bestätigen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={actionLoading[sanction._id.toString()]}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white dark:bg-gray-800">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Wirklich löschen?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Diese Aktion kann nicht rückgängig gemacht werden. Die
                          Sanktion wird dauerhaft entfernt.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            handleDelete(
                              sanction._id.toString(),
                              sanction.title
                            )
                          }
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Löschen bestätigen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* CSS für den Modal-Hintergrund */}
      <style jsx global>{`
        [data-state="open"][data-sonner-toast],
        [data-state="open"][role="dialog"] {
          animation: none;
          background-color: rgba(0, 0, 0, 0.4);
        }

        [data-state="open"][role="dialog"]::backdrop {
          background-color: rgba(0, 0, 0, 0.4);
        }
      `}</style>
    </div>
  );
};

export default SanctionsList;

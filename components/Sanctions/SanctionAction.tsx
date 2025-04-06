// components/admin/SanctionActions.tsx
import React, { useState } from "react";
import {
  AlertCircle,
  CheckSquare,
  AlertTriangle,
  ArrowUpCircle,
  Loader2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { sendTelegramMessage } from "@/util/sendTelegramMessage";

interface SanctionActionsProps {
  onAction: (action: "escalate" | "completeAll") => Promise<void>;
  loading: boolean;
}

const SanctionActions: React.FC<SanctionActionsProps> = ({
  onAction,
  loading,
}) => {
  const [confirmAction, setConfirmAction] = useState<
    "escalate" | "completeAll" | null
  >(null);

  const handleConfirmAction = async (action: "escalate" | "completeAll") => {
    try {
      await onAction(action);

      // Telegram-Benachrichtigung senden
      try {
        const dayjs = await import("dayjs");
        await import("dayjs/locale/de");
        const formattedDate = dayjs
          .default()
          .locale("de")
          .format("DD.MM.YYYY HH:mm:ss");

        let message = "";
        if (action === "escalate") {
          message = `Sanktionen eskaliert am ${formattedDate}`;
        } else if (action === "completeAll") {
          message = `Alle Sanktionen als erledigt markiert am ${formattedDate}`;
        }

        await sendTelegramMessage("user", message);
      } catch (telegramError) {
        console.error(
          "Fehler beim Senden der Telegram-Nachricht:",
          telegramError
        );
        // Die Aktion wurde trotzdem durchgeführt, wir zeigen keinen Fehler an
      }

      setConfirmAction(null);
    } catch (error) {
      console.error("Fehler bei der Durchführung der Aktion:", error);
      setConfirmAction(null);
    }
  };

  const actionItems = [
    {
      id: "escalate",
      title: "Abgelaufene Sanktionen eskalieren",
      description:
        "Dies erhöht automatisch die Strafen für alle abgelaufenen, aber nicht erledigten Sanktionen.",
      buttonText: "Eskalieren",
      buttonVariant: "warning",
      buttonColor: "bg-amber-500 hover:bg-amber-600 text-white",
      confirmMessage:
        "Bist du sicher, dass du alle abgelaufenen Sanktionen eskalieren möchtest? Diese Aktion kann nicht rückgängig gemacht werden.",
      icon: <ArrowUpCircle className="h-5 w-5 text-amber-500" />,
    },
    {
      id: "completeAll",
      title: "Alle Sanktionen als erledigt markieren",
      description:
        "Dies markiert ALLE offenen und eskalierten Sanktionen als erledigt. Nur in Ausnahmefällen verwenden!",
      buttonText: "Alle als erledigt markieren",
      buttonVariant: "destructive",
      buttonColor: "bg-red-500 hover:bg-red-600 text-white",
      confirmMessage:
        "Bist du sicher, dass du alle offenen Sanktionen als erledigt markieren möchtest? Diese Aktion kann nicht rückgängig gemacht werden!",
      icon: <CheckSquare className="h-5 w-5 text-red-500" />,
      alertLevel: "critical",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Massenaktionen
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Aktionen für mehrere Sanktionen auf einmal
          </p>
        </div>

        <Alert
          variant="destructive"
          className="md:w-2/3 bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Wichtiger Hinweis</AlertTitle>
          <AlertDescription className="text-xs">
            Diese Massenaktionen können nicht rückgängig gemacht werden. Bitte
            verwende sie mit Vorsicht.
          </AlertDescription>
        </Alert>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {actionItems.map((item) => (
          <Card
            key={item.id}
            className={`shadow-sm ${
              item.alertLevel === "critical"
                ? "border-red-200 dark:border-red-900/50"
                : "border-gray-200 dark:border-gray-800"
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start">
                <div className="mr-2 mt-0.5">{item.icon}</div>
                <div>
                  <CardTitle className="text-lg font-medium">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {item.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardFooter className="pt-2 pb-4">
              <Button
                onClick={() =>
                  setConfirmAction(item.id as "escalate" | "completeAll")
                }
                disabled={loading}
                className={`w-full ${item.buttonColor}`}
              >
                {loading && confirmAction === item.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird durchgeführt...
                  </>
                ) : (
                  item.buttonText
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/30 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-start">
            <Info className="mr-2 mt-0.5 text-blue-600 dark:text-blue-400 h-5 w-5" />
            <div>
              <CardTitle className="text-blue-800 dark:text-blue-300 text-lg font-medium">
                Automatische Eskalation
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-blue-700 dark:text-blue-300 pt-0 text-sm">
          <p>
            Abgelaufene Sanktionen werden automatisch eskaliert, wenn der
            tägliche Cron-Job ausgeführt wird. Die manuelle Eskalation ist nur
            notwendig, wenn du die Eskalation sofort durchführen möchtest.
          </p>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {confirmAction && (
        <AlertDialog
          open={!!confirmAction}
          onOpenChange={() => setConfirmAction(null)}
        >
          <AlertDialogContent className="sm:max-w-md bg-white dark:bg-gray-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle
                  className={`h-5 w-5 ${
                    confirmAction === "escalate"
                      ? "text-amber-500"
                      : "text-red-500"
                  }`}
                />
                Aktion bestätigen
              </AlertDialogTitle>
              <AlertDialogDescription>
                {
                  actionItems.find((item) => item.id === confirmAction)
                    ?.confirmMessage
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <AlertDialogCancel disabled={loading}>
                Abbrechen
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={loading}
                className={`${
                  confirmAction === "escalate"
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleConfirmAction(confirmAction);
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird durchgeführt...
                  </>
                ) : (
                  "Ja, durchführen"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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

export default SanctionActions;

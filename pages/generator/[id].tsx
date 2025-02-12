/* eslint-disable @next/next/no-img-element */
// src/components/generator/GeneratorDetailView.tsx

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  Chip,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import InformationCircleIcon from "@heroicons/react/24/outline/InformationCircleIcon";
import { InfoRow } from "@/components/generator/InfoRow";
import { SectionComponent } from "@/components/generator/Section"; // Hier die aktualisierte Version
import { GeneratorData } from "@/types";
import { useRouter } from "next/router";
import { saveAs } from "file-saver";
import { createEvents } from "ics";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import Link from "next/link";
import { sendTelegramMessage } from "@/util/sendTelegramMessage";

const GeneratorDetailView = () => {
  const router = useRouter();
  const { id } = router.query;

  const [generatorData, setGeneratorData] = useState<GeneratorData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // State für das ausgewählte Modal
  const [selectedDescription, setSelectedDescription] = useState<{
    title: string;
    content: string;
  } | null>(null);

  // Snackbar-States
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("info");

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // --- Hole Daten zum aktuellen Auftrag ---
  useEffect(() => {
    if (id) {
      fetch(`/api/generator?id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setGeneratorData(data.data);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Fehler beim Fetch:", err);
          setLoading(false);
        });
    }
  }, [id]);

  // --- Button: Annehmen ---
  const handleAccept = async () => {
    if (!generatorData) return;

    try {
      const response = await fetch(
        `/api/generator/accept?id=${generatorData._id}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Fehler beim Aktualisieren des Status");
      }

      const result = await response.json();
      setGeneratorData(result.data);

      setSnackbarMessage("Auftrag erfolgreich angenommen!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      sendTelegramMessage(
        "admin",
        `Ein Auftrag wurde angenommen. ${window.location.href}`
      );
    } catch (error) {
      console.error("handleAccept Error:", error);
      setSnackbarMessage("Fehler beim Annehmen des Auftrags.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // --- Button: Fertig! / Erinnerung senden ---
  const handleFinishAndReminder = async () => {
    if (!generatorData) return;

    const storedExpiry = localStorage.getItem("reminderExpiry");
    const now = Date.now();

    if (storedExpiry && now < parseInt(storedExpiry, 10)) {
      const diffSeconds = Math.ceil((parseInt(storedExpiry, 10) - now) / 1000);
      setSnackbarMessage(
        `Bitte warte noch ${diffSeconds} Sekunde(n), bevor du erneut eine Erinnerung senden kannst.`
      );
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    try {
      await sendTelegramMessage(
        "admin",
        "Fertig vorbereitet. Du kannst jetzt jederzeit loslegen."
      );

      const expiryTime = now + 60_000;
      localStorage.setItem("reminderExpiry", expiryTime.toString());

      setTimeout(() => {
        if (Date.now() >= expiryTime) {
          localStorage.removeItem("reminderExpiry");
        }
      }, 60_000);

      setSnackbarMessage(
        "Auftrag als fertig markiert und Erinnerung erfolgreich gesendet!"
      );
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("handleFinishAndReminder Error:", error);
      setSnackbarMessage("Fehler beim Versenden der Erinnerung.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // --- ICS herunterladen ---
  const downloadICS = () => {
    if (
      !generatorData ||
      !generatorData.interval ||
      generatorData.interval.length === 0
    ) {
      setSnackbarMessage("Keine Intervalldaten verfügbar.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    const events = generatorData.interval.map((date: string) => {
      const parsedDate = dayjs(date);
      return {
        start: [
          parsedDate.year(),
          parsedDate.month() + 1,
          parsedDate.date(),
          parsedDate.hour(),
          parsedDate.minute(),
        ] as [number, number, number, number, number],
        duration: { hours: 1, minutes: 0 },
        title: `Termin für Auftrag #${generatorData._id
          ?.slice(-6)
          .toUpperCase()}`,
        description: `Details zum Termin.`,
        location: generatorData.ort?.title || "Unbekannter Ort",
      };
    });

    createEvents(events, (error, value) => {
      if (error) {
        console.error(error);
        setSnackbarMessage("Fehler beim Erstellen der ICS-Datei.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      const blob = new Blob([value], { type: "text/calendar;charset=utf-8" });
      saveAs(blob, "termine.ics");
    });
  };

  // --- Hilfsfunktion: Check ob Array gefüllt ---
  const hasItems = (arr?: unknown[]) => Array.isArray(arr) && arr.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-600">Lade Daten...</p>
      </div>
    );
  }

  if (!generatorData) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-600">
          Kein Auftrag gefunden oder ein Fehler ist aufgetreten.
        </p>
      </div>
    );
  }

  // Update statusColors inklusive FAILED
  const statusColors: { [key: string]: string } = {
    NEW: "bg-blue-100 text-blue-800",
    ACCEPTED: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    DECLINED: "bg-red-100 text-red-800",
    DONE: "bg-gray-100 text-gray-800",
    FAILED: "bg-red-500 text-white animate-pulse",
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${
        generatorData.status === "FAILED"
          ? "border-4 border-red-500 animate-pulse"
          : ""
      }`}
    >
      {/* SNACKBAR in der unteren Mitte */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Modal Beschreibung */}
      <Dialog
        open={!!selectedDescription}
        onClose={() => setSelectedDescription(null)}
        fullWidth
        maxWidth="sm"
      >
        {selectedDescription && (
          <>
            <DialogTitle>{selectedDescription.title}</DialogTitle>
            <DialogContent dividers>
              <p>{selectedDescription.content}</p>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setSelectedDescription(null)}
                color="primary"
              >
                Schließen
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Hauptinhalt */}
      <main className="flex-grow mx-auto max-w-7xl px-4 py-6">
        {/* Kopfbereich: Titel und Status */}
        <header
          className={`mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${
            generatorData.status === "FAILED"
              ? "relative bg-red-50 p-4 rounded-lg shadow-red-sm"
              : ""
          }`}
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
              Auftragsdetails{" "}
              <span className="text-gray-500">
                #{generatorData._id?.slice(-6).toUpperCase()}
              </span>
            </h1>
          </div>
          <div className="flex items-center">
            <Chip
              label={generatorData.status}
              className={`font-medium ${
                statusColors[generatorData.status] ?? ""
              }`}
            />
            {generatorData.status === "FAILED" && (
              <svg
                className="w-8 h-8 text-red-500 animate-bounce ml-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </header>

        {/* Weitere Inhalte */}
        <div className="mb-8 grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-3">
          <InfoRow label="Gold" value={generatorData.gold} icon="💰" />
          <InfoRow label="EXP" value={generatorData.exp} icon="⭐" />
          {(generatorData.alreadyChangeRequested ||
            generatorData.alreadyDeclineRequested) && (
            <InfoRow
              label="Requests"
              value={
                <div className="flex flex-col gap-1">
                  {generatorData.alreadyChangeRequested && (
                    <Chip
                      label="Änderung angefragt"
                      color="warning"
                      size="small"
                    />
                  )}
                  {generatorData.alreadyDeclineRequested && (
                    <Chip
                      label="Ablehnung angefragt"
                      color="error"
                      size="small"
                    />
                  )}
                </div>
              }
            />
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Linke Spalte */}
          <div className="flex flex-col gap-6">
            {(generatorData.outfit ||
              generatorData.orgasmus ||
              typeof generatorData.blueBalls === "boolean") && (
              <SectionComponent
                title="Grundkonfiguration"
                className={
                  generatorData.status === "FAILED"
                    ? "border-2 border-red-300 shadow-red-lg"
                    : ""
                }
              >
                <div className="space-y-4">
                  {generatorData.outfit && (
                    <InfoRow label="Outfit" value={generatorData.outfit}>
                      <IconButton
                        size="small"
                        onClick={() =>
                          setSelectedDescription({
                            title: "Outfit",
                            content: generatorData.outfit || "",
                          })
                        }
                      >
                        <InformationCircleIcon className="h-5 w-5 text-gray-500" />
                      </IconButton>
                    </InfoRow>
                  )}
                  {generatorData.orgasmus && (
                    <InfoRow
                      label="Orgasmus-Regel"
                      value={generatorData.orgasmus}
                    >
                      <IconButton
                        size="small"
                        onClick={() =>
                          setSelectedDescription({
                            title: "Orgasmus-Regel",
                            content: generatorData.orgasmus || "",
                          })
                        }
                      >
                        <InformationCircleIcon className="h-5 w-5 text-gray-500" />
                      </IconButton>
                    </InfoRow>
                  )}
                  {typeof generatorData.blueBalls === "boolean" && (
                    <InfoRow
                      label="Blue Balls"
                      value={
                        generatorData.blueBalls ? "Aktiviert" : "Deaktiviert"
                      }
                    >
                      <IconButton
                        size="small"
                        onClick={() =>
                          setSelectedDescription({
                            title: "Blue Balls",
                            content: generatorData.blueBalls
                              ? "Blue Balls sind aktiviert."
                              : "Blue Balls sind deaktiviert.",
                          })
                        }
                      >
                        <InformationCircleIcon className="h-5 w-5 text-gray-500" />
                      </IconButton>
                    </InfoRow>
                  )}
                </div>
              </SectionComponent>
            )}

            {generatorData.pose?.chosenPose.id && (
              <SectionComponent
                title="Pose"
                className={
                  generatorData.status === "FAILED"
                    ? "border-2 border-red-300 shadow-red-lg"
                    : ""
                }
              >
                <div className="space-y-4">
                  {generatorData.pose.chosenPose.img && (
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                      <div
                        className={`absolute inset-0 ${
                          generatorData.status === "FAILED"
                            ? "failed-glitch"
                            : ""
                        }`}
                      ></div>
                      <img
                        src={generatorData.pose.chosenPose.img}
                        alt={generatorData.pose.chosenPose.title}
                        className={`h-full w-full object-cover ${
                          generatorData.status === "FAILED"
                            ? "opacity-90 mix-blend-multiply"
                            : ""
                        }`}
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-700">
                      {generatorData.pose.chosenPose.title}
                    </h3>
                    {generatorData.pose.chosenPose.description && (
                      <IconButton
                        size="small"
                        onClick={() =>
                          setSelectedDescription({
                            title: generatorData.pose.chosenPose.title,
                            content:
                              generatorData.pose.chosenPose.description || "",
                          })
                        }
                      >
                        <InformationCircleIcon className="h-5 w-5 text-gray-500" />
                      </IconButton>
                    )}
                  </div>
                  {generatorData.pose.additionalNote && (
                    <div className="rounded-lg bg-yellow-50 p-3">
                      <p className="text-sm text-yellow-700">
                        {generatorData.pose.additionalNote}
                      </p>
                    </div>
                  )}
                </div>
              </SectionComponent>
            )}

            {hasItems(generatorData.kondome) &&
              generatorData.kondome.length > 1 && (
                <SectionComponent
                  title="Kondome"
                  className={
                    generatorData.status === "FAILED"
                      ? "border-2 border-red-300 shadow-red-lg"
                      : ""
                  }
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {generatorData.kondome.map((condom, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
                      >
                        <div>
                          <p className="font-medium text-gray-700">
                            {condom.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            Menge: {condom.amount}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionComponent>
              )}
          </div>

          {/* Rechte Spalte */}
          <div className="flex flex-col gap-6">
            {hasItems(generatorData.regeln) && (
              <SectionComponent
                title="Spielregeln"
                className={
                  generatorData.status === "FAILED"
                    ? "border-2 border-red-300 shadow-red-lg"
                    : ""
                }
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {generatorData.regeln.map((rule, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-4"
                    >
                      <h4 className="font-medium text-gray-700">
                        {rule.title}
                      </h4>
                      {rule.description && (
                        <IconButton
                          size="small"
                          onClick={() =>
                            setSelectedDescription({
                              title: rule.title,
                              content: rule.description || "",
                            })
                          }
                        >
                          <InformationCircleIcon className="h-5 w-5 text-gray-500" />
                        </IconButton>
                      )}
                    </div>
                  ))}
                </div>
              </SectionComponent>
            )}

            {hasItems(generatorData.vorSex) && (
              <SectionComponent
                title="Vorbereitungen"
                className={
                  generatorData.status === "FAILED"
                    ? "border-2 border-red-300 shadow-red-lg"
                    : ""
                }
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {generatorData.vorSex.map((prep, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-4"
                    >
                      <div>
                        <h4 className="font-medium text-gray-700">
                          {prep.title}
                        </h4>
                        {prep.additionalNote && (
                          <p className="mt-1 text-sm text-gray-500">
                            {prep.additionalNote}
                          </p>
                        )}
                      </div>
                      {prep.description && (
                        <IconButton
                          size="small"
                          onClick={() =>
                            setSelectedDescription({
                              title: prep.title,
                              content: prep.description || "",
                            })
                          }
                        >
                          <InformationCircleIcon className="h-5 w-5 text-gray-500" />
                        </IconButton>
                      )}
                    </div>
                  ))}
                </div>
              </SectionComponent>
            )}

            {(hasItems(generatorData.interval) ||
              generatorData.dringlichkeit) && (
              <SectionComponent
                title="Zeitliche Planung"
                className={
                  generatorData.status === "FAILED"
                    ? "border-2 border-red-300 shadow-red-lg"
                    : ""
                }
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {hasItems(generatorData.interval) && (
                    <div className="rounded-lg bg-blue-50 p-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-blue-800">
                          Intervalle
                        </h4>
                        <div className="flex items-center space-x-2">
                          <IconButton
                            size="small"
                            onClick={() =>
                              setSelectedDescription({
                                title: "Intervalle",
                                content:
                                  "Gibt an, wann du mich das nächste Mal nach Sex fragen sollst.",
                              })
                            }
                          >
                            <InformationCircleIcon className="h-5 w-5 text-gray-500" />
                          </IconButton>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<CalendarTodayIcon />}
                            onClick={downloadICS}
                          >
                            Runterladen
                          </Button>
                        </div>
                      </div>
                      <ul className="mt-2 space-y-1">
                        {generatorData.interval.map((date, index) => (
                          <li key={index} className="text-sm text-blue-600">
                            {dayjs(date).format("DD.MM.YYYY HH:mm")}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {generatorData.dringlichkeit && (
                    <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 shadow-sm">
                      <div>
                        <h4 className="font-medium text-green-800">
                          Dringlichkeit
                        </h4>
                        <p className="mt-1 text-sm text-green-600">
                          {generatorData.dringlichkeit.title}
                        </p>
                      </div>
                      {generatorData.dringlichkeit.description && (
                        <IconButton
                          size="small"
                          onClick={() =>
                            setSelectedDescription({
                              title: "Dringlichkeit",
                              content:
                                generatorData.dringlichkeit.description || "",
                            })
                          }
                        >
                          <InformationCircleIcon className="h-5 w-5 text-gray-500" />
                        </IconButton>
                      )}
                    </div>
                  )}
                </div>
              </SectionComponent>
            )}
          </div>
        </div>

        {(generatorData.loch || generatorData.toys || generatorData.ort) && (
          <Divider className="my-8" />
        )}

        {(generatorData.loch || generatorData.toys || generatorData.ort) && (
          <SectionComponent
            title="Erweiterte Einstellungen"
            className={
              generatorData.status === "FAILED"
                ? "border-2 border-red-300 shadow-red-lg"
                : ""
            }
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {generatorData.loch && (
                <div className="rounded-lg bg-orange-50 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-orange-800">
                      Lochbereitschaft
                    </h4>
                    {generatorData.loch.additionalNote && (
                      <IconButton
                        size="small"
                        onClick={() =>
                          setSelectedDescription({
                            title: "Lochbereitschaft",
                            content: generatorData.loch.additionalNote || "",
                          })
                        }
                      >
                        <InformationCircleIcon className="h-5 w-5 text-gray-500" />
                      </IconButton>
                    )}
                  </div>
                  <div className="mt-2 space-y-2 text-sm text-orange-700">
                    {typeof generatorData.loch.mouth !== "undefined" && (
                      <p>Mund: {generatorData.loch.mouth}</p>
                    )}
                    {generatorData.loch.ass?.title && (
                      <p>Arsch: {generatorData.loch.ass.title}</p>
                    )}
                    {generatorData.loch.pussy?.title && (
                      <p>Muschi: {generatorData.loch.pussy.title}</p>
                    )}
                  </div>
                </div>
              )}

              {generatorData.toys &&
                Object.keys(generatorData.toys).length > 0 && (
                  <div className="rounded-lg bg-pink-50 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-pink-800">Spielzeug</h4>
                      <IconButton
                        size="small"
                        onClick={() =>
                          setSelectedDescription({
                            title: "Spielzeug",
                            content: "Details zu den Spielzeugen.",
                          })
                        }
                      >
                        <InformationCircleIcon className="h-5 w-5 text-gray-500" />
                      </IconButton>
                    </div>
                    <div className="mt-2 space-y-2">
                      {Object.entries(generatorData.toys).map(([key, value]) =>
                        Array.isArray(value) && value.length > 0 ? (
                          <div key={key}>
                            <p className="mb-1 text-sm font-semibold capitalize text-pink-700">
                              {key}:
                            </p>
                            <ul className="ml-4 list-disc space-y-1 text-xs text-pink-600">
                              {value.map((toy, index) => (
                                <li key={index}>
                                  {toy.title} (x{toy.amount})
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
                )}

              {generatorData.ort && (
                <div className="rounded-lg bg-teal-50 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-teal-800">Ort</h4>
                    {generatorData.ort.additionalNote && (
                      <IconButton
                        size="small"
                        onClick={() =>
                          setSelectedDescription({
                            title: "Ort",
                            content: generatorData.ort?.additionalNote ?? "",
                          })
                        }
                      >
                        <InformationCircleIcon className="h-5 w-5 text-gray-500" />
                      </IconButton>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-teal-600">
                    {generatorData.ort.title}
                  </p>
                </div>
              )}
            </div>
          </SectionComponent>
        )}
      </main>

      {/* Footer mit den Aktions-Buttons */}
      <footer className={`bg-white border-t p-4 `}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-end gap-4">
          {generatorData.status === "NEW" && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleAccept}
              fullWidth
            >
              Annehmen
            </Button>
          )}

          {generatorData.status === "ACCEPTED" && (
            <Button
              variant="contained"
              color="success"
              onClick={handleFinishAndReminder}
              fullWidth
            >
              Notification senden
            </Button>
          )}

          <Link href="/tickets?view=create" passHref>
            <Button variant="outlined" color="info">
              Antrag senden
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default GeneratorDetailView;

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import dayjs, { Dayjs } from "dayjs"; // Import Dayjs type
import "dayjs/locale/de"; // Deutsche Locale für Dayjs
import { saveAs } from "file-saver";
import { createEvents, EventAttributes, DateArray } from "ics"; // Import DateArray
import { sendTelegramMessage } from "@/util/sendTelegramMessage"; // Passe den Pfad ggf. an
import { GeneratorData, SingleToy, SingleRule, VorSexObjekt } from "@/types"; // Passe den Pfad ggf. an
import toast, { Toaster } from "react-hot-toast"; // Importiere react-hot-toast

// --- Icons ---
import {
  InformationCircleIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  BellAlertIcon,
  ExclamationCircleIcon,
  ClockIcon,
  TagIcon,
  MapPinIcon,
  GiftIcon,
  HeartIcon,
  FireIcon,
  ShieldCheckIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  TicketIcon,
  ArrowPathIcon, // Hinzugefügt für Iteratoren
} from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/20/solid";

// --- Dayjs Konfiguration ---
dayjs.locale("de");

// --- Hilfskomponenten (Direkt im File definiert) ---

// Haupt-Layout-Karte für Sektionen
const SectionCard: React.FC<{
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
}> = ({ title, icon: Icon, children, className = "" }) => (
  <div
    className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${className}`}
  >
    <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
      <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-gray-500" />}
        {title}
      </h2>
    </div>
    <div className="p-5 space-y-4">{children}</div>
  </div>
);

// Badge für Metadaten (Gold, EXP, etc.) - Angepasste Styling-Logik
const InfoBadge: React.FC<{
  label: string;
  value: string | number | boolean;
  icon: React.ElementType;
  colorClasses: string; // z.B. "text-yellow-600 bg-yellow-50 border-yellow-200"
}> = ({ label, value, icon: Icon, colorClasses }) => {
  // Extrahiere Klassen für Text, Hintergrund und Border
  const parts = colorClasses.split(" ");
  const textClass =
    parts.find((cls) => cls.startsWith("text-")) || "text-gray-800";
  const bgClass = parts.find((cls) => cls.startsWith("bg-")) || "bg-gray-100";
  const borderClass =
    parts.find((cls) => cls.startsWith("border-")) || "border-gray-200";
  // Erzeuge eine helle BG-Klasse für das Icon aus der Text-Klasse (z.B. text-yellow-600 -> bg-yellow-100)
  const iconBgClass = textClass
    .replace("text-", "bg-")
    .replace("-600", "-100")
    .replace("-700", "-100")
    .replace("-800", "-100");

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg ${bgClass} border ${borderClass}`}
    >
      <div className={`p-2 rounded-full ${iconBgClass}`}>
        {" "}
        {/* Icon mit passendem BG */}
        <Icon className={`w-5 h-5 ${textClass}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className={`font-semibold text-lg ${textClass}`}>
          {typeof value === "boolean" ? (value ? "Ja" : "Nein") : value}
        </p>
      </div>
    </div>
  );
};

// Detaillierter Eintrag innerhalb einer Karte
const DetailItem: React.FC<{
  title: string;
  description?: string | React.ReactNode;
  note?: string;
  titleClasses?: string;
}> = ({
  title,
  description,
  note,
  titleClasses = "font-medium text-gray-800",
}) => (
  <div>
    <h3 className={`text-sm ${titleClasses}`}>{title}</h3>
    {description && (
      <div className="mt-1 text-sm text-gray-600">{description}</div>
    )}
    {note && (
      <div className="mt-2 flex items-start gap-2 text-xs text-blue-700 bg-blue-50 p-2 rounded-md border border-blue-200">
        <InformationCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600" />
        <span>{note}</span>
      </div>
    )}
  </div>
);

// Komponente für Tags (z.B. in Lochbereitschaft)
const Tag: React.FC<{ label: string; colorClasses: string }> = ({
  label,
  colorClasses,
}) => (
  <span
    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses}`}
  >
    {label}
  </span>
);

// Komponente für Listen (z.B. Kondome, Spielzeug)
const ListItem: React.FC<{
  children: React.ReactNode;
  icon?: React.ElementType;
}> = ({ children, icon: Icon }) => (
  <li className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-b-0">
    {Icon && <Icon className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />}
    <span className="text-sm text-gray-700">{children}</span>
  </li>
);

// --- Hauptkomponente (GeneratorPage) ---

export default function GeneratorPage() {
  const router = useRouter();
  const { id } = router.query; // ID aus der URL
  const [generator, setGenerator] = useState<GeneratorData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Daten abrufen
  const fetchGenerator = async () => {
    if (!id || typeof id !== "string") {
      setLoading(false);
      // Setze Fehler nur, wenn Router bereit ist, um unnötige Fehler beim initialen Rendern zu vermeiden
      if (router.isReady) {
        setError("Ungültige oder fehlende Auftrags-ID.");
      }
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/generator?id=${id}`); // Passe API-Pfad an
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Fehler: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.data) {
        // Konvertiere und validiere Intervalldaten sicher
        if (data.data.interval && Array.isArray(data.data.interval)) {
          data.data.interval = data.data.interval
            .map((dateStr: string | number | Date | Dayjs) => dayjs(dateStr)) // Konvertiere zu Dayjs
            .filter(
              (d: Dayjs | any): d is Dayjs => dayjs.isDayjs(d) && d.isValid()
            ); // Filtere nur gültige Dayjs-Objekte
        } else {
          data.data.interval = []; // Fallback auf leeres Array
        }
        // Sicherstellen, dass andere Array-Felder existieren, auch wenn sie leer sind (optional, aber gut für konsistentes Rendering)
        data.data.kondome = data.data.kondome || [];
        data.data.regeln = data.data.regeln || [];
        data.data.vorSex = data.data.vorSex || [];
        data.data.iteratoren = data.data.iteratoren || [];
        if (data.data.toys) {
          data.data.toys.mouth = data.data.toys.mouth || [];
          data.data.toys.pussy = data.data.toys.pussy || [];
          data.data.toys.ass = data.data.toys.ass || [];
        } else {
          // Fallback, falls toys komplett fehlt
          data.data.toys = {
            mouth: [],
            pussy: [],
            ass: [],
            additionalNote: "",
          };
        }

        setGenerator(data.data);
      } else {
        throw new Error(
          data.message || "Generator nicht gefunden oder Daten ungültig."
        );
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Ein unbekannter Fehler ist aufgetreten";
      console.error("Fetch Error:", message, err);
      setError(message);
      setGenerator(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch nur starten, wenn 'id' verfügbar und ein String ist
    if (id && typeof id === "string") {
      fetchGenerator();
    } else if (router.isReady && !id) {
      // Wenn Router bereit ist, aber ID fehlt -> Fehler setzen
      setLoading(false);
      setError("Auftrags-ID fehlt in der URL.");
    }
    // Abhängigkeit von id und router.isReady (um sicherzustellen, dass query param verfügbar ist)
  }, [id, router.isReady]);

  // ICS-Datei herunterladen
  const downloadICS = () => {
    if (!generator || !generator.interval || generator.interval.length === 0) {
      toast.error("Keine Zeitplan-Daten verfügbar.");
      return;
    }

    const potentialEvents = generator.interval.map(
      (date): EventAttributes | null => {
        if (!dayjs.isDayjs(date) || !date.isValid()) {
          console.error("Ungültiges Datum im Intervall gefunden:", date);
          return null;
        }
        const startArray = [
          date.year(),
          date.month() + 1,
          date.date(),
          date.hour(),
          date.minute(),
        ] as DateArray;

        const eventData = {
          start: startArray,
          duration: { hours: 1, minutes: 0 },
          title: `Termin Auftrag #${generator._id?.slice(-6).toUpperCase()}`,
          description: `Details zum Termin für Auftrag ${generator._id}. Ort: ${
            generator.ort?.title || "Unbekannt"
          }. Weitere Infos im Dashboard.`,
          location: generator.ort?.title || "Nicht spezifiziert",
          status: "CONFIRMED" as const,
          organizer: { name: "System", email: "noreply@example.com" },
          attendees: [],
        };
        return eventData;
      }
    );

    const events: EventAttributes[] = potentialEvents.filter(
      (event): event is EventAttributes => event !== null
    );

    if (events.length === 0) {
      toast.error(
        "Keine gültigen Termine zum Erstellen der ICS-Datei gefunden."
      );
      return;
    }

    createEvents(events, (error, value) => {
      if (error) {
        console.error("ICS Creation Error:", error);
        toast.error("Fehler beim Erstellen der ICS-Datei.");
        return;
      }
      try {
        const blob = new Blob([value], { type: "text/calendar;charset=utf-8" });
        saveAs(blob, `auftrag_${generator._id?.slice(-6)}.ics`);
        toast.success("Kalenderdatei erfolgreich heruntergeladen.");
      } catch (saveError) {
        console.error("ICS Save Error:", saveError);
        toast.error("Fehler beim Speichern der ICS-Datei.");
      }
    });
  };

  // --- Handler für Aktionen ---
  const handleAccept = async () => {
    if (!generator?._id) return;
    const toastId = toast.loading("Auftrag wird angenommen...");
    try {
      const response = await fetch(
        `/api/generator/accept?id=${generator._id}`,
        {
          // Passe API-Pfad an
          method: "POST",
        }
      );
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(
          errorBody.message ||
            "Fehler beim Akzeptieren des Auftrags (Serverantwort)"
        );
      }
      const result = await response.json();
      if (result.success && result.data) {
        // Konvertiere und validiere Intervalldaten sicher nach Update
        if (result.data.interval && Array.isArray(result.data.interval)) {
          result.data.interval = result.data.interval
            .map((dateStr: string | number | Date | Dayjs) => dayjs(dateStr))
            .filter(
              (d: Dayjs | any): d is Dayjs => dayjs.isDayjs(d) && d.isValid()
            );
        } else {
          result.data.interval = [];
        }
        // Stelle auch sicher, dass andere Array-Felder vorhanden sind
        result.data.kondome = result.data.kondome || [];
        result.data.regeln = result.data.regeln || [];
        result.data.vorSex = result.data.vorSex || [];
        result.data.iteratoren = result.data.iteratoren || [];
        if (result.data.toys) {
          result.data.toys.mouth = result.data.toys.mouth || [];
          result.data.toys.pussy = result.data.toys.pussy || [];
          result.data.toys.ass = result.data.toys.ass || [];
        } else {
          result.data.toys = {
            mouth: [],
            pussy: [],
            ass: [],
            additionalNote: "",
          };
        }
        setGenerator(result.data);
        toast.success("Auftrag erfolgreich angenommen!", { id: toastId });
      } else {
        throw new Error(
          result.message || "Antwort vom Server war nicht erfolgreich."
        );
      }
    } catch (error) {
      console.error("Error accepting generator:", error);
      const message = error instanceof Error ? error.message : String(error);
      toast.error(`Fehler: ${message}`, { id: toastId });
    }
  };

  const handleNotify = async () => {
    if (!generator?._id) return;
    const toastId = toast.loading("Benachrichtigung wird gesendet...");
    try {
      await sendTelegramMessage(
        "admin", // Ziel-Chat/User (Anpassen!)
        `Auftrag #${generator._id?.slice(
          -6
        )}: Alles vorbereitet. Du kannst jetzt loslegen!`
      );
      toast.success("Benachrichtigung erfolgreich gesendet!", { id: toastId });
    } catch (error) {
      console.error("Error sending notification:", error);
      const message = error instanceof Error ? error.message : String(error);
      toast.error(`Fehler beim Senden: ${message}`, { id: toastId });
    }
  };

  // --- Render Zustände (Loading, Error) ---

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-10">
          <svg
            className="mx-auto h-12 w-12 text-blue-600 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-4 text-lg font-medium text-gray-700">
            Daten werden geladen...
          </p>
        </div>
      </div>
    );
  }

  if (error || !generator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <Toaster position="bottom-right" reverseOrder={false} />{" "}
        {/* Auch im Fehlerfall Toaster anzeigen */}
        <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-red-200 max-w-lg w-full">
          <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-xl font-semibold text-gray-900">
            Ein Fehler ist aufgetreten
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {error ||
              "Der angeforderte Auftrag konnte nicht gefunden oder geladen werden."}
          </p>
          <Link
            href="/dashboard" // Passe den Link zum Dashboard an
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Zurück zum Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Status Farben und Texte
  const statusInfo: {
    [key: string]: { text: string; classes: string; icon: React.ElementType };
  } = {
    NEW: {
      text: "Neu",
      classes: "bg-blue-100 text-blue-800 border-blue-200",
      icon: SparklesIcon,
    },
    ACCEPTED: {
      text: "Angenommen",
      classes: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircleIcon,
    },
    PENDING: {
      text: "In Bearbeitung",
      classes: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: ClockIcon,
    },
    DECLINED: {
      text: "Abgelehnt",
      classes: "bg-red-100 text-red-800 border-red-200",
      icon: ExclamationCircleIcon,
    },
    DONE: {
      text: "Erledigt",
      classes: "bg-gray-100 text-gray-800 border-gray-200",
      icon: CheckIcon,
    },
    FAILED: {
      text: "Fehlgeschlagen",
      classes: "bg-red-200 text-red-900 border-red-300",
      icon: ExclamationCircleIcon,
    },
  };
  const currentStatus = statusInfo[generator.status] || statusInfo.DONE; // Fallback

  // --- Render Hauptansicht ---

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="bottom-right" reverseOrder={false} />{" "}
      {/* Toaster für Benachrichtigungen */}
      <Head>
        <title>
          Auftrag #{generator._id?.slice(-6).toUpperCase()} | Dashboard
        </title>
        <meta
          name="description"
          content={`Details zum Auftrag #${generator._id
            ?.slice(-6)
            .toUpperCase()}`}
        />
      </Head>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard" // Passe den Link zum Dashboard an
                className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Zurück zum Dashboard"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  Auftrag{" "}
                  <span className="font-mono text-blue-700">
                    #{generator._id?.slice(-6).toUpperCase()}
                  </span>
                </h1>
                <p className="text-xs text-gray-500">
                  Erstellt am: {dayjs(generator.createdAt).format("DD.MM.YYYY")}{" "}
                  um {dayjs(generator.createdAt).format("HH:mm")} Uhr
                </p>
              </div>
            </div>
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${currentStatus.classes}`}
            >
              <currentStatus.icon className="w-3.5 h-3.5" />
              {currentStatus.text}
            </div>
          </div>
        </div>
      </header>
      {/* Main Content Area */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Metadaten Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 md:mb-8">
          <InfoBadge
            label="Blue Balls"
            value={generator.blueBalls}
            icon={HeartIcon}
            colorClasses="text-sky-600 bg-sky-50 border-sky-200"
          />
        </div>
        {/* Hauptinhalt Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Linke Spalte */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Kern-Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {generator.pose && (
                <SectionCard
                  title="Gewünschte Pose"
                  icon={AdjustmentsHorizontalIcon}
                >
                  {generator.pose.chosenPose.img && (
                    <div className="w-full bg-gray-100 rounded-md overflow-hidden border border-gray-200  mb-4">
                      <img
                        src={generator.pose.chosenPose.img}
                        alt={`Pose: ${generator.pose.chosenPose.title}`}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <DetailItem
                    title={generator.pose.chosenPose.title}
                    description={generator.pose.chosenPose.description}
                    note={
                      generator.pose.additionalNote ||
                      generator.pose.chosenPose.additionalNote
                    }
                    titleClasses="font-semibold text-gray-900 text-base"
                  />
                </SectionCard>
              )}

              {generator.outfit && (
                <SectionCard title="Outfit" icon={GiftIcon}>
                  {typeof generator.outfit === "string" ? (
                    <p className="text-sm text-gray-700">{generator.outfit}</p>
                  ) : (
                    <DetailItem
                      title={generator.outfit.outfit}
                      note={generator.outfit.additionalNote}
                      titleClasses="font-semibold text-gray-900 text-base"
                    />
                  )}
                </SectionCard>
              )}

              {generator.orgasmus && (
                <SectionCard title="Orgasmusvorgabe" icon={FireIcon}>
                  {typeof generator.orgasmus === "string" ? (
                    <p className="text-sm text-gray-700">
                      {generator.orgasmus}
                    </p>
                  ) : (
                    <DetailItem
                      title={generator.orgasmus.option}
                      note={generator.orgasmus.additionalNote}
                      titleClasses="font-semibold text-gray-900 text-base"
                    />
                  )}
                </SectionCard>
              )}

              {generator.dringlichkeit && (
                <SectionCard title="Dringlichkeit" icon={ClockIcon}>
                  <DetailItem
                    title={generator.dringlichkeit.title}
                    description={generator.dringlichkeit.description}
                    note={generator.dringlichkeit.additionalNote}
                    titleClasses="font-semibold text-gray-900 text-base"
                  />
                </SectionCard>
              )}
            </div>

            {/* Erweiterte Einstellungen Sektion */}
            {(generator.loch ||
              (generator.toys &&
                (generator.toys.mouth.length > 0 ||
                  generator.toys.pussy.length > 0 ||
                  generator.toys.ass.length > 0)) ||
              generator.ort) && (
              <div className="space-y-6 md:space-y-8 mt-6 md:mt-8">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 pl-1">
                  <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-500" />
                  Erweiterte Einstellungen
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  {generator.loch && (
                    <SectionCard title="Lochbereitschaft" icon={HeartIcon}>
                      <div className="space-y-4">
                        <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
                          <h4 className="font-semibold text-sm text-blue-800 mb-1">
                            Mund
                          </h4>
                          <p className="text-sm text-blue-700">
                            {generator.loch.mouth}
                          </p>
                        </div>
                        {generator.loch.pussy && ( // Check if pussy object exists
                          <div className="p-3 bg-purple-50 rounded-md border border-purple-100">
                            <h4 className="font-semibold text-sm text-purple-800 mb-1">
                              {generator.loch.pussy.title}
                            </h4>
                            {generator.loch.pussy.tags?.length > 0 && ( // Check if tags exist and have items
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {generator.loch.pussy.tags.map((tag, idx) => (
                                  <Tag
                                    key={`pussy-tag-${idx}`}
                                    label={tag}
                                    colorClasses="bg-purple-100 text-purple-800"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        {generator.loch.ass && ( // Check if ass object exists
                          <div className="p-3 bg-pink-50 rounded-md border border-pink-100">
                            <h4 className="font-semibold text-sm text-pink-800 mb-1">
                              {generator.loch.ass.title}
                            </h4>
                            {generator.loch.ass.tags?.length > 0 && ( // Check if tags exist and have items
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {generator.loch.ass.tags.map((tag, idx) => (
                                  <Tag
                                    key={`ass-tag-${idx}`}
                                    label={tag}
                                    colorClasses="bg-pink-100 text-pink-800"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        {generator.loch.additionalNote && (
                          <DetailItem
                            title=""
                            note={generator.loch.additionalNote}
                          />
                        )}
                      </div>
                    </SectionCard>
                  )}

                  {generator.toys &&
                    (generator.toys.mouth.length > 0 ||
                      generator.toys.pussy.length > 0 ||
                      generator.toys.ass.length > 0) && (
                      <SectionCard title="Spielzeug" icon={GiftIcon}>
                        <div className="space-y-4">
                          {generator.toys.mouth.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-sm text-green-800 mb-1">
                                Mund:
                              </h4>
                              <ul className="list-none space-y-1 pl-0">
                                {generator.toys.mouth.map(
                                  (toy: SingleToy, idx: number) => (
                                    <ListItem
                                      key={`mouth-${idx}`}
                                      icon={CheckIcon}
                                    >
                                      {toy.title} (Menge: {toy.amount})
                                    </ListItem>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                          {generator.toys.pussy.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-sm text-green-800 mb-1 mt-3">
                                Pussy:
                              </h4>
                              <ul className="list-none space-y-1 pl-0">
                                {generator.toys.pussy.map(
                                  (toy: SingleToy, idx: number) => (
                                    <ListItem
                                      key={`pussy-${idx}`}
                                      icon={CheckIcon}
                                    >
                                      {toy.title} (Menge: {toy.amount})
                                    </ListItem>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                          {generator.toys.ass.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-sm text-green-800 mb-1 mt-3">
                                Arsch:
                              </h4>
                              <ul className="list-none space-y-1 pl-0">
                                {generator.toys.ass.map(
                                  (toy: SingleToy, idx: number) => (
                                    <ListItem
                                      key={`ass-${idx}`}
                                      icon={CheckIcon}
                                    >
                                      {toy.title} (Menge: {toy.amount})
                                    </ListItem>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                          {generator.toys.additionalNote && (
                            <DetailItem
                              title=""
                              note={generator.toys.additionalNote}
                            />
                          )}
                        </div>
                      </SectionCard>
                    )}

                  {generator.ort && (
                    <SectionCard title="Ort" icon={MapPinIcon}>
                      <DetailItem
                        title={generator.ort.title}
                        note={generator.ort.additionalNote}
                        titleClasses="font-semibold text-gray-900 text-base"
                      />
                    </SectionCard>
                  )}
                </div>
              </div>
            )}
          </div>{" "}
          {/* Ende Linke/Haupt Spalte */}
          {/* Rechte Spalte */}
          <div className="lg:col-span-1 space-y-6 md:space-y-8">
            {generator.regeln.length > 0 && (
              <SectionCard title="Spielregeln" icon={ShieldCheckIcon}>
                <div className="space-y-4">
                  {generator.regeln.map((rule: SingleRule, index: number) => (
                    <DetailItem
                      key={`rule-${index}`}
                      title={rule.title}
                      description={rule.description}
                      note={rule.additionalNote}
                    />
                  ))}
                </div>
              </SectionCard>
            )}

            {generator.vorSex.length > 0 && (
              <SectionCard
                title="Vorbereitungen (vor Sex)"
                icon={CheckCircleIcon}
              >
                <div className="space-y-4">
                  {generator.vorSex.map((prep: VorSexObjekt, index: number) => (
                    <DetailItem
                      key={`prep-${index}`}
                      title={prep.title}
                      description={prep.description}
                      note={prep.additionalNote}
                    />
                  ))}
                </div>
              </SectionCard>
            )}

            {/* --- NEU: Iteratoren anzeigen --- */}
            {generator.iteratoren.length > 0 && (
              <SectionCard title="An jedem Termin wieder:" icon={ArrowPathIcon}>
                <div className="space-y-4">
                  {generator.iteratoren.map(
                    (
                      iterator: VorSexObjekt,
                      index: number // Annahme: Struktur ist wie VorSexObjekt
                    ) => (
                      <DetailItem
                        key={`iterator-${index}`}
                        title={iterator.title}
                        description={iterator.description}
                        note={iterator.additionalNote}
                      />
                    )
                  )}
                </div>
              </SectionCard>
            )}
            {/* --- Ende Iteratoren --- */}

            {generator.kondome.length > 0 && (
              <SectionCard title="Benötigte Kondome" icon={TagIcon}>
                <ul className="list-none space-y-1 pl-0">
                  {generator.kondome.map((kondom, index) => (
                    <ListItem key={`kondom-${index}`} icon={TagIcon}>
                      {kondom.title}{" "}
                      <span className="text-gray-500">
                        (Menge: {kondom.amount})
                      </span>
                    </ListItem>
                  ))}
                </ul>
              </SectionCard>
            )}

            {generator.interval.length > 0 && (
              <SectionCard title="Zeitplanung" icon={CalendarIcon}>
                <div className="space-y-4">
                  <button
                    onClick={downloadICS}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    Kalenderdatei (.ics) herunterladen
                  </button>
                  <ul className="space-y-2">
                    {generator.interval.map((date, index) => (
                      <li
                        key={`date-${index}`}
                        className="bg-gray-50 p-2.5 rounded-md text-sm text-gray-800 border border-gray-200 flex items-center gap-2"
                      >
                        <CalendarIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        {/* Formatierung des gültigen Dayjs-Objekts */}
                        {date.format("dddd, DD. MMMM YYYY, HH:mm [Uhr]")}
                      </li>
                    ))}
                  </ul>
                </div>
              </SectionCard>
            )}
          </div>{" "}
          {/* Ende Rechte Spalte */}
        </div>{" "}
        {/* Ende Hauptinhalt Grid */}
        {/* --- NEU: Button-Bereich am Ende von Main (ersetzt Footer) --- */}
        <div className="mt-8 md:mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link
            href="/dashboard" // Passe den Link zum Dashboard an
            className="order-last sm:order-first px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors w-full sm:w-auto text-center"
          >
            Zurück zum Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Bedingte Buttons für Aktionen */}
            {generator.status === "NEW" && (
              <button
                onClick={handleAccept}
                className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <CheckCircleIcon className="w-5 h-5" />
                Auftrag annehmen
              </button>
            )}
            {generator.status === "ACCEPTED" && (
              <button
                onClick={handleNotify}
                className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                <BellAlertIcon className="w-5 h-5" />
                Als &lsquo;Fertig vorbereitet&lsquo; markieren & Benachrichtigen
              </button>
            )}

            {/* Button: Antrag stellen */}
            {id &&
              typeof id === "string" && ( // Nur anzeigen, wenn ID ein gültiger String ist
                <Link
                  href={`/tickets`} // Dynamischer Link zur Ticket-Seite des Auftrags
                  className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                >
                  <TicketIcon className="w-5 h-5" />
                  Antrag stellen{" "}
                  {/* Z.B. für Änderungswünsche, Probleme etc. */}
                </Link>
              )}
          </div>
        </div>
        {/* --- Ende Button-Bereich --- */}
      </main>
      {/* Footer wurde entfernt */}
    </div>
  );
}

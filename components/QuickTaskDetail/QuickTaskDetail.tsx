/* eslint-disable @next/next/no-img-element */
// components/QuickTaskDetail.tsx
import React, { useState } from "react";
import dayjs from "dayjs";
import { sendTelegramMessage } from "@/util/sendTelegramMessage";
import {
  FiExternalLink,
  FiCheck,
  FiAlertTriangle,
  FiLoader,
  FiZap,
  FiImage,
  FiXCircle,
  FiMessageSquare,
} from "react-icons/fi";
import Link from "next/link";
interface QuickTaskDetailProps {
  task: {
    _id: string;
    title: string;
    description?: string;
    url?: string;
    createdAt: string;
    status: "NEW" | "ACCEPTED" | "DONE" | "FAILED";
  };
}

const QuickTaskDetail: React.FC<QuickTaskDetailProps> = ({ task }) => {
  const [status, setStatus] = useState(task.status);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleAccept = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/quicktasks?id=${task._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "ACCEPTED" }),
      });

      const result = await response.json();
      if (result.success) {
        setStatus("ACCEPTED");
        setMessage({ text: "Task erfolgreich angenommen!", type: "success" });
        sendTelegramMessage(
          "admin",
          `Der Quicktask ${task.title} wurde angenommen.`
        );
      } else {
        setMessage({
          text: result.message || "Fehler beim Akzeptieren des Tasks",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error accepting task:", error);
      setMessage({ text: "Fehler beim Akzeptieren des Tasks", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/quicktasks?id=${task._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "DONE" }),
      });

      const result = await response.json();
      if (result.success) {
        setStatus("DONE");
        setMessage({ text: "Task als erledigt markiert!", type: "success" });
        sendTelegramMessage(
          "admin",
          `Der Quick Task ${task.title} wurde erledigt`
        );
      } else {
        setMessage({
          text: result.message || "Fehler beim Markieren als erledigt",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error completing task:", error);
      setMessage({ text: "Fehler beim Markieren als erledigt", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Statuskonfiguration mit Farben und Icons
  const statusConfig = {
    NEW: {
      color: "bg-sky-500/20 text-sky-600",
      icon: <FiZap className="w-5 h-5 text-sky-500" />,
      label: "Neu",
    },
    ACCEPTED: {
      color: "bg-amber-500/20 text-amber-600",
      icon: <FiLoader className="w-5 h-5 text-amber-500" />,
      label: "In Bearbeitung",
    },
    DONE: {
      color: "bg-emerald-500/20 text-emerald-600",
      icon: <FiCheck className="w-5 h-5 text-emerald-500" />,
      label: "Erledigt",
    },
    FAILED: {
      color: "bg-rose-500/20 text-rose-600",
      icon: <FiXCircle className="w-5 h-5 text-rose-500" />,
      label: "Fehlgeschlagen",
    },
  };

  // ... (handleAccept und handleComplete Funktionen bleiben gleich)

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-3xl">
      {/* Header mit Statusleiste */}
      <div
        className={`p-6 ${statusConfig[status].color} flex items-center gap-3`}
      >
        {statusConfig[status].icon}
        <h3 className="font-semibold">{statusConfig[status].label}</h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Titel und Metadaten */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {task.title}
          </h1>
          <div className="flex items-center gap-2 text-gray-500">
            <FiAlertTriangle className="w-4 h-4" />
            <span className="text-sm">
              Erstellt: {dayjs(task.createdAt).format("DD.MM.YYYY HH:mm")}
            </span>
          </div>
        </div>

        {/* Bildvorschau mit festen Dimensionen */}
        {task.url && (
          <div className="group relative">
            <div className="w-full h-[400px] bg-gray-50 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
              <img
                src={task.url}
                alt="Task Preview"
                className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.02]"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  // Optional: Fehlerbehandlung für fehlende Bilder
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

              <a
                href={task.url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 hover:bg-white transition-all"
              >
                <FiExternalLink className="w-4 h-4" />
                <span className="text-sm font-medium">Vollbild</span>
              </a>
            </div>

            {/* Fallback für fehlende Bilder */}
            {task.url.match(/\.(jpeg|jpg|gif|png)$/) === null && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-500 bg-gray-50">
                <FiImage className="w-12 h-12" />
                <span className="text-sm font-medium">Link-Vorschau</span>
              </div>
            )}
          </div>
        )}

        {/* Beschreibung */}
        {task.description && (
          <div className="prose prose-indigo">
            <h3 className="text-gray-500 uppercase text-sm font-semibold mb-2">
              Beschreibung
            </h3>
            <p className="text-gray-700 leading-relaxed">{task.description}</p>
          </div>
        )}

        {/* Statusmeldungen */}
        {message.text && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {message.type === "success" ? (
              <FiCheck className="w-5 h-5 flex-shrink-0" />
            ) : (
              <FiXCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Aktionen */}
        <div className="flex flex-col gap-3">
          {status === "NEW" && (
            <button
              onClick={handleAccept}
              disabled={loading}
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="animate-spin">↻</span>
                  <span>Wird angenommen...</span>
                </>
              ) : (
                <>
                  <FiCheck className="w-5 h-5" />
                  <span>Task annehmen</span>
                </>
              )}
            </button>
          )}

          {status === "ACCEPTED" && (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="animate-spin">↻</span>
                  <span>Wird abgeschlossen...</span>
                </>
              ) : (
                <>
                  <FiCheck className="w-5 h-5" />
                  <span>Abschließen</span>
                </>
              )}
            </button>
          )}
          <Link
            href="/tickets"
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
          >
            <FiMessageSquare className="w-5 h-5" />
            <span>Zum Ticket-System</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuickTaskDetail;

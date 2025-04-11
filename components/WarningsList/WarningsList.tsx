// components/admin/WarningsList.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { IWarning } from "@/models/Warning";

interface WarningsListProps {
  initialWarnings?: IWarning[];
}

const WarningsList: React.FC<WarningsListProps> = ({
  initialWarnings = [],
}) => {
  const [warnings, setWarnings] = useState<IWarning[]>(initialWarnings);
  const [loading, setLoading] = useState<boolean>(initialWarnings.length === 0);
  const [actionLoading, setActionLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [error, setError] = useState<string | null>(null);

  // Fetch warnings when component mounts
  useEffect(() => {
    fetchWarnings();
  }, []); // Leere Abhängigkeitsliste, wird nur beim Mounten ausgeführt

  // Fetch warnings
  const fetchWarnings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/warnings");

      if (!response.ok) {
        throw new Error("Fehler beim Abrufen der Warnungen");
      }

      const data = await response.json();

      if (data.success) {
        setWarnings(data.data || []);
      } else {
        throw new Error(data.message || "Fehler beim Abrufen der Warnungen");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error("Fehler beim Abrufen der Warnungen:", err);
    } finally {
      setLoading(false);
    }
  };

  // Acknowledge a warning
  const handleAcknowledge = async (warningId: string) => {
    try {
      setActionLoading({ ...actionLoading, [warningId]: true });
      setError(null);

      const response = await fetch("/api/warnings/acknowledge", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ warningId }),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Bestätigen der Warnung");
      }

      // Update the warnings list
      fetchWarnings();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setActionLoading({ ...actionLoading, [warningId]: false });
    }
  };

  // Format date - updated to accept Date objects
  const formatDate = (date: Date) => {
    return date.toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Verwarnungen</h2>
          <p className="text-sm text-gray-500 mt-1">
            Übersicht aller ausgesprochenen Verwarnungen
          </p>
        </div>

        <Button
          variant="outline"
          onClick={fetchWarnings}
          className="w-full md:w-auto"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Aktualisieren
        </Button>
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
      warnings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Keine Verwarnungen gefunden</p>
        </div>
      ) : (
        /* Warnings list */
        <div className="space-y-4">
          {warnings.map((warning) => (
            <Card
              key={warning._id}
              className={`hover:shadow-md transition-shadow ${
                !warning.acknowledged ? "border-red-200 bg-red-50" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <Badge
                        className={
                          warning.acknowledged
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }
                      >
                        {warning.acknowledged ? "Bestätigt" : "Unbestätigt"}
                      </Badge>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(warning.createdAt)}
                      </span>
                    </div>

                    <p className="text-gray-800">{warning.message}</p>

                    {warning.acknowledged && warning.acknowledgedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Bestätigt am: {formatDate(warning.acknowledgedAt)}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    {!warning.acknowledged && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAcknowledge(warning._id)}
                        disabled={actionLoading[warning._id]}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        {actionLoading[warning._id.toString()] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Manuell bestätigen
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WarningsList;

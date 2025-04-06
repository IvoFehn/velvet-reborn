// components/SanctionDashboard.tsx
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  FileWarning,
  ClipboardList,
} from "lucide-react";
import { ISanction } from "@/types/index";
import {
  getSanctions,
  escalateExpiredSanctions,
  completeAllSanctions,
} from "@/util/sanctionUtils";
import RandomSanctionForm from "./RandomSanctionForm";
import SanctionActions from "./SanctionAction";
import SanctionsList from "./SanctionList";
import SpecificSanctionForm from "./SpecificSantionForm";

const SanctionDashboard: React.FC = () => {
  const [sanctions, setSanctions] = useState<ISanction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Lade Sanktionen
  useEffect(() => {
    const loadSanctions = async () => {
      try {
        setLoading(true);
        const data = await getSanctions("alle");
        setSanctions(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    loadSanctions();
  }, [refreshTrigger]);

  // Behandlung für Sanktionserstellung
  const handleSanctionCreated = (sanction: ISanction) => {
    setSuccessMessage(`Sanktion "${sanction.title}" erfolgreich erstellt!`);
    // Aktualisiere die Liste durch Erhöhen des Refresh-Triggers
    setRefreshTrigger((prev) => prev + 1);

    // Lösche die Erfolgsmeldung nach 3 Sekunden
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // Behandlung für Massenaktionen
  const handleMassAction = async (action: "escalate" | "completeAll") => {
    try {
      setLoading(true);

      if (action === "escalate") {
        const count = await escalateExpiredSanctions();
        setSuccessMessage(`${count} Sanktion(en) eskaliert.`);
      } else if (action === "completeAll") {
        const count = await completeAllSanctions();
        setSuccessMessage(`${count} Sanktion(en) als erledigt markiert.`);
      }

      // Aktualisiere die Liste
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);

      // Lösche die Erfolgsmeldung nach 3 Sekunden
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }
  };

  // Manuelles Aktualisieren der Daten
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Sanktionen-Dashboard
        </h1>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span>Aktualisieren</span>
        </button>
      </div>

      {/* Benachrichtigungen */}
      <div className="space-y-3">
        {/* Erfolgsmeldung */}
        {successMessage && (
          <Alert
            variant="default"
            className="bg-green-50 text-green-800 border-green-200 shadow-sm animate-in fade-in duration-300"
          >
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertTitle className="font-semibold">Erfolg</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Fehlermeldung */}
        {error && (
          <Alert
            variant="destructive"
            className="shadow-sm animate-in fade-in duration-300"
          >
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-semibold">Fehler</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <Tabs defaultValue="random" className="w-full">
        <TabsList className="w-full mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <div className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
            <TabsTrigger
              value="random"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Sanktion vergeben</span>
              <span className="sm:hidden">Vergeben</span>
            </TabsTrigger>

            <TabsTrigger
              value="specific"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <FileWarning className="h-4 w-4" />
              <span className="hidden sm:inline">Spezifische Sanktion</span>
              <span className="sm:hidden">Spezifisch</span>
            </TabsTrigger>

            <TabsTrigger
              value="list"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm"
            >
              <span>Alle Sanktionen</span>
            </TabsTrigger>

            <TabsTrigger
              value="actions"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm"
            >
              <span>Aktionen</span>
            </TabsTrigger>
          </div>
        </TabsList>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <TabsContent value="random" className="m-0">
            <Card className="border-0 shadow-none">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="text-lg font-medium">
                  Sanktion vergeben
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <RandomSanctionForm onSanctionCreated={handleSanctionCreated} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specific" className="m-0">
            <Card className="border-0 shadow-none">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="text-lg font-medium">
                  Spezifische Sanktion
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <SpecificSanctionForm
                  onSanctionCreated={handleSanctionCreated}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list" className="m-0">
            <Card className="border-0 shadow-none">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="text-lg font-medium">
                  Alle Sanktionen
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <SanctionsList
                  sanctions={sanctions}
                  loading={loading}
                  onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="m-0">
            <Card className="border-0 shadow-none">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="text-lg font-medium">Aktionen</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <SanctionActions
                  onAction={handleMassAction}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default SanctionDashboard;

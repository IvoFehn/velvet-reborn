// components/SanctionDashboard.tsx
import React, { useState, useCallback } from "react";
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
  useSanctions, 
  useCheckSanctions, 
  useCompleteAllSanctions,
  useOptimisticSanctionsUpdate 
} from "@/hooks/useSanctions";
import { useAppStore } from "@/stores/appStore";
import RandomSanctionForm from "./RandomSanctionForm";
import SanctionActions from "./SanctionAction";
import SanctionsList from "./SanctionList";
import SpecificSanctionForm from "./SpecificSantionForm";

const SanctionDashboard: React.FC = () => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Use the new store-based hooks (minimal API calls)
  const { data: sanctions = [], loading, error, refetch } = useSanctions();
  const checkSanctions = useCheckSanctions();
  const completeAllSanctions = useCompleteAllSanctions();
  const { addLoadingOperation, removeLoadingOperation } = useAppStore();

  // Behandlung für Sanktionserstellung (no API call needed, already optimistic)
  const handleSanctionCreated = useCallback((sanction: ISanction) => {
    setSuccessMessage(`Sanktion "${sanction.title}" erfolgreich erstellt!`);
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  }, []);

  // Behandlung für Massenaktionen (optimistic updates)
  const handleMassAction = useCallback(async (action: "escalate" | "completeAll") => {
    const operationId = `mass-action-${action}`;
    addLoadingOperation(operationId);
    
    try {
      if (action === "escalate") {
        const result = await checkSanctions.mutate();
        setSuccessMessage(`${result.escalatedCount || 0} Sanktion(en) eskaliert.`);
      } else if (action === "completeAll") {
        const result = await completeAllSanctions.mutate();
        setSuccessMessage(`${result || 0} Sanktion(en) als erledigt markiert.`);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Mass action error:', err);
    } finally {
      removeLoadingOperation(operationId);
    }
  }, [checkSanctions, completeAllSanctions, addLoadingOperation, removeLoadingOperation]);

  // Manual refresh (force API call)
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

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
                  onRefresh={handleRefresh}
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
                  loading={checkSanctions.loading || completeAllSanctions.loading}
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

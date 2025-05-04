/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/sanctionUtils.ts
import axios from "axios";
import { ISanction, ISanctionTemplate } from "@/types/index";
import sanctionCatalog from "../data/sanctionCatalog";

/**
 * Gibt eine zufällige Sanktion basierend auf dem Schweregrad aus
 * @param level Schweregrad der Sanktion (1-5)
 * @param deadlineDays Anzahl der Tage bis zur Fälligkeit
 * @param reason Optionaler Grund für die Sanktion
 * @returns Die erstellte Sanktion
 */
export const giveSanction = async (
  level: number = 3,
  deadlineDays: number = 2,
  reason?: string
): Promise<ISanction> => {
  try {
    const response = await axios.post("/api/sanctions/random", {
      severity: level,
      deadlineDays,
      reason,
    });

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Fehler bei der Erstellung der Sanktion"
      );
    }

    return response.data.data;
  } catch (error) {
    console.error("Fehler bei giveSanction:", error);
    throw error;
  }
};

/**
 * Gibt eine spezifische Sanktion aus dem Katalog aus
 * @param templateIndex Index der Sanktionsvorlage im Array für den jeweiligen Schweregrad
 * @param level Schweregrad der Sanktion (1-5)
 * @param deadlineDays Anzahl der Tage bis zur Fälligkeit
 * @param reason Optionaler Grund für die Sanktion
 * @returns Die erstellte Sanktion
 */
export const giveSpecificSanction = async (
  templateIndex: number,
  level: number,
  deadlineDays: number = 2,
  customAmount?: number,
  reason?: string
): Promise<ISanction> => {
  try {
    // Typ-Assertion, da wir sichergehen müssen, dass der level ein gültiger Schlüssel ist
    const templates = sanctionCatalog[level as keyof typeof sanctionCatalog];

    if (!templates || !templates[templateIndex]) {
      throw new Error(
        `Keine Sanktionsvorlage gefunden für Schweregrad ${level}, Index ${templateIndex}`
      );
    }

    // Sanktionsvorlage abrufen
    if (
      !Number.isInteger(templateIndex) ||
      templateIndex < 0 ||
      templateIndex >= templates.length
    ) {
      throw new Error(
        `Ungültiger Sanktions-Index für Level ${level}: ${templateIndex}`
      );
    }
    const template = { ...templates[templateIndex] };

    // Optional: Benutzerdefinierte Menge setzen (nur wenn gültig)
    if (
      typeof customAmount === "number" &&
      !isNaN(customAmount) &&
      customAmount > 0
    ) {
      template.amount = customAmount;
    }

    // Sanktion erstellen über die API
    const response = await axios.post("/api/sanctions/custom", {
      template,
      severity: level,
      deadlineDays,
      reason,
    });

    if (!response.data.success) {
      throw new Error(
        response.data.message ||
          "Fehler bei der Erstellung der spezifischen Sanktion"
      );
    }

    return response.data.data;
  } catch (error) {
    console.error("Fehler bei giveSpecificSanction:", error);
    throw error;
  }
};

/**
 * Gibt alle verfügbaren Sanktionsvorlagen zurück
 * @param level Optional: Schweregrad zum Filtern (1-5)
 * @returns Array von Sanktionsvorlagen
 */
export const getSanctionTemplates = (
  level?: number
): {
  level: number;
  index: number;
  template: ISanctionTemplate;
}[] => {
  try {
    const result: {
      level: number;
      index: number;
      template: ISanctionTemplate;
    }[] = [];

    // Alle Schweregradebenen durchgehen (wenn kein bestimmter level angefordert wurde)
    for (let severity = 1; severity <= 5; severity++) {
      // Wenn ein bestimmter level angefordert wurde und dieser nicht übereinstimmt, überspringen
      if (level !== undefined && severity !== level) continue;

      // Typ-Assertion für den Katalogzugriff
      const templates =
        sanctionCatalog[severity as keyof typeof sanctionCatalog] || [];

      // Templates zum Ergebnis hinzufügen
      templates.forEach((template, index) => {
        result.push({
          level: severity,
          index,
          template,
        });
      });
    }

    return result;
  } catch (error) {
    console.error("Fehler bei getSanctionTemplates:", error);
    throw error;
  }
};

/**
 * Holt alle aktiven Sanktionen ab
 * @param status Optional: Filtere nach Status (default: 'offen')
 * @returns Array von Sanktionen
 */
export const getSanctions = async (
  status?: "offen" | "erledigt" | "abgelaufen" | "eskaliert" | "alle"
): Promise<ISanction[]> => {
  try {
    // API-Pfad mit optionalem Statusfilter
    let url = "/api/sanctions";
    if (status && status !== "alle") {
      url += `?status=${status}`;
    }

    const response = await axios.get(url);

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Fehler beim Abrufen der Sanktionen"
      );
    }

    return response.data.data;
  } catch (error) {
    console.error("Fehler bei getSanctions:", error);
    throw error;
  }
};

/**
 * Markiert eine Sanktion als erledigt
 * @param sanctionId ID der zu erledigenden Sanktion
 * @returns Die aktualisierte Sanktion
 */
export const completeSanction = async (
  sanctionId: string
): Promise<ISanction> => {
  try {
    const response = await axios.put("/api/sanctions/complete", { sanctionId });

    if (!response.data.success) {
      throw new Error(
        response.data.message ||
          "Fehler beim Markieren der Sanktion als erledigt"
      );
    }

    return response.data.data;
  } catch (error) {
    console.error("Fehler bei completeSanction:", error);
    throw error;
  }
};

/**
 * Markiert alle offenen Sanktionen als erledigt
 * @returns Anzahl der erledigten Sanktionen
 */
export const completeAllSanctions = async (): Promise<number> => {
  try {
    const response = await axios.put("/api/sanctions/complete-all");

    if (!response.data.success) {
      throw new Error(
        response.data.message ||
          "Fehler beim Markieren aller Sanktionen als erledigt"
      );
    }

    return response.data.count;
  } catch (error) {
    console.error("Fehler bei completeAllSanctions:", error);
    throw error;
  }
};

/**
 * Eskaliert manuell alle abgelaufenen Sanktionen
 * @returns Anzahl der eskalierten Sanktionen
 */
export const escalateExpiredSanctions = async (): Promise<number> => {
  try {
    const response = await axios.post("/api/sanctions/check", {
      checkAll: true,
    });

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Fehler beim Eskalieren der Sanktionen"
      );
    }

    return response.data.escalatedCount;
  } catch (error) {
    console.error("Fehler bei escalateExpiredSanctions:", error);
    throw error;
  }
};

/**
 * Löscht eine Sanktion
 * @param sanctionId ID der zu löschenden Sanktion
 * @returns Erfolgsrückgabe
 */
export const deleteSanction = async (sanctionId: string): Promise<boolean> => {
  try {
    const response = await axios.delete(`/api/sanctions/${sanctionId}`);

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Fehler beim Löschen der Sanktion"
      );
    }

    return true;
  } catch (error) {
    console.error("Fehler bei deleteSanction:", error);
    throw error;
  }
};

// Fügen Sie diese Funktion zu Ihrer bestehenden sanctionUtils.ts-Datei hinzu

/**
 * Eskaliert eine bestehende Sanktion
 * @param sanctionId - Die ID der zu eskalierenden Sanktion
 * @returns Promise<ISanction> - Die eskalierte Sanktion
 */
export const escalateSanction = async (sanctionId: string): Promise<any> => {
  const response = await fetch(`/api/sanctions/escalate`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sanctionId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Fehler beim Eskalieren der Sanktion");
  }

  return response.json();
};

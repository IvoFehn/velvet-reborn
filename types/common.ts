// Common types used across the application

/** Standardized Rating scale from 0 to 5 */
export type Rating = 0 | 1 | 2 | 3 | 4 | 5;

/** News types */
export type NewsType = "general" | "review" | "failed";

/** Sanction unit types */
export type SanctionUnit = "Minuten" | "Stunden" | "Tage" | "Mal" | "Schläge" | "Stunden/Tag";

/** Sanction status types */
export type SanctionStatus = "offen" | "erledigt" | "abgelaufen" | "eskaliert";

/** Sanction category types */
export type SanctionCategory = 
  | "Hausarbeit" 
  | "Lernen" 
  | "Sport" 
  | "Soziales" 
  | "Sonstiges" 
  | "Erotik" 
  | "Anal" 
  | "Spanking" 
  | "Kraulen" 
  | "Alleine einkaufen";

/** Warning severity types */
export type WarningSeverity = "low" | "medium" | "high" | "critical";

/** Ticket priority types */
export type TicketPriority = "low" | "medium" | "high" | "urgent";

/** Event types */
export type EventType = string; // Can be extended with specific event types if needed

/** Task difficulty levels */
export type TaskDifficulty = 1 | 2 | 3 | 4 | 5;
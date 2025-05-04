// components/admin/SpecificSanctionForm.tsx
import React, { useState, useEffect } from "react";
import {
  getSanctionTemplates,
  giveSpecificSanction,
} from "../../util/sanctionUtils";
import { ISanction, ISanctionTemplate } from "@/types/index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  InfoIcon,
  Calendar,
  Scale,
  ListTodo,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { sendTelegramMessage } from "@/util/sendTelegramMessage";

interface SpecificSanctionFormProps {
  onSanctionCreated?: (sanction: ISanction) => void;
}

interface TemplateOption {
  level: number;
  index: number;
  template: ISanctionTemplate;
}

const SpecificSanctionForm: React.FC<SpecificSanctionFormProps> = ({
  onSanctionCreated,
}) => {
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number>(3);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<
    number | null
  >(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ISanctionTemplate | null>(null);
  const [deadlineDays, setDeadlineDays] = useState<number>(2);
  const [customAmount, setCustomAmount] = useState<number | undefined>(
    undefined
  );
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Lade alle Sanktionsvorlagen für das gewählte Level
  useEffect(() => {
    try {
      // Nur Templates für das gewählte Level laden
      const levelTemplates = getSanctionTemplates(selectedLevel);
      setTemplates(levelTemplates);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [selectedLevel]);

  // Gefilterte Templates basierend auf dem ausgewählten Level
  const filteredTemplates = templates; // Da jetzt nur noch die für das Level geladen werden

  // Setze den ausgewählten Template, wenn sich der Index ändert
  useEffect(() => {
    if (selectedTemplateIndex !== null) {
      const template = filteredTemplates.find(
        (t) => t.index === selectedTemplateIndex
      );
      if (template) {
        setSelectedTemplate(template.template);
        setCustomAmount(template.template.amount);
      } else {
        setSelectedTemplate(null);
        setCustomAmount(undefined);
      }
    } else {
      setSelectedTemplate(null);
      setCustomAmount(undefined);
    }
  }, [selectedTemplateIndex, filteredTemplates]);

  const handleLevelChange = (value: string) => {
    const level = parseInt(value);
    setSelectedLevel(level);
    setSelectedTemplateIndex(null); // Zurücksetzen der Vorlagenauswahl
  };

  const handleTemplateChange = (value: string) => {
    const index = value === "" ? null : parseInt(value);
    setSelectedTemplateIndex(index);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedTemplateIndex === null) {
      setError("Bitte wähle eine Sanktionsvorlage aus");
      return;
    }

    // Zusätzliche Validierung: Existiert die Vorlage wirklich?
    const templateObj = filteredTemplates.find(
      (t) => t.index === selectedTemplateIndex
    );
    if (!templateObj) {
      setError("Ungültige Sanktionsvorlage ausgewählt");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const newSanction = await giveSpecificSanction(
        templateObj.index,
        selectedLevel,
        deadlineDays,
        customAmount,
        reason
      );

      // Telegram-Benachrichtigung senden
      try {
        const dayjs = await import("dayjs");
        await import("dayjs/locale/de");

        await sendTelegramMessage(
          "user",
          `Neue Sanktion erstellt am ${dayjs
            .default()
            .locale("de")
            .format("DD.MM.YYYY HH:mm:ss")}`
        );
      } catch (telegramError) {
        console.error(
          "Fehler beim Senden der Telegram-Nachricht:",
          telegramError
        );
        // Die Sanktion wurde trotzdem erstellt, wir zeigen keinen Fehler an
      }

      setSuccess(
        `Spezifische Sanktion "${newSanction.title}" erfolgreich erstellt!`
      );

      // Elternkomponente benachrichtigen
      if (onSanctionCreated) {
        onSanctionCreated(newSanction);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // Funktion zum Bestimmen der Farbe basierend auf dem Level
  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-green-100 text-green-800 border-green-200";
      case 2:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 3:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 4:
        return "bg-orange-100 text-orange-800 border-orange-200";
      case 5:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="level" className="text-sm font-medium">
                Schweregrad
              </Label>
              <Select
                onValueChange={handleLevelChange}
                defaultValue={selectedLevel.toString()}
              >
                <SelectTrigger id="level" className="w-full mt-1">
                  <SelectValue placeholder="Wähle einen Schweregrad" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800">
                  <SelectGroup>
                    <SelectLabel>Schweregrad</SelectLabel>
                    <SelectItem value="1">
                      <div className="flex items-center">
                        <Badge className="bg-green-100 text-green-800 mr-2">
                          1
                        </Badge>
                        Sehr leicht
                      </div>
                    </SelectItem>
                    <SelectItem value="2">
                      <div className="flex items-center">
                        <Badge className="bg-blue-100 text-blue-800 mr-2">
                          2
                        </Badge>
                        Leicht
                      </div>
                    </SelectItem>
                    <SelectItem value="3">
                      <div className="flex items-center">
                        <Badge className="bg-yellow-100 text-yellow-800 mr-2">
                          3
                        </Badge>
                        Mittel
                      </div>
                    </SelectItem>
                    <SelectItem value="4">
                      <div className="flex items-center">
                        <Badge className="bg-orange-100 text-orange-800 mr-2">
                          4
                        </Badge>
                        Schwer
                      </div>
                    </SelectItem>
                    <SelectItem value="5">
                      <div className="flex items-center">
                        <Badge className="bg-red-100 text-red-800 mr-2">
                          5
                        </Badge>
                        Sehr schwer
                      </div>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="template" className="text-sm font-medium">
                Sanktionsvorlage
              </Label>
              <Select
                onValueChange={handleTemplateChange}
                value={
                  selectedTemplateIndex !== null
                    ? selectedTemplateIndex.toString()
                    : ""
                }
              >
                <SelectTrigger id="template" className="w-full mt-1">
                  <SelectValue placeholder="Wähle eine Sanktion" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800">
                  <SelectGroup>
                    <SelectLabel>Verfügbare Sanktionen</SelectLabel>
                    {filteredTemplates.length === 0 ? (
                      <SelectItem value="" disabled>
                        Keine Vorlagen für diesen Schweregrad
                      </SelectItem>
                    ) : (
                      filteredTemplates.map((option) => (
                        <SelectItem
                          key={`${option.level}-${option.index}`}
                          value={option.index.toString()}
                        >
                          {option.template.title} - {option.template.amount}{" "}
                          {option.template.unit}
                        </SelectItem>
                      ))
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="deadline" className="text-sm font-medium">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Frist für die Erledigung (Tage)
                </div>
              </Label>
              <Input
                id="deadline"
                type="number"
                min="1"
                max="30"
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(parseInt(e.target.value))}
                className="mt-1"
              />
            </div>

            {/* Begründung (optional) */}
            <div>
              <Label htmlFor="reason" className="text-sm font-medium">
                Begründung (optional)
              </Label>
              <Input
                id="reason"
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1"
                placeholder="Optional: Warum wird die Sanktion vergeben?"
              />
            </div>

            {selectedTemplate && (
              <div>
                <Label htmlFor="customAmount" className="text-sm font-medium">
                  <div className="flex items-center">
                    <Scale className="h-4 w-4 mr-2" />
                    Angepasste Menge/Dauer ({selectedTemplate.unit})
                  </div>
                </Label>
                <Input
                  id="customAmount"
                  type="number"
                  min="1"
                  value={customAmount || ""}
                  onChange={(e) =>
                    setCustomAmount(
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Standardwert: {selectedTemplate.amount}{" "}
                  {selectedTemplate.unit}
                </p>
              </div>
            )}
          </div>

          <div>
            {selectedTemplate ? (
              <Card
                className={`h-full shadow-sm border ${getLevelColor(
                  selectedLevel
                )}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <Badge
                      variant="outline"
                      className={`${getLevelColor(selectedLevel)} font-medium`}
                    >
                      Schweregrad {selectedLevel}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      {selectedTemplate.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-semibold mt-2">
                    {selectedTemplate.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    {selectedTemplate.description}
                  </p>
                  <Separator className="my-4" />
                  <div className="flex items-start gap-2 mb-2">
                    <ListTodo className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Aufgabe</p>
                      <p className="text-sm">{selectedTemplate.task}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <InfoIcon className="h-5 w-5 text-blue-500" />
                    <p className="text-xs text-muted-foreground">
                      Diese Vorlage wurde für Vergehen des Schweregrades{" "}
                      {selectedLevel} entwickelt.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full bg-gray-50 dark:bg-gray-800 border-dashed border-2 flex items-center justify-center">
                <CardContent className="text-center p-6">
                  <div className="rounded-full bg-gray-100 dark:bg-gray-700 p-3 inline-flex mx-auto mb-4">
                    <ListTodo className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
                    Sanktionsdetails
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Wähle einen Schweregrad und eine Sanktionsvorlage, um die
                    Details zu sehen.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 text-red-800 border border-red-200 animate-in fade-in duration-200">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold">Fehler</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 text-green-800 border border-green-200 animate-in fade-in duration-200">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-semibold">Erfolg</p>
              <p className="text-sm">{success}</p>
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || selectedTemplateIndex === null}
          className="w-full h-12 text-base"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wird erstellt...
            </>
          ) : (
            "Spezifische Sanktion vergeben"
          )}
        </Button>
      </form>
    </div>
  );
};

export default SpecificSanctionForm;

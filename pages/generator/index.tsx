/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/generator.tsx

import React, { useState, useCallback, useEffect } from "react";
import {
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Grid,
  FormControlLabel,
  Switch,
  Snackbar,
  Alert,
} from "@mui/material";
import { useRouter } from "next/router";
import PoseComponent from "@/components/generator/PoseComponent";
import OutfitComponent from "@/components/generator/OutfitComponent";
import OrgasmusComponent from "@/components/generator/OrgasmusComponent";
import KondomComponent from "@/components/generator/KondomComponent";
import ToysComponent from "@/components/generator/ToysComponent";
import RulesComponent from "@/components/generator/RulesComponent";
import LochComponent from "@/components/generator/LochComponent";
import DringlichkeitComponent from "@/components/generator/DringlichkeitComponent";
import VorSexComponent from "@/components/generator/VorSexComponent";
import OrtComponent from "@/components/generator/OrtComponent";
import IntervalComponent from "@/components/generator/IntervalComponent";
import {
  GeneratorData,
  OutfitWithNote,
  OrgasmusWithNote,
  DringlichkeitObjekt,
} from "@/types";
import { sendTelegramMessage } from "@/util/sendTelegramMessage";
import dayjs from "dayjs";

const steps = [
  "Position",
  "Outfit",
  "Orgasmus",
  "Kondome",
  "Spielzeug",
  "Regeln",
  "Löcher",
  "Vorbereitung",
  "Dringlichkeit",
  "Ort",
  "Iteratoren",
  "Intervalle",
  "Bestätigung",
];

const Generator: React.FC = () => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State für die neuen Datenstrukturen
  const [outfitState, setOutfitState] = useState<OutfitWithNote>({
    outfit: "",
    additionalNote: "",
  });
  const [orgasmusState, setOrgasmusState] = useState<OrgasmusWithNote>({
    option: "",
    additionalNote: "",
  });

  // Snackbar States
  const [snackbarSuccessOpen, setSnackbarSuccessOpen] = useState(false);
  const [snackbarErrorOpen, setSnackbarErrorOpen] = useState(false);
  const [snackbarErrorMsg, setSnackbarErrorMsg] = useState("");

  // State Management
  const [formData, setFormData] = useState<GeneratorData>({
    status: "NEW",
    pose: {
      chosenPose: {
        id: "doggyAssSpreadLegsSpreadAufrecht",
        title: "Doggy Ass Spread Beine Breit Aufrecht",
        description:
          "Mit dem Oberkörper aufgerichtet in Doggy-Position den Arsch spreizen.",
        img: "https://i.ibb.co/F3d6KPW/xyyy.jpg",
        additionalNote: "",
      },
      additionalNote: "",
    },
    outfit: "", // Dies wird nur für die Typkompatibilität verwendet
    orgasmus: "", // Dies wird nur für die Typkompatibilität verwendet
    kondome: [],
    toys: { additionalNote: "", mouth: [], pussy: [], ass: [] },
    regeln: [],
    loch: {
      additionalNote: "",
      mouth: "Volle Bereitschaft",
      ass: { title: "", tags: [] },
      pussy: { title: "", tags: [] },
    },
    vorSex: [],
    dringlichkeit: { title: "", description: "", additionalNote: "" },
    ort: null,
    iteratoren: [],
    interval: [],
    gold: 0,
    exp: 0,
    blueBalls: false,
    alreadyChangeRequested: false,
    alreadyDeclineRequested: false,
  });

  // Aktualisiere formData wenn outfitState oder orgasmusState sich ändern
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      outfit: outfitState, // Speichere das ganze Objekt
    }));
  }, [outfitState]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      orgasmus: orgasmusState, // Speichere das ganze Objekt
    }));
  }, [orgasmusState]);

  // Neue sendToBackend-Funktion, die GeneratorDataToSend akzeptiert
  const sendToBackend = async (data: any) => {
    const response = await fetch("/api/gaming?action=generator", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Fehler beim Speichern der Daten");
    }

    return response.json();
  };

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  // Navigation
  const handleNext = useCallback(() => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  }, []);

  const handleBack = useCallback(() => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  }, []);

  // Form Submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Konvertiere alle Dayjs-Objekte im interval-Array zu ISO-Strings
      const dataToSend: any = {
        ...formData,
        interval: formData.interval.map((date) => date.toISOString()),
      };

      await sendToBackend(dataToSend);

      sendTelegramMessage(
        "user",
        `Ein Antrag wurde bearbeitet am ${dayjs()
          .locale("de")
          .format("DD.MM.YYYY HH:mm:ss")}`
      );

      // Erfolgssnackbar anzeigen
      setSnackbarSuccessOpen(true);
    } catch (error: any) {
      console.error("Fehler beim Speichern der Daten:", error);
      setSnackbarErrorMsg(error.message || "Fehler beim Speichern der Daten");
      setSnackbarErrorOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generische Update-Funktion
  const createUpdateHandler =
    <K extends keyof GeneratorData>(key: K) =>
    (valueOrUpdater: React.SetStateAction<GeneratorData[K]>) => {
      setFormData((prev) => ({
        ...prev,
        [key]:
          typeof valueOrUpdater === "function"
            ? (valueOrUpdater as (prev: GeneratorData[K]) => GeneratorData[K])(
                prev[key]
              )
            : valueOrUpdater,
      }));
    };

  // Spezifische Handler mit korrekten Typen
  const handlers = {
    setPose: createUpdateHandler("pose"),
    setKondome: createUpdateHandler("kondome"),
    setToys: createUpdateHandler("toys"),
    setRegeln: createUpdateHandler("regeln"),
    setLoch: createUpdateHandler("loch"),
    setVorSex: createUpdateHandler("vorSex"),
    setDringlichkeit: createUpdateHandler("dringlichkeit"),
    setOrt: createUpdateHandler("ort"),
    setIteratoren: createUpdateHandler("iteratoren"),
    setInterval: createUpdateHandler("interval"),
    setGold: createUpdateHandler("gold"),
    setExp: createUpdateHandler("exp"),
    setBlueBalls: createUpdateHandler("blueBalls"),
  };

  // Responsive Layout
  const renderStepContent = () => (
    <Paper elevation={3} sx={{ p: 3, mb: 3, width: "100%", maxWidth: 800 }}>
      {(() => {
        switch (steps[activeStep].toLowerCase()) {
          case "position":
            return (
              <PoseComponent
                currentValue={formData.pose}
                setValue={handlers.setPose}
              />
            );
          case "outfit":
            return (
              <OutfitComponent
                currentValue={outfitState}
                setValue={setOutfitState}
              />
            );
          case "orgasmus":
            return (
              <OrgasmusComponent
                currentValue={orgasmusState}
                setValue={setOrgasmusState}
              />
            );
          case "kondome":
            return (
              <KondomComponent
                currentValue={formData.kondome}
                setValue={handlers.setKondome}
              />
            );
          case "spielzeug":
            return (
              <ToysComponent
                currentValue={formData.toys}
                setValue={handlers.setToys}
              />
            );
          case "regeln":
            return (
              <RulesComponent
                currentValue={formData.regeln}
                setValue={handlers.setRegeln}
              />
            );
          case "löcher":
            return (
              <LochComponent
                currentValue={formData.loch}
                setValue={handlers.setLoch}
              />
            );
          case "vorbereitung":
            return (
              <VorSexComponent
                currentValue={formData.vorSex}
                setValue={handlers.setVorSex}
              />
            );
          case "dringlichkeit":
            return (
              <DringlichkeitComponent
                currentValue={formData.dringlichkeit as DringlichkeitObjekt}
                setValue={
                  handlers.setDringlichkeit as React.Dispatch<
                    React.SetStateAction<DringlichkeitObjekt>
                  >
                }
              />
            );
          case "ort":
            return (
              <OrtComponent
                currentValue={formData.ort}
                setValue={handlers.setOrt}
              />
            );
          case "iteratoren":
            return (
              <VorSexComponent
                currentValue={formData.iteratoren}
                setValue={handlers.setIteratoren}
              />
            );
          case "intervalle":
            return (
              <IntervalComponent
                currentValue={formData.interval}
                setValue={handlers.setInterval}
              />
            );
          case "bestätigung":
            return (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.blueBalls}
                          onChange={(e) =>
                            handlers.setBlueBalls(e.target.checked)
                          }
                          color="primary"
                        />
                      }
                      label="Blue Balls aktivieren: Mit diesem Schalter markierst du, dass du sehr viel Druck hast und dieser Auftrag besonders wichtig ist."
                      sx={{ mt: 2 }}
                    />
                  </Grid>
                </Grid>

                <Button
                  variant="contained"
                  size="large"
                  onClick={async () => {
                    await handleSubmit();
                    router.push("/");
                  }}
                  disabled={isSubmitting}
                  sx={{ px: 6, py: 2, fontSize: "1.1rem" }}
                >
                  {isSubmitting ? "Wird gesendet..." : "Auftrag absenden"}
                </Button>
              </Box>
            );
          default:
            return null;
        }
      })()}
    </Paper>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderStepContent()}

      <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          disabled={activeStep === 0}
          sx={{ minWidth: 120 }}
        >
          Zurück
        </Button>

        {activeStep !== steps.length - 1 && (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={activeStep === steps.length - 1}
            sx={{ minWidth: 120 }}
          >
            Weiter
          </Button>
        )}
      </Box>

      {/* Erfolgssnackbar */}
      <Snackbar
        open={snackbarSuccessOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarSuccessOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarSuccessOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Daten erfolgreich gespeichert!
        </Alert>
      </Snackbar>

      {/* Fehlersnackbar */}
      <Snackbar
        open={snackbarErrorOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarErrorOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarErrorOpen(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {snackbarErrorMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Generator;

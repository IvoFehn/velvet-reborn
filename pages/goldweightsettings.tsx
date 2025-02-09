// components/GoldWeightSettings.tsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Slider,
  Grid,
  Box,
  Button,
  Alert,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { GoldWeights } from "@/types";

const sliderLabels: Record<keyof GoldWeights, string> = {
  obedience: "Gehorsam",
  vibeDuringSex: "Stimmung während des Sex",
  vibeAfterSex: "Stimmung nach dem Sex",
  orgasmIntensity: "Orgasmusintensität",
  painlessness: "Beschwerdefreiheit",
  ballsWorshipping: "Hodenanbetung",
  cumWorshipping: "Spermanbetung",
  didEverythingForHisPleasure: "Tat alles für sein Vergnügen",
};

export default function GoldWeightSettings() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Lokaler State für die Sliderwerte (0–100)
  const [localSliders, setLocalSliders] = useState<GoldWeights>({
    obedience: 30,
    vibeDuringSex: 15,
    vibeAfterSex: 15,
    orgasmIntensity: 10,
    painlessness: 10,
    ballsWorshipping: 10,
    cumWorshipping: 5,
    didEverythingForHisPleasure: 5,
  });

  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    fetch("/api/goldWeights")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const weights: GoldWeights = data.data;
          const newLocal: GoldWeights = {} as GoldWeights;
          // Für jeden Key: Gewicht * 100, da 1 → 100%
          for (const key in weights) {
            newLocal[key as keyof GoldWeights] = Math.round(
              weights[key as keyof GoldWeights] * 100
            );
          }
          setLocalSliders(newLocal);
        }
      })
      .catch(() =>
        setMessage({
          text: "Fehler beim Laden der Gewichtungen",
          type: "error",
        })
      );
  }, []);

  // Handler für Slider-Änderungen; wir casten value in number, falls es ein Array ist
  const handleSliderChange =
    (field: keyof GoldWeights) => (_: Event, value: number | number[]) => {
      const sliderValue = typeof value === "number" ? value : value[0];
      setLocalSliders((prev) => ({ ...prev, [field]: sliderValue }));
    };

  // Speichern: Normalisiere die Werte (Summe = 1) und sende per PUT an die API
  const handleSave = async () => {
    // Statt über die Summe zu normalisieren, teilen wir jeden Wert durch 100
    const updatedWeights: GoldWeights = {} as GoldWeights;
    for (const key in localSliders) {
      updatedWeights[key as keyof GoldWeights] = parseFloat(
        (localSliders[key as keyof GoldWeights] / 100).toFixed(3)
      );
    }

    try {
      const res = await fetch("/api/goldWeights", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedWeights),
      });
      const data = await res.json();
      if (!data.success) throw new Error();
      setMessage({
        text: "Gewichtungen erfolgreich gespeichert!",
        type: "success",
      });
    } catch {
      setMessage({
        text: "Fehler beim Speichern der Gewichtungen",
        type: "error",
      });
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: 4,
          boxShadow: theme.shadows[3],
          backgroundColor: "background.paper",
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{
            mb: 4,
            textAlign: "center",
            fontWeight: 700,
            color: "primary.main",
          }}
        >
          Goldgewichtungen
        </Typography>

        <Grid container spacing={3}>
          {Object.entries(localSliders).map(([key, value]) => (
            <Grid item xs={12} sm={6} key={key}>
              <Box sx={{ px: 1 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {sliderLabels[key as keyof GoldWeights]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {value}%
                  </Typography>
                </Stack>
                <Slider
                  value={value}
                  onChange={handleSliderChange(key as keyof GoldWeights)}
                  min={0}
                  max={100}
                  sx={{
                    color: "primary.main",
                    "& .MuiSlider-thumb": {
                      width: 14,
                      height: 14,
                      transition: "0.3s cubic-bezier(.47,1.64,.41,.8)",
                      "&:hover, &.Mui-focusVisible": {
                        boxShadow: "0 0 0 8px rgba(58, 133, 137, 0.16)",
                      },
                      "&.Mui-active": {
                        width: 20,
                        height: 20,
                      },
                    },
                  }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Button
            variant="contained"
            onClick={handleSave}
            size={isMobile ? "medium" : "large"}
            sx={{
              px: 6,
              fontWeight: 700,
              textTransform: "none",
              borderRadius: 2,
              boxShadow: theme.shadows[2],
              "&:hover": {
                boxShadow: theme.shadows[4],
              },
            }}
          >
            Einstellungen speichern
          </Button>

          {message && (
            <Alert
              severity={message.type}
              sx={{
                mt: 3,
                borderRadius: 2,
                "& .MuiAlert-message": {
                  fontWeight: 500,
                },
              }}
            >
              {message.text}
            </Alert>
          )}
        </Box>
      </Box>
    </Container>
  );
}

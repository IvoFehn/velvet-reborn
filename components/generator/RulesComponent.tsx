// src/components/RulesComponent.tsx

import React, { useState } from "react";
import {
  Box,
  Typography,
  Checkbox,
  Paper,
  Grid,
  useTheme,
  alpha,
  TextField,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { SingleRule } from "@/types";

type Props = {
  currentValue: SingleRule[];
  setValue: React.Dispatch<React.SetStateAction<SingleRule[]>>;
};

// Liste der Regeln mit Titel und Beschreibung
const predefinedRules: SingleRule[] = [
  {
    title: "Einfache Stille",
    description:
      "Stöhnen mit offenem Mund verboten, mit geschlossenem Mund ist es erlaubt",
    additionalNote: "",
  },
  {
    title: "Absolute Stille",
    description: "Sämtliche Geräusche machen ist verboten",
    additionalNote: "",
  },
  {
    title: "Handfesseln anlegen",
    description: "Handfesseln anlegen",
    additionalNote: "",
  },
  {
    title: "Fußfesseln anlegen",
    description: "Fußfesseln anlegen",
    additionalNote: "",
  },
  {
    title: "Knebel aufsetzen",
    description: "Knebel aufsetzen",
    additionalNote: "",
  },
  {
    title: "Augenmaske aufsetzen",
    description: "Augenmaske aufsetzen",
    additionalNote: "",
  },
  {
    title: "Cum Dump: Pussy mit Knoten",
    description:
      "Er zieht seinen Schwanz mit Kondom raus, knotet es zu und steckt es dir in die Pussy",
    additionalNote: "",
  },
  {
    title: "Cum Dump: Fotze.",
    description:
      "Er zieht Schwanz raus und lässt Kondom in der Fotze. Sie kümmert sich um den Rest.",
    additionalNote: "",
  },
  {
    title: "After Sex Freeze",
    description:
      "Nach dem Sex bleibst du in genau der Pose in der du bist. Der Timer fängt an zu laufen, wenn er den Raum verlässt. Sollte er den Raum erneut betreten, bleibt der Timer stehen und er fängt von vorne an zu laufen, wenn er den Raum verlässt. Du darfst dich erst sauber machen, wenn er 2 Minuten lang nicht den Raum betreten hat.",
    additionalNote: "",
  },
  {
    title: "Cum Cleaner",
    description:
      "Sie leckt den Schwanz sauber. Es darf keine stelle vergessen werden. Gib dir Mühe.",
    additionalNote: "",
  },
];

const RulesComponent: React.FC<Props> = ({ currentValue, setValue }) => {
  const theme = useTheme();
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");

  // Handler für das Umschalten der Regeln
  const handleRuleToggle = (title: string) => () => {
    setValue((prev) => {
      const exists = prev.some((r) => r.title === title);
      const rule = [
        ...predefinedRules,
        ...prev.filter(
          (r) => !predefinedRules.some((pr) => pr.title === r.title)
        ),
      ].find((r) => r.title === title);

      if (!rule) return prev;

      return exists
        ? prev.filter((r) => r.title !== title)
        : [...prev, { ...rule }];
    });
  };

  // Überprüfen, ob eine Regel ausgewählt ist
  const isChecked = (title: string) =>
    currentValue.some((r) => r.title === title);

  // Handler für die Änderung der additionalNote
  const handleNoteChange = (title: string, note: string) => {
    setValue((prev) =>
      prev.map((r) => (r.title === title ? { ...r, additionalNote: note } : r))
    );
  };

  // Handler für die Erstellung einer benutzerdefinierten Regel
  const handleAddCustomRule = () => {
    if (customTitle.trim() === "") return;

    const newRule: SingleRule = {
      title: customTitle,
      description: customDescription || "Benutzerdefinierte Regel",
      additionalNote: "",
    };

    setValue((prev) => {
      // Prüfen, ob der Titel bereits existiert
      if (prev.some((r) => r.title === customTitle)) {
        return prev;
      }
      return [...prev, newRule];
    });

    // Eingabefelder zurücksetzen
    setCustomTitle("");
    setCustomDescription("");
  };

  // Alle Regeln (vordefiniert und benutzerdefiniert) sammeln
  const allRules = [
    ...predefinedRules,
    ...currentValue.filter(
      (r) => !predefinedRules.some((pr) => pr.title === r.title)
    ),
  ];

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          fontWeight: 600,
          color: "primary.main",
          mb: 4,
          textAlign: "center",
        }}
      >
        Regeln Auswählen
      </Typography>

      {/* Bereich für benutzerdefinierte Regeln */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: "background.paper",
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Benutzerdefinierte Regel erstellen
        </Typography>

        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Titel"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            variant="outlined"
            size="small"
          />

          <TextField
            fullWidth
            label="Beschreibung"
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            variant="outlined"
            size="small"
            multiline
            rows={2}
          />

          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleAddCustomRule}
            disabled={!customTitle.trim()}
            sx={{ alignSelf: "flex-start" }}
          >
            Regel hinzufügen
          </Button>
        </Stack>
      </Paper>

      <Divider sx={{ my: 3 }} />

      <Grid container spacing={3}>
        {allRules.map((rule) => (
          <Grid item xs={12} sm={6} md={4} key={rule.title}>
            <Paper
              onClick={handleRuleToggle(rule.title)}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                cursor: "pointer",
                border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                transition: "all 0.2s ease",
                bgcolor: isChecked(rule.title)
                  ? alpha(theme.palette.primary.light, 0.15)
                  : "background.paper",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[3],
                },
              }}
              role="checkbox"
              aria-checked={isChecked(rule.title)}
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleRuleToggle(rule.title)();
                }
              }}
            >
              <Box display="flex" alignItems="flex-start">
                <Box sx={{ flex: 1, mr: 2 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ mb: 1 }}
                  >
                    {rule.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {rule.description}
                  </Typography>
                </Box>

                <Checkbox
                  checked={isChecked(rule.title)}
                  onChange={() => handleRuleToggle(rule.title)()}
                  sx={{
                    pointerEvents: "none",
                    color: "primary.main",
                    "&.Mui-checked": {
                      color: "primary.dark",
                    },
                  }}
                  inputProps={{
                    "aria-label": `${rule.title} - ${rule.description}`,
                  }}
                />
              </Box>

              {isChecked(rule.title) && (
                <Box onClick={(e) => e.stopPropagation()} sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Zusätzliche Notiz"
                    value={
                      currentValue.find((r) => r.title === rule.title)
                        ?.additionalNote || ""
                    }
                    onChange={(e) =>
                      handleNoteChange(rule.title, e.target.value)
                    }
                    multiline
                    rows={2}
                    variant="outlined"
                    size="small"
                    onClick={(e) => e.stopPropagation()}
                    InputProps={{
                      sx: {
                        backgroundColor: "background.default",
                      },
                    }}
                  />
                </Box>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RulesComponent;

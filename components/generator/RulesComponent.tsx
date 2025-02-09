// src/components/RulesComponent.tsx

import React from "react";
import {
  Box,
  Typography,
  Checkbox,
  Paper,
  Grid,
  useTheme,
  alpha,
} from "@mui/material";
import { SingleRule } from "@/types";

type Props = {
  currentValue: SingleRule[];
  setValue: React.Dispatch<React.SetStateAction<SingleRule[]>>;
};

// Liste der Regeln mit Titel und Beschreibung
const rulesList: SingleRule[] = [
  {
    title: "Einfache Stille",
    description:
      "Stöhnen mit offenem Mund verboten, mit geschlossenem Mund ist es erlaubt",
  },
  {
    title: "Absolute Stille",
    description: "Sämtliche Geräusche machen ist verboten",
  },
  {
    title: "Handfesseln anlegen",
    description: "Handfesseln anlegen",
  },
  {
    title: "Fußfesseln anlegen",
    description: "Fußfesseln anlegen",
  },
  {
    title: "Knebel aufsetzen",
    description: "Knebel aufsetzen",
  },
  {
    title: "Augenmaske aufsetzen",
    description: "Augenmaske aufsetzen",
  },
  {
    title: "Cum Dump: Pussy mit Knoten",
    description:
      "Er zieht seinen Schwanz mit Kondom raus, knotet es zu und steckt es dir in die Pussy",
  },
  {
    title: "Cum Dump: Fotze.",
    description:
      "Er zieht Schwanz raus und lässt Kondom in der Fotze. Sie kümmert sich um den Rest.",
  },
  {
    title: "After Sex Freeze",
    description:
      "Nach dem Sex bleibst du in genau der Pose in der du bist. Der Timer fängt an zu laufen, wenn er den Raum verlässt. Sollte er den Raum erneut betreten, bleibt der Timer stehen und er fängt von vorne an zu laufen, wenn er den Raum verlässt. Du darfst dich erst sauber machen, wenn er 2 Minuten lang nicht den Raum betreten hat.",
  },
  {
    title: "Cum Cleaner",
    description:
      "Sie leckt den Schwanz sauber. Es darf keine stelle vergessen werden. Gib dir Mühe.",
  },
];

const RulesComponent: React.FC<Props> = ({ currentValue, setValue }) => {
  const theme = useTheme();

  // Handler für das Umschalten der Regeln
  const handleRuleToggle = (title: string) => () => {
    setValue((prev) => {
      const exists = prev.some((r) => r.title === title);
      const rule = rulesList.find((r) => r.title === title)!;
      return exists
        ? prev.filter((r) => r.title !== title)
        : [...prev, { ...rule }];
    });
  };

  // Überprüfen, ob eine Regel ausgewählt ist
  const isChecked = (title: string) =>
    currentValue.some((r) => r.title === title);

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

      <Grid container spacing={3}>
        {rulesList.map((rule) => (
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
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RulesComponent;

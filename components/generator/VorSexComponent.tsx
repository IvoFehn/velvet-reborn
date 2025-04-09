import React, { useState } from "react";
import {
  Box,
  Typography,
  Checkbox,
  TextField,
  Paper,
  useTheme,
  Stack,
  alpha,
} from "@mui/material";
import { VorSexObjekt } from "@/types";

const predefinedOptions: { title: string; description: string }[] = [
  {
    title: "Kondom bereitstellen",
    description:
      "Trage bis nach dem Sex ein Kondom bei dir, auch wenn du für mich etwas vor dem Sex machen sollst und nicht direkt wartest.",
  },
  {
    title: "Kleine Show vor dem Sex",
    description:
      "Nach den Vorbereitungen, bevor du mich fragst, versuchst du mich geil zu machen, indem du mir eine kleine Show lieferst. Bspw. indem du vor meinen Augen den Saugnapfdildo reitest.",
  },
  {
    title: "Präsentation der Löcher",
    description:
      "Nach den Vorbereitungen, wenn du bereit bist, fragst du mich während du mir deine Löcher präsentierst. Wie du das machst, bleibt dir überlassen. Ich muss alles anfassen und gut sehen können.",
  },
  {
    title: "Foto von der Fotze schicken",
    description:
      "Nach den Vorbereitungen, schickst mir ein Foto von deiner Fotze.",
  },
  {
    title: "Foto nackt vor dem Spiegel",
    description:
      "Nach den Vorbereitungen, schickst mir ein Foto von dir nackt vor dem Spiegel.",
  },
  {
    title: "Foto vom Arschloch schicken",
    description:
      "Nach den Vorbereitungen, schickst du mir ein Foto von deinem Arschloch.",
  },
  {
    title: "Foto von den Titten schicken",
    description:
      "Nach den Vorbereitungen, schickst du mir zu der Frage ein Foto von deinen Titten.",
  },
  {
    title: "Video von Edging",
    description:
      "Nach den Vorbereitungen, schickst du mir ein Video, wie du dich zwei Mal edgest.",
  },
  {
    title: "Handtuch und Spielzeuge bereitlegen",
    description:
      "Du legst ein Handtuch bereit. Wenn Spielzeuge ausgewählt sind, dann lege diese auf das ausgebreitete Handtuch.",
  },
  {
    title: "Komfortables Angebot zum Lecken",
    description:
      "Nach den Vorbereitungen kommst du zu mir und bietest dich für mich möglichst komfortabel zum Lecken an. Dort, wo ich gerade stehe, sitze oder liege. Mach es so, dass ich am besten rankomme.",
  },
];

type Props = {
  currentValue: VorSexObjekt[];
  setValue: React.Dispatch<React.SetStateAction<VorSexObjekt[]>>;
};

const VorSexComponent: React.FC<Props> = ({ currentValue, setValue }) => {
  const theme = useTheme();
  // State zum Tracken des aktiven Textfelds
  const [activeTextFieldTitle, setActiveTextFieldTitle] = useState<
    string | null
  >(null);

  // Handler für das Umschalten der Checkboxen
  const handleCheckboxChange = (
    option: { title: string; description: string },
    checked: boolean,
    event?: React.MouseEvent | React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event) {
      event.stopPropagation();
    }

    // Wenn ein Textfeld aktiv ist, keine Änderung vornehmen
    if (activeTextFieldTitle) {
      return;
    }

    setValue((prev) => {
      const exists = prev.some((item) => item.title === option.title);

      if (checked && !exists) {
        return [...prev, { ...option, additionalNote: "" }];
      }

      if (!checked && exists) {
        return prev.filter((item) => item.title !== option.title);
      }

      return prev;
    });
  };

  // Handler für das Ändern der Additional Note
  const handleNoteChange = (title: string, note: string) => {
    setValue((prev) =>
      prev.map((item) =>
        item.title === title ? { ...item, additionalNote: note } : item
      )
    );
  };

  // Handler für Papier-Klick
  const handlePaperClick = (option: { title: string; description: string }) => {
    // Wenn ein Textfeld aktiv ist, keine Änderung vornehmen
    if (activeTextFieldTitle) {
      return;
    }

    const isChecked = currentValue.some((item) => item.title === option.title);
    handleCheckboxChange(option, !isChecked);
  };

  // Hilfsfunktion zum Verhindern der Propagation
  const preventPropagation = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Typography
        variant="h5"
        sx={{
          mb: 4,
          fontWeight: 600,
          color: "primary.main",
          textAlign: "center",
        }}
      >
        Vorbereitungen vor dem Sex
      </Typography>

      <Stack spacing={2}>
        {predefinedOptions.map((option) => {
          const isChecked = currentValue.some(
            (item) => item.title === option.title
          );
          const selectedItem = currentValue.find(
            (item) => item.title === option.title
          );

          return (
            <Paper
              key={option.title}
              elevation={0}
              onClick={() => handlePaperClick(option)}
              sx={{
                p: 2,
                borderRadius: 2,
                cursor: "pointer",
                border: `2px solid ${
                  isChecked ? theme.palette.primary.main : theme.palette.divider
                }`,
                bgcolor: isChecked
                  ? alpha(theme.palette.primary.light, 0.1)
                  : "background.paper",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[3],
                },
              }}
              role="checkbox"
              aria-checked={isChecked}
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handlePaperClick(option);
                }
              }}
            >
              <Box display="flex" alignItems="flex-start">
                <Box
                  onClick={preventPropagation}
                  onMouseDown={preventPropagation}
                  sx={{ mr: 2, mt: 0.5 }}
                >
                  <Checkbox
                    checked={isChecked}
                    color="primary"
                    onChange={(e) =>
                      handleCheckboxChange(option, e.target.checked, e)
                    }
                    onClick={preventPropagation}
                    onFocus={preventPropagation}
                    inputProps={{
                      "aria-label": `${option.title} - ${option.description}`,
                    }}
                  />
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={500}
                    sx={{ mb: 1 }}
                  >
                    {option.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {option.description}
                  </Typography>

                  {isChecked && (
                    <Box
                      onClick={preventPropagation}
                      onMouseDown={preventPropagation}
                      sx={{ mt: 2 }}
                    >
                      <TextField
                        label="Zusätzliche Notiz"
                        value={selectedItem?.additionalNote || ""}
                        onChange={(e) =>
                          handleNoteChange(option.title, e.target.value)
                        }
                        onFocus={() => setActiveTextFieldTitle(option.title)}
                        onBlur={() => setActiveTextFieldTitle(null)}
                        onClick={preventPropagation}
                        onMouseDown={preventPropagation}
                        onKeyDown={preventPropagation}
                        onKeyUp={preventPropagation}
                        fullWidth
                        multiline
                        rows={2}
                        variant="outlined"
                        size="small"
                        sx={{
                          "& .MuiInputBase-root": {
                            backgroundColor: theme.palette.background.default,
                          },
                        }}
                        InputProps={{
                          onClick: preventPropagation,
                          onMouseDown: preventPropagation,
                          onKeyDown: preventPropagation,
                          onKeyUp: preventPropagation,
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
};

export default VorSexComponent;

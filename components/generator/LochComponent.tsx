// src/components/LochComponent.tsx
import React from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Divider,
  Chip,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { LochObjekt } from "@/types";

const levelsPussy = {
  "Fotze - Einfache Bereitschaft": ["Anfeuchten (Vorzugsweise naturfeucht)"],
  "Fotze - Einfache Bereitschaft Plus": [
    "Anfeuchten (Vorzugsweise naturfeucht)",
    "Edged halten",
  ],
  "Fotze - Erweiterte Bereitschaft": [
    "Anfeuchten (Vorzugsweise naturfeucht)",
    "vordehnen",
  ],
  "Fotze - Erweiterte Bereitschaft Plus": [
    "Anfeuchten (Vorzugsweise naturfeucht)",
    "vordehnen",
    "Edged halten",
  ],
  "Fotze - Volle Bereitschaft": [
    "Anfeuchten (Vorzugsweise naturfeucht)",
    "vordehnen",
    "mit Spielzeug füllen",
  ],
  "Fotze - Volle Bereitschaft Plus": [
    "Anfeuchten (Vorzugsweise naturfeucht)",
    "Edged halten",
    "vordehnen",
    "mit Spielzeug füllen",
  ],
};

const levelsAss = {
  "Arsch - Einfache Bereitschaft": ["Anfeuchten"],
  "Arsch - Einfache Bereitschaft Plus": ["Anfeuchten", "Edged halten"],
  "Arsch - Erweiterte Bereitschaft": ["Anfeuchten", "vordehnen"],
  "Arsch - Erweiterte Bereitschaft Plus": [
    "Anfeuchten",
    "vordehnen",
    "Edged halten",
  ],
  "Arsch - Volle Bereitschaft": [
    "Anfeuchten",
    "vordehnen",
    "mit Spielzeug füllen",
    "Edged halten",
  ],
};

const legendItems = [
  {
    title: "Einfache Bereitschaft",
    description: "Nur Anfeuchten (Vorzugsweise naturfeucht).",
  },
  {
    title: "Einfache Bereitschaft Plus",
    description: "Anfeuchten und Edged halten.",
  },
  {
    title: "Erweiterte Bereitschaft",
    description: "Anfeuchten und vordehnen.",
  },
  {
    title: "Erweiterte Bereitschaft Plus",
    description: "Anfeuchten, vordehnen und Edged halten.",
  },
  {
    title: "Volle Bereitschaft",
    description: "Anfeuchten, vordehnen und mit Spielzeug füllen.",
  },
  {
    title: "Volle Bereitschaft Plus",
    description:
      "Anfeuchten, Edged halten, vordehnen und mit Spielzeug füllen.",
  },
];

const LochComponent: React.FC<{
  currentValue: LochObjekt;
  setValue: React.Dispatch<React.SetStateAction<LochObjekt>>;
}> = ({ currentValue, setValue }) => {
  const theme = useTheme();

  const handleChange = (area: "pussy" | "ass", selectedLevel: string) => {
    if (area === "pussy") {
      const selectedTags =
        levelsPussy[selectedLevel as keyof typeof levelsPussy];
      setValue((prev) => ({
        ...prev,
        [area]: { title: selectedLevel, tags: selectedTags },
      }));
    } else {
      const selectedTags = levelsAss[selectedLevel as keyof typeof levelsAss];
      setValue((prev) => ({
        ...prev,
        [area]: { title: selectedLevel, tags: selectedTags },
      }));
    }
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue((prev) => ({ ...prev, additionalNote: e.target.value }));
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Typography
        variant="h5"
        sx={{
          mb: 4,
          fontWeight: 600,
          color: "primary.main",
          textAlign: "center",
        }}
      >
        Loch-Einstellungen
      </Typography>

      <TextField
        label="Zusätzliche Notizen"
        value={currentValue.additionalNote}
        onChange={handleNoteChange}
        fullWidth
        multiline
        rows={3}
        sx={{ mb: 4 }}
        InputProps={{
          sx: {
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
          },
        }}
      />

      <Grid container spacing={4}>
        {(["pussy", "ass"] as const).map((area) => (
          <Grid item xs={12} md={6} key={area}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: "background.paper",
              }}
            >
              <FormControl fullWidth>
                <InputLabel id={`${area}-label`}>
                  {area === "pussy" ? "Pussy" : "Arsch"}
                </InputLabel>
                <Select
                  labelId={`${area}-label`}
                  value={currentValue[area].title}
                  label={area === "pussy" ? "Pussy" : "Arsch"}
                  onChange={(e) => handleChange(area, e.target.value)}
                  MenuProps={{ PaperProps: { sx: { borderRadius: 2, mt: 1 } } }}
                  sx={{
                    "& .MuiSelect-select": { py: 2 },
                    borderRadius: 2,
                  }}
                >
                  {(area === "pussy"
                    ? Object.keys(levelsPussy)
                    : Object.keys(levelsAss)
                  ).map((level) => (
                    <MenuItem key={level} value={level} sx={{ py: 1.5 }}>
                      <Typography variant="body1">{level}</Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
                {currentValue[area].tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    color={area === "pussy" ? "primary" : "secondary"}
                    variant="outlined"
                    sx={{
                      borderRadius: 1,
                      borderWidth: 2,
                      "& .MuiChip-label": { fontWeight: 500 },
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Accordion
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            bgcolor: "background.default",
            borderRadius: 3,
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Legende - Stufenübersicht
          </Typography>
        </AccordionSummary>

        <AccordionDetails>
          <Grid container spacing={3} sx={{ p: 2 }}>
            {legendItems.map((item) => (
              <Grid item xs={12} md={6} key={item.title}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default LochComponent;

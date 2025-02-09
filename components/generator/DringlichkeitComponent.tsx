// src/components/DringlichkeitComponent.tsx

import React from "react";
import {
  TextField,
  Autocomplete,
  Box,
  Typography,
  Paper,
  useTheme,
} from "@mui/material";
import { DringlichkeitObjekt } from "@/types";

type Props = {
  currentValue: DringlichkeitObjekt;
  setValue: React.Dispatch<React.SetStateAction<DringlichkeitObjekt>>;
};

interface DringlichkeitOption {
  title: string;
  description: string;
}

const predefinedOptions: DringlichkeitOption[] = [
  {
    title: "Sofort",
    description: "Du beginnst sofort mit der Vorbereitung.",
  },
  {
    title: "In der nächsten Stunde",
    description:
      "Irgendwann in der nächsten Stunde beginnst du mit der Vorbereitung.",
  },
  {
    title: "Sobald du Zeit hast. Sex hat Prio",
    description:
      "Du beginnst mit den Vorbereitungen sobald du Zeit hast. Vorrang haben hier nur wirklich wichtige Aktivitäten wie bspw. Arbeit oder weil du gerade bei jemanden zu Besuch bist oder jemand bei uns zu Besuch ist. Lesen wollen, fernschauen, essen etc. sind alles keine Priorität.",
  },
  {
    title: "Sobald du Ruhe hast",
    description:
      "Sobald du Zeit findest und nicht noch andere wichtige Dinge zu tun hast. Es soll auf jeden Fall noch an diesem Tag passieren und in absehbarer Zeit, aber du darfst dir wichtige Dinge in kürzerer Form zuende führen (bspw. aufessen, Kapitel zuende lesen).",
  },
  {
    title: "Im Laufe des Tages",
    description:
      "Irgendwann im Laufe des Tages, kein bestimmter Zeitpunkt, aber heute noch.",
  },
  {
    title: "Fertig wenn ich zuhause bin",
    description:
      "Passe das Ganze so ab, dass alles fertig ist, wenn ich zuhause eintreffe. Sei lieber etwas zu früh als etwas zu spät fertig.",
  },
];

const DringlichkeitComponent: React.FC<Props> = ({
  currentValue,
  setValue,
}) => {
  const theme = useTheme();

  return (
    <Box className="w-full" display="flex" flexDirection="column" gap={3}>
      <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
        Dringlichkeit auswählen
      </Typography>

      <Autocomplete
        value={currentValue.title ? currentValue : null}
        onChange={(event, newValue) => {
          if (typeof newValue === "string") {
            setValue({
              title: newValue,
              description: newValue,
            });
          } else if (newValue && newValue.title) {
            setValue(newValue);
          } else if (typeof newValue === "object" && newValue !== null) {
            setValue({
              title: newValue.title,
              description: newValue.title,
            });
          }
        }}
        freeSolo
        options={predefinedOptions}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.title
        }
        renderOption={(props, option) => (
          <li {...props} key={option.title}>
            <Box sx={{ width: "100%", py: 1 }}>
              <Typography variant="subtitle1">{option.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {option.description}
              </Typography>
            </Box>
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Dringlichkeit auswählen"
            variant="filled"
            InputProps={{
              ...params.InputProps,
              sx: {
                borderRadius: 2,
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? theme.palette.grey[800]
                    : theme.palette.grey[100],
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? theme.palette.grey[700]
                      : theme.palette.grey[200],
                },
                "&.Mui-focused": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? theme.palette.grey[700]
                      : theme.palette.grey[200],
                  boxShadow: theme.shadows[1],
                },
              },
            }}
            sx={{
              "& .MuiFilledInput-underline:before": { borderBottom: "none" },
              "& .MuiFilledInput-underline:after": { borderBottom: "none" },
            }}
          />
        )}
        sx={{
          "& .MuiAutocomplete-popper": {
            boxShadow: theme.shadows[3],
            borderRadius: 2,
          },
        }}
      />

      {currentValue.description && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "background.default",
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {currentValue.description}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default DringlichkeitComponent;

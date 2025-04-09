// src/components/DringlichkeitComponent.tsx

import React, { useState } from "react";
import {
  TextField,
  Autocomplete,
  Box,
  Typography,
  Paper,
  useTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
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
  const [openDialog, setOpenDialog] = useState(false);
  const [newOption, setNewOption] = useState<DringlichkeitOption>({
    title: "",
    description: "",
  });
  const [customOptions, setCustomOptions] = useState<DringlichkeitOption[]>([]);

  const handleAddCustomOption = () => {
    if (newOption.title.trim() === "") return;

    const option = {
      title: newOption.title,
      description: newOption.description || "Benutzerdefinierte Dringlichkeit",
    };

    setCustomOptions([...customOptions, option]);
    setValue(option);
    setNewOption({ title: "", description: "" });
    setOpenDialog(false);
  };

  const allOptions = [...predefinedOptions, ...customOptions];

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
              additionalNote: currentValue.additionalNote || "",
            });
          } else if (newValue && newValue.title) {
            setValue({
              title: newValue.title,
              description: newValue.description,
              additionalNote: currentValue.additionalNote || "",
            });
          } else if (typeof newValue === "object" && newValue !== null) {
            setValue({
              title: newValue.title,
              description: newValue.description || newValue.title,
              additionalNote: currentValue.additionalNote || "",
            });
          } else {
            setValue({
              title: "",
              description: "",
              additionalNote: currentValue.additionalNote || "",
            });
          }
        }}
        freeSolo
        options={allOptions}
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

      <Button
        variant="outlined"
        color="primary"
        startIcon={<AddCircleOutlineIcon />}
        onClick={() => setOpenDialog(true)}
        sx={{ alignSelf: "flex-start", mt: 1 }}
      >
        Benutzerdefinierte Dringlichkeit erstellen
      </Button>

      {currentValue.title && (
        <TextField
          fullWidth
          label="Zusätzliche Notiz"
          multiline
          rows={3}
          value={currentValue.additionalNote || ""}
          onChange={(e) =>
            setValue({
              ...currentValue,
              additionalNote: e.target.value,
            })
          }
          sx={{
            mt: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />
      )}

      {/* Dialog für benutzerdefinierte Option */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Benutzerdefinierte Dringlichkeit erstellen</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Titel"
              value={newOption.title}
              onChange={(e) =>
                setNewOption({ ...newOption, title: e.target.value })
              }
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Beschreibung"
              value={newOption.description}
              onChange={(e) =>
                setNewOption({ ...newOption, description: e.target.value })
              }
              multiline
              rows={3}
              variant="outlined"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Abbrechen</Button>
          <Button
            onClick={handleAddCustomOption}
            variant="contained"
            disabled={!newOption.title.trim()}
          >
            Hinzufügen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DringlichkeitComponent;

import React, { useState } from "react";
import {
  TextField,
  Autocomplete,
  createFilterOptions,
  useTheme,
  Typography,
  Box,
  Paper,
} from "@mui/material";

const filter = createFilterOptions<OutfitOption>();

interface OutfitOption {
  label: string;
  inputValue?: string;
}

interface OutfitWithNote {
  outfit: string;
  additionalNote: string;
}

type Props = {
  currentValue: OutfitWithNote;
  setValue: React.Dispatch<React.SetStateAction<OutfitWithNote>>;
};

const OutfitComponent = ({ currentValue, setValue }: Props) => {
  const theme = useTheme();
  const [options, setOptions] = useState<OutfitOption[]>([
    { label: "Vollständig nackt" },
    { label: "Rock/Kleid - nur untenrum ausziehen" },
    { label: "Hose über dem Po lassen" },
    { label: "Bleib wie du bist" },
    { label: "Einteiler-Dessous" },
    { label: "Zweiteiler-Dessous" },
    { label: "Japanisches Schulmädchen" },
    { label: "Wähle eigenes Dessous" },
    { label: "Netzkleid" },
  ]);

  return (
    <Box sx={{ width: "100%", py: 1 }}>
      <Autocomplete
        value={
          options.find((opt) => opt.label === currentValue.outfit) ??
          (currentValue.outfit ? { label: currentValue.outfit } : null)
        }
        onChange={(event, newValue) => {
          if (typeof newValue === "string") {
            setValue({
              outfit: newValue,
              additionalNote: currentValue.additionalNote,
            });
          } else if (newValue?.inputValue) {
            const newOption = { label: newValue.inputValue };
            setOptions((prev) => [...prev, newOption]);
            setValue({
              outfit: newValue.inputValue,
              additionalNote: currentValue.additionalNote,
            });
          } else if (newValue) {
            setValue({
              outfit: newValue.label,
              additionalNote: currentValue.additionalNote,
            });
          } else {
            setValue({
              outfit: "",
              additionalNote: currentValue.additionalNote,
            });
          }
        }}
        filterOptions={(existingOptions, params) => {
          const filtered = filter(existingOptions, params);

          if (
            params.inputValue &&
            !existingOptions.some((opt) => opt.label === params.inputValue)
          ) {
            filtered.push({
              label: `"${params.inputValue}" hinzufügen`,
              inputValue: params.inputValue,
            });
          }
          return filtered;
        }}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        options={options}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.label
        }
        renderOption={(props, option) => (
          <Box
            component="li"
            {...props}
            key={option.label}
            sx={{
              py: 1.5,
              borderBottom: `1px solid ${theme.palette.divider}`,
              "&:last-child": {
                borderBottom: "none",
              },
            }}
          >
            <Typography
              variant="body1"
              color={option.inputValue ? "primary" : "text.primary"}
              fontWeight={option.inputValue ? 600 : 400}
            >
              {option.inputValue ? option.label : option.label}
            </Typography>
          </Box>
        )}
        freeSolo
        renderInput={(params) => (
          <TextField
            {...params}
            label="Outfit auswählen"
            variant="filled"
            InputProps={{
              ...params.InputProps,
              sx: {
                borderRadius: 2,
                backgroundColor: theme.palette.background.default,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
                "&.Mui-focused": {
                  backgroundColor: theme.palette.background.default,
                  boxShadow: theme.shadows[2],
                },
              },
            }}
          />
        )}
        PaperComponent={(props) => (
          <Paper
            {...props}
            elevation={4}
            sx={{
              borderRadius: 2,
              mt: 1,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: theme.shadows[3],
            }}
          />
        )}
        sx={{
          "& .MuiAutocomplete-popper": {
            borderRadius: 2,
          },
        }}
      />

      {currentValue.outfit && (
        <>
          <Paper
            elevation={0}
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: "background.default",
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Ausgewähltes Outfit:
              <Box component="span" color="text.primary" ml={1}>
                {currentValue.outfit}
              </Box>
            </Typography>
          </Paper>

          <TextField
            fullWidth
            label="Zusätzliche Notizen zum Outfit"
            value={currentValue.additionalNote}
            onChange={(e) =>
              setValue({
                ...currentValue,
                additionalNote: e.target.value,
              })
            }
            multiline
            rows={3}
            variant="outlined"
            sx={{
              mt: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
              },
            }}
          />
        </>
      )}
    </Box>
  );
};

export default OutfitComponent;

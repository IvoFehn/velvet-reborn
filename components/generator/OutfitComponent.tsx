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

type Props = {
  currentValue: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
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
          options.find((opt) => opt.label === currentValue) ??
          (currentValue ? { label: currentValue } : null)
        }
        onChange={(event, newValue) => {
          if (typeof newValue === "string") {
            setValue(newValue);
          } else if (newValue?.inputValue) {
            const newOption = { label: newValue.inputValue };
            setOptions((prev) => [...prev, newOption]);
            setValue(newOption.label);
          } else if (newValue) {
            setValue(newValue.label);
          } else {
            setValue("");
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

      {currentValue && (
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
              {currentValue}
            </Box>
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default OutfitComponent;

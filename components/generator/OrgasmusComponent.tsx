import React, { useState } from "react";
import {
  TextField,
  Autocomplete,
  createFilterOptions,
  styled,
  Paper,
  Box,
  Typography,
  useTheme,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const filter = createFilterOptions<OrgasmusOption>();

interface OrgasmusOption {
  label: string;
  inputValue?: string;
}

type Props = {
  currentValue: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
};

const CustomPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(1),
  borderRadius: 12,
  boxShadow: theme.shadows[3],
  "& .MuiAutocomplete-option": {
    padding: theme.spacing(1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
    "&:last-child": {
      borderBottom: 0,
    },
    "&[data-focus='true']": {
      backgroundColor: theme.palette.action.hover,
    },
    "&.Mui-focused": {
      backgroundColor: "transparent",
    },
  },
}));

const OrgasmusComponent = ({ currentValue, setValue }: Props) => {
  const theme = useTheme();
  const [options, setOptions] = useState<OrgasmusOption[]>([
    { label: "Du hast Orgasmusverbot. Fragen ist nicht erlaubt." },
    {
      label:
        "Du darfst nicht selbst entscheiden, ob du einen Orgasmus hast. Du musst fragen, wenn du kurz davor bist. Wenn nicht anders in anderen Kategorien gewünscht, dann darfst du Geräusche machen.",
    },
    {
      label:
        "Du darfst einen Orgasmus haben wie du möchtest, darfst dir diesen aber nicht anmerken lassen. Kein Stöhnen, keine Lustgeräusche, kein Krampfen.",
    },
    {
      label:
        "Orgasmus haben wie du möchtest und dabei stöhnen, allerdings musst du die Pose halten ohne zu krampfen.",
    },
    {
      label:
        "Du entscheidest selbst, wie du deinen Orgasmus bekommst. Die Pose muss für die Zeit nicht weiter eingehalten werden.",
    },
  ]);

  return (
    <Box sx={{ width: 1, maxWidth: 800, mx: "auto" }}>
      <Autocomplete
        value={
          options.find((opt) => opt.label === currentValue) ??
          (currentValue ? { label: currentValue } : null)
        }
        onChange={(event, newValue) => {
          if (typeof newValue === "string") {
            setValue(newValue);
          } else if (newValue && newValue.inputValue) {
            const newOption: OrgasmusOption = { label: newValue.inputValue };
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
            params.inputValue !== "" &&
            !existingOptions.some((opt) => opt.label === params.inputValue)
          ) {
            filtered.push({
              label: `Neue Option hinzufügen: "${params.inputValue}"`,
              inputValue: params.inputValue,
            });
          }

          return filtered;
        }}
        componentsProps={{
          popper: {
            sx: {
              ".MuiAutocomplete-listbox": {
                maxHeight: 300,
              },
            },
          },
        }}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        options={options}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.label
        }
        renderOption={(props, option) => (
          <li {...props} key={option.label}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: 1,
                color: option.inputValue
                  ? theme.palette.primary.main
                  : "inherit",
              }}
            >
              {option.inputValue && (
                <AddCircleOutlineIcon
                  fontSize="small"
                  sx={{ mr: 1, color: "inherit" }}
                />
              )}
              <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                {option.inputValue
                  ? `Neue Option: ${option.inputValue}`
                  : option.label}
              </Typography>
            </Box>
          </li>
        )}
        freeSolo
        PaperComponent={CustomPaper}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Orgasmus-Einstellungen"
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                backgroundColor: theme.palette.background.paper,
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.light,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                  boxShadow: theme.shadows[1],
                },
              },
            }}
          />
        )}
      />
    </Box>
  );
};

export default OrgasmusComponent;

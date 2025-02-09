import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  useTheme,
  Chip,
  Checkbox,
} from "@mui/material";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { OrtItem } from "@/types";

const predefinedOptions = [
  "An Ort des Mannes",
  "An Ort der Frau",
  "Im Bett",
  "Auf dem Sofa",
  "Auf dem Tisch",
];

const OrtComponent: React.FC<{
  currentValue: OrtItem | null;
  setValue: React.Dispatch<React.SetStateAction<OrtItem | null>>;
}> = ({ currentValue, setValue }) => {
  const theme = useTheme();
  const [customInput, setCustomInput] = useState("");
  const [customOptions, setCustomOptions] = useState<string[]>([]);

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (
      trimmed &&
      ![...predefinedOptions, ...customOptions].includes(trimmed)
    ) {
      setCustomOptions((prev) => [...prev, trimmed]);
      setValue({ title: trimmed, additionalNote: "" });
      setCustomInput("");
    }
  };

  const allOptions = [...predefinedOptions, ...customOptions];

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Typography
        variant="h6"
        sx={{
          mb: 4,
          fontWeight: 700,
          color: "text.primary",
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        Ortskonfiguration
      </Typography>

      <Stack spacing={2} sx={{ mb: 4 }}>
        {allOptions.map((option) => {
          const isSelected = currentValue?.title === option;

          return (
            <Paper
              key={option}
              sx={{
                p: 2.5,
                borderRadius: 2,
                cursor: "pointer",
                borderLeft: `4px solid ${
                  isSelected ? theme.palette.primary.main : "transparent"
                }`,
                bgcolor: "background.paper",
                transition: "all 0.2s ease",
                boxShadow: theme.shadows[1],
                "&:hover": {
                  transform: "translateX(4px)",
                  boxShadow: theme.shadows[3],
                },
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                gap={2}
                onClick={() =>
                  setValue((prev) =>
                    prev?.title === option
                      ? null
                      : { title: option, additionalNote: "" }
                  )
                }
              >
                <Checkbox
                  checked={isSelected}
                  color="primary"
                  icon={
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        border: `2px solid ${theme.palette.divider}`,
                        borderRadius: 4,
                      }}
                    />
                  }
                  checkedIcon={<CheckCircleRoundedIcon color="primary" />}
                />

                <Typography variant="body1" fontWeight={500}>
                  {option}
                  {customOptions.includes(option) && (
                    <Chip
                      label="Custom"
                      size="small"
                      variant="outlined"
                      sx={{
                        ml: 2,
                        fontSize: "0.7rem",
                        borderColor: "secondary.main",
                        color: "secondary.dark",
                      }}
                    />
                  )}
                </Typography>
              </Box>

              {isSelected && (
                <Box
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <TextField
                    label="Spezielle Anforderungen"
                    placeholder="Zusätzliche Details oder Besonderheiten"
                    value={currentValue?.additionalNote || ""}
                    onChange={(e) =>
                      setValue({
                        ...currentValue,
                        additionalNote: e.target.value,
                      })
                    }
                    fullWidth
                    multiline
                    rows={2}
                    sx={{ mt: 2 }}
                    InputProps={{
                      onClick: (e) => e.stopPropagation(),
                      sx: {
                        borderRadius: 1.5,
                        backgroundColor: "background.default",
                        "&:before": { borderBottom: "none" },
                      },
                    }}
                  />
                </Box>
              )}
            </Paper>
          );
        })}
      </Stack>

      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: "background.default",
          boxShadow: theme.shadows[1],
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Custom Location erstellen
        </Typography>

        <Box display="flex" gap={1.5} alignItems="center">
          <TextField
            fullWidth
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            label="Neuen Ort definieren"
            variant="outlined"
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "background.paper",
              },
            }}
          />

          <Button
            variant="contained"
            onClick={handleAddCustom}
            disabled={!customInput.trim()}
            startIcon={<AddCircleOutlineRoundedIcon />}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              minWidth: "auto",
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Anlegen
          </Button>
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          sx={{ mt: 1 }}
        >
          Der Ort wird automatisch ausgewählt und erscheint in der Liste
        </Typography>
      </Paper>

      {currentValue && (
        <Paper
          sx={{
            mt: 4,
            p: 2.5,
            borderRadius: 2,
            bgcolor: "primary.light",
            border: `1px solid ${theme.palette.primary.main}`,
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <CheckCircleRoundedIcon color="primary" fontSize="small" />
            <Typography variant="body2" fontWeight={500}>
              Aktive Auswahl:{" "}
              <Box component="span" color="primary.dark">
                {currentValue.title}
              </Box>
            </Typography>
          </Box>

          {currentValue.additionalNote && (
            <Typography
              variant="body2"
              sx={{
                mt: 1.5,
                pl: 3.5,
                color: "text.secondary",
                fontStyle: "italic",
              }}
            >
              &quot;{currentValue.additionalNote}&quot;
            </Typography>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default React.memo(OrtComponent);

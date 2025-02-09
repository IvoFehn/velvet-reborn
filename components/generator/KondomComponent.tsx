import React from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  useTheme,
  Divider,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { SingleCondomObject } from "@/types";

type Props = {
  currentValue: SingleCondomObject[];
  setValue: React.Dispatch<React.SetStateAction<SingleCondomObject[]>>;
};

const kondomFields = [
  "Ausgepackt auf Arsch",
  "Ausgepackt in Fotze",
  "Ausgepackt beste Stelle",
  "Eingepackt auf Arsch",
  "Eingepackt beste Stelle",
];

const KondomComponent = ({ currentValue, setValue }: Props) => {
  const theme = useTheme();

  const handleChange =
    (title: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Math.min(Math.max(Number(e.target.value), 0), 5);
      updateValue(title, value);
    };

  const updateValue = (title: string, amount: number) => {
    setValue((prev) =>
      prev
        .filter((item) => item.title !== title)
        .concat(amount > 0 ? [{ title, amount }] : [])
    );
  };

  const getValue = (title: string) =>
    currentValue.find((item) => item.title === title)?.amount || 0;

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: "auto",
        p: 3,
        bgcolor: "background.paper",
        borderRadius: 4,
        boxShadow: theme.shadows[1],
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          color: "primary.main",
          fontWeight: 600,
          textAlign: "center",
        }}
      >
        Kondomverteilung
      </Typography>

      <Stack spacing={2} divider={<Divider flexItem />}>
        {kondomFields.map((title) => {
          const value = getValue(title);

          return (
            <Box
              key={title}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 1,
                py: 1.5,
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  flex: 1,
                  mr: 2,
                  fontWeight: 500,
                  color: "text.secondary",
                }}
              >
                {title}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  onClick={() => updateValue(title, value - 1)}
                  disabled={value <= 0}
                  sx={{
                    color: "error.main",
                    border: `1px solid ${theme.palette.divider}`,
                    "&:hover": {
                      bgcolor: "error.light",
                    },
                  }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>

                <TextField
                  value={value}
                  onChange={handleChange(title)}
                  variant="outlined"
                  size="small"
                  inputProps={{
                    min: 0,
                    max: 5,
                    style: {
                      textAlign: "center",
                      width: 40,
                      padding: "8px 0",
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                      backgroundColor: theme.palette.background.default,
                      "& fieldset": {
                        borderColor: theme.palette.divider,
                      },
                    },
                  }}
                />

                <IconButton
                  onClick={() => updateValue(title, value + 1)}
                  disabled={value >= 5}
                  sx={{
                    color: "success.main",
                    border: `1px solid ${theme.palette.divider}`,
                    "&:hover": {
                      bgcolor: "success.light",
                    },
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

export default KondomComponent;

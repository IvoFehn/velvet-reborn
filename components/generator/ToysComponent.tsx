import { ToyObject, SingleToy } from "@/types";
import React, { useState } from "react";
import {
  Box,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  TextField,
  Typography,
  Chip,
  Divider,
  Paper,
  Button,
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Close as CloseIcon,
  Face as FaceIcon,
  Woman as WomanIcon,
  BackHand as BackHandIcon,
} from "@mui/icons-material";

const toys: string[] = [
  "G-Punkt Vibrator (Knickbar)",
  "G-Punkt Vibrator",
  "Analkette",
  "Anal Plug",
  "Doppeldildo",
  "Fuchsschwanz",
  "Fingeraufsatz",
  "Vibrationsperlen",
];

const areaIcons = {
  mouth: <FaceIcon fontSize="small" />,
  pussy: <WomanIcon fontSize="small" />,
  ass: <BackHandIcon fontSize="small" />,
};

type Props = {
  currentValue: ToyObject;
  setValue: React.Dispatch<React.SetStateAction<ToyObject>>;
};

const ToysComponent: React.FC<Props> = ({ currentValue, setValue }) => {
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [selectedToy, setSelectedToy] = useState<string>("");
  const [amount, setAmount] = useState<number>(1);

  const handleAdd = () => {
    if (!selectedArea || !selectedToy || amount <= 0) return;

    const newToy: SingleToy = { title: selectedToy, amount };
    const areaToys = currentValue[
      selectedArea as keyof ToyObject
    ] as SingleToy[];
    const existingIndex = areaToys.findIndex((t) => t.title === selectedToy);

    if (existingIndex > -1) {
      areaToys[existingIndex] = newToy;
    } else {
      areaToys.push(newToy);
    }

    setValue({
      ...currentValue,
      [selectedArea]: areaToys,
    });

    setSelectedArea("");
    setSelectedToy("");
    setAmount(1);
  };

  const handleRemove = (area: keyof ToyObject, index: number) => {
    const areaToys = currentValue[area] as SingleToy[];
    const updatedToys = areaToys.filter((_, i) => i !== index);
    setValue({ ...currentValue, [area]: updatedToys });
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Spielzeugverwaltung
      </Typography>

      {/* Eingabebereich */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Bereich"
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              variant="outlined"
            >
              <MenuItem value="mouth">Mund</MenuItem>
              <MenuItem value="pussy">Pussy</MenuItem>
              <MenuItem value="ass">Ass</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={5}>
            <TextField
              select
              fullWidth
              label="Spielzeug auswählen"
              value={selectedToy}
              onChange={(e) => setSelectedToy(e.target.value)}
              variant="outlined"
            >
              {toys.map((toy) => (
                <MenuItem key={toy} value={toy}>
                  {toy}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Menge"
              value={amount}
              onChange={(e) => {
                const val = Math.min(10, Math.max(1, Number(e.target.value)));
                setAmount(val);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton
                      size="small"
                      onClick={() => setAmount((p) => Math.max(1, p - 1))}
                    >
                      <RemoveIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setAmount((p) => Math.min(10, p + 1))}
                    >
                      <AddIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              inputProps={{ min: 1, max: 10 }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Zusätzliche Notizen"
              value={currentValue.additionalNote}
              onChange={(e) =>
                setValue({ ...currentValue, additionalNote: e.target.value })
              }
              multiline
              rows={3}
              sx={{ mt: 2 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleAdd}
              disabled={!selectedArea || !selectedToy}
              sx={{ mt: 1, py: 1.5 }}
            >
              Hinzufügen
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Angezeigte Liste */}
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
          Aktive Spielzeuge
        </Typography>

        {(["mouth", "pussy", "ass"] as const).map((area) => {
          const areaToys = currentValue[area] as SingleToy[];
          return (
            <Box key={area} sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                  bgcolor: "action.hover",
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                }}
              >
                {areaIcons[area]}
                <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 500 }}>
                  {area.charAt(0).toUpperCase() + area.slice(1)}
                </Typography>
                <Chip
                  label={`${areaToys.length} Einträge`}
                  size="small"
                  sx={{ ml: 2 }}
                />
              </Box>

              {areaToys.length === 0 ? (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ px: 2 }}
                >
                  Keine Spielzeuge hinzugefügt
                </Typography>
              ) : (
                <List dense>
                  {areaToys.map((toy, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={() => handleRemove(area, index)}
                          color="error"
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      }
                      sx={{
                        py: 0.5,
                        "&:hover": { bgcolor: "action.hover" },
                        borderRadius: 1,
                      }}
                    >
                      <ListItemText
                        primary={toy.title}
                        secondary={`Menge: ${toy.amount}`}
                        primaryTypographyProps={{ variant: "body2" }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              <Divider sx={{ mt: 2 }} />
            </Box>
          );
        })}
      </Paper>
    </Box>
  );
};

export default ToysComponent;

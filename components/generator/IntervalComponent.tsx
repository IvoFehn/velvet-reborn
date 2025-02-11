// src/components/generator/IntervalComponent.tsx
import React, { useState, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import dayjs, { Dayjs } from "dayjs";
import CustomDateTimePicker from "../customDateTimePicker/CustomDateTimePicker";

type Props = {
  currentValue: Dayjs[];
  setValue: React.Dispatch<React.SetStateAction<Dayjs[]>>;
};

const IntervalComponent: React.FC<Props> = ({ currentValue, setValue }) => {
  const [newDate, setNewDate] = useState<Dayjs | null>(null);
  const [error, setError] = useState<string>("");

  // Sortierte Liste der Daten
  const sortedDates = useMemo(() => {
    return [...currentValue].sort((a, b) => a.diff(b));
  }, [currentValue]);

  const handleAddDate = useCallback(() => {
    if (!newDate) {
      setError("Bitte wählen Sie ein gültiges Datum aus");
      return;
    }

    // Überprüfen, ob das Datum (inklusive Uhrzeit) mindestens 5 Minuten in der Zukunft liegt
    if (newDate.diff(dayjs(), "minute") < 5) {
      setError("Datum muss mindestens 5 Minuten in der Zukunft liegen");
      return;
    }

    if (currentValue.some((d) => d.isSame(newDate))) {
      setError("Dieses Datum existiert bereits");
      return;
    }

    setValue((prev) => [...prev, newDate].sort((a, b) => a.diff(b)));
    setNewDate(null);
    setError("");
  }, [currentValue, newDate, setValue]);

  const handleRemoveDate = useCallback(
    (dateToRemove: Dayjs) => {
      setValue((prev) => prev.filter((d) => !d.isSame(dateToRemove)));
    },
    [setValue]
  );

  return (
    <Box className="w-full" display="flex" flexDirection="column" gap={4}>
      <Typography variant="h5" gutterBottom>
        Intervalle festlegen
      </Typography>

      <Box display="flex" flexDirection="column" gap={2}>
        <CustomDateTimePicker
          value={newDate}
          onChange={setNewDate}
          minDate={dayjs()}
        />
        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
        <Button
          variant="contained"
          onClick={handleAddDate}
          disabled={!newDate}
          sx={{ alignSelf: "flex-start" }}
        >
          Datum hinzufügen
        </Button>
      </Box>

      {sortedDates.length > 0 && (
        <List sx={{ width: "100%", bgcolor: "background.paper" }}>
          {sortedDates.map((date, index) => (
            <React.Fragment key={date.toISOString()}>
              <ListItem
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveDate(date)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={`Termin ${index + 1}`}
                  secondary={date.format("LLL")}
                />
              </ListItem>
              {index < sortedDates.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}

      {sortedDates.length === 0 && (
        <Typography variant="body2" color="textSecondary">
          Noch keine Intervalle festgelegt
        </Typography>
      )}
    </Box>
  );
};

export default React.memo(IntervalComponent);

// components/EventCreator.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
  Grid,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import CustomDateTimePicker from "@/components/customDateTimePicker/CustomDateTimePicker";
import EventCard from "@/components/eventCard/EventCard";
import { useConfirm } from "material-ui-confirm";

// Typdefinition für ein Event
export interface EventType {
  id?: string;
  title: string;
  description: string;
  startDate: string; // ISO-Datum
  endDate: string; // ISO-Datum
  recurring: boolean;
  recurrence?: "daily" | "weekly" | "monthly" | "yearly";
}

const EventCreator: React.FC = () => {
  // Formulardaten
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [recurring, setRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("daily");

  // Für Erfolg-/Fehlermeldungen
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Abgerufene (kommende) Events
  const [upcomingEvents, setUpcomingEvents] = useState<EventType[]>([]);

  // ID des Events im Bearbeitungsmodus (null = Create-Modus)
  const [editEventId, setEditEventId] = useState<string | null>(null);

  const confirm = useConfirm();

  // Hole Events von der API – die API liefert nur Events, deren endDate in der Zukunft liegt.
  const fetchUpcomingEvents = async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (data.success) {
        setUpcomingEvents(data.events);
      }
    } catch (err) {
      console.error("Fehler beim Abrufen der Events:", err);
    }
  };

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartDate(dayjs());
    setEndDate(dayjs());
    setRecurring(false);
    setRecurrence("daily");
    setEditEventId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basisvalidierung: Alle Felder ausfüllen und Enddatum muss in der Zukunft liegen.
    if (!title || !description || !startDate || !endDate) {
      setError("Bitte füllen Sie alle Felder aus.");
      return;
    }

    if (endDate.isSameOrBefore(dayjs())) {
      setError("Das Enddatum muss in der Zukunft liegen.");
      return;
    }

    const eventData: EventType = {
      title,
      description,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      recurring,
      recurrence: recurring ? recurrence : undefined,
    };

    try {
      const url = editEventId ? `/api/events/${editEventId}` : "/api/events";
      const method = editEventId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(
          editEventId
            ? "Event erfolgreich aktualisiert!"
            : "Event erfolgreich erstellt!"
        );
        resetForm();
        fetchUpcomingEvents();
      } else {
        setError(
          data.message || "Fehler beim Erstellen/Aktualisieren des Events."
        );
      }
    } catch (err) {
      console.error(err);
      setError("Fehler beim Erstellen/Aktualisieren des Events.");
    }
  };

  const handleEdit = (event: EventType) => {
    setEditEventId(event.id || null);
    setTitle(event.title);
    setDescription(event.description);
    setStartDate(dayjs(event.startDate));
    setEndDate(dayjs(event.endDate));
    setRecurring(event.recurring);
    setRecurrence(event.recurrence || "daily");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (eventId: string) => {
    try {
      await confirm({
        title: "Event löschen?",
        description: "Sind Sie sicher, dass Sie dieses Event löschen möchten?",
      });
      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSuccess("Event erfolgreich gelöscht!");
        fetchUpcomingEvents();
      } else {
        setError("Fehler beim Löschen des Events.");
      }
    } catch (err) {
      if (!String(err).includes("cancel")) {
        setError("Löschen fehlgeschlagen");
      }
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {editEventId ? "Event bearbeiten" : "Neues Event erstellen"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Titel"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Beschreibung"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            required
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Startdatum und -zeit
          </Typography>
          <CustomDateTimePicker
            value={startDate}
            onChange={setStartDate}
            minDate={dayjs()}
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Enddatum und -zeit
            </Typography>
            <CustomDateTimePicker
              value={endDate}
              onChange={setEndDate}
              minDate={dayjs()}
            />
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={recurring}
                onChange={(e) => setRecurring(e.target.checked)}
              />
            }
            label="Wiederkehrendes Event?"
            sx={{ mb: recurring ? 1 : 2 }}
          />

          {recurring && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="recurrence-label">Wiederholung</InputLabel>
              <Select
                labelId="recurrence-label"
                value={recurrence}
                label="Wiederholung"
                onChange={(e) =>
                  setRecurrence(
                    e.target.value as "daily" | "weekly" | "monthly" | "yearly"
                  )
                }
              >
                <MenuItem value="daily">Täglich</MenuItem>
                <MenuItem value="weekly">Wöchentlich</MenuItem>
                <MenuItem value="monthly">Monatlich</MenuItem>
                <MenuItem value="yearly">Jährlich</MenuItem>
              </Select>
            </FormControl>
          )}

          <Button variant="contained" type="submit" fullWidth sx={{ mt: 2 }}>
            {editEventId ? "Event aktualisieren" : "Event erstellen"}
          </Button>
        </form>
      </Box>

      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Kommende Events
        </Typography>
        {upcomingEvents.length === 0 ? (
          <Typography>Keine kommenden Events.</Typography>
        ) : (
          <Grid container spacing={2}>
            {upcomingEvents.map((event) => (
              <Grid item xs={12} md={6} key={event.id}>
                <EventCard
                  event={event}
                  onEdit={() => handleEdit(event)}
                  onDelete={() => event.id && handleDelete(event.id)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default EventCreator;

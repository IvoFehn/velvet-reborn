/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  Snackbar,
  Box,
  Chip,
  Divider,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import {
  Add,
  Edit,
  Check,
  Save,
  Info,
  Delete,
  Repeat,
  Event as EventIcon,
  CalendarMonth,
} from "@mui/icons-material";
import CustomDateTimePicker from "@/components/customDateTimePicker/CustomDateTimePicker";
import { useConfirm } from "material-ui-confirm";
import { EventData } from "@/models/Event";
import Head from "next/head";

const recurrenceOptions = [
  { value: "daily", label: "Täglich" },
  { value: "weekly", label: "Wöchentlich" },
  { value: "monthly", label: "Monatlich" },
  { value: "quarterly", label: "Quartalsweise (alle 3 Monate)" },
  { value: "biannually", label: "Halbjährlich (alle 6 Monate)" },
  { value: "yearly", label: "Jährlich" },
];

const recurrenceLabels: Record<string, string> = {
  daily: "Täglich",
  weekly: "Wöchentlich",
  monthly: "Monatlich",
  quarterly: "Quartalsweise",
  biannually: "Halbjährlich",
  yearly: "Jährlich",
};

type RecurrenceType =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "biannually"
  | "yearly";

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStartDate, setNewStartDate] = useState<Dayjs | null>(dayjs());
  const [newEndDate, setNewEndDate] = useState<Dayjs | null>(
    dayjs().add(1, "hour")
  );
  const [newRecurring, setNewRecurring] = useState(false);
  const [newRecurrence, setNewRecurrence] = useState<RecurrenceType>("daily");

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStartDate, setEditStartDate] = useState<Dayjs | null>(dayjs());
  const [editEndDate, setEditEndDate] = useState<Dayjs | null>(
    dayjs().add(1, "hour")
  );
  const [editRecurring, setEditRecurring] = useState(false);
  const [editRecurrence, setEditRecurrence] = useState<RecurrenceType>("daily");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const confirm = useConfirm();

  /**
   * Filtert doppelte Events und stellt sicher, dass jedes Event nur einmal angezeigt wird.
   * Priorisiert die Anzeige des Hauptevents (isOccurrence=false) vor Wiederholungsvorkommen.
   */
  const filterDuplicateEvents = (eventsToFilter: EventData[]): EventData[] => {
    const seen = new Map<string, EventData>();

    // Zuerst alle Events nach ID gruppieren
    const eventsById = new Map<string, EventData[]>();

    eventsToFilter.forEach((event) => {
      const eventId = event._id || "";
      const origId = event.originalEventId || "";

      // Entweder eigene ID oder originalId als Schlüssel
      const key = eventId || origId;

      if (!eventsById.has(key)) {
        eventsById.set(key, []);
      }

      const group = eventsById.get(key) || [];
      group.push(event);
      eventsById.set(key, group);
    });

    // Aus jeder Gruppe nur ein Event auswählen (bevorzugt das Original)
    eventsById.forEach((eventGroup, key) => {
      // Priorisiere Original-Events (isOccurrence = false)
      const originals = eventGroup.filter((e) => !e.isOccurrence);
      if (originals.length > 0) {
        seen.set(key, originals[0]);
      } else {
        // Wenn kein Original verfügbar ist, nimm das erste Vorkommen
        seen.set(key, eventGroup[0]);
      }
    });

    // Zusätzliche Deduplizierung basierend auf Titel und Startdatum
    // Für Events, die identisch sind, aber unterschiedliche IDs haben könnten
    const result = Array.from(seen.values());
    const finalResult = [];
    const seenTitleDate = new Set<string>();

    for (const event of result) {
      const titleDateKey = `${event.title}-${event.startDate}`;
      if (!seenTitleDate.has(titleDateKey)) {
        seenTitleDate.add(titleDateKey);
        finalResult.push(event);
      }
    }

    return finalResult;
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events");
      const { events } = await res.json();

      // Doppelte Events filtern, bevor sie gesetzt werden
      const filteredEvents = filterDuplicateEvents(events);

      console.log("Original-Events:", events.length);
      console.log("Gefilterte Events:", filteredEvents.length);

      setEvents(filteredEvents);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Fehler beim Laden der Events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm(newTitle, newDescription, newStartDate, newEndDate))
      return;

    // Überprüfe die Datumswerte und stelle sicher, dass sie gültig sind
    if (!newStartDate?.isValid() || !newEndDate?.isValid()) {
      setError("Ungültiges Datum. Bitte wähle ein gültiges Datum aus.");
      return;
    }

    const eventData = {
      title: newTitle,
      description: newDescription,
      startDate: newStartDate
        ? newStartDate.format("YYYY-MM-DDTHH:mm:ssZ")
        : undefined,
      endDate: newEndDate
        ? newEndDate.format("YYYY-MM-DDTHH:mm:ssZ")
        : undefined,
      recurring: newRecurring,
      recurrence: newRecurring ? newRecurrence : undefined,
      // No recurrenceEnd - events will run indefinitely
    };

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      if (res.ok) {
        const { event } = await res.json(); // Get the newly created event from response

        // Typabsicherung: Wenn das API keine vollständige Antwort liefert, erstellen wir das Objekt selbst
        const newEvent: EventData = event || {
          _id: new Date().getTime().toString(), // Temporäre ID für UI-Zwecke
          title: newTitle,
          description: newDescription,
          startDate: newStartDate.toDate(), // Wandelt Dayjs in Date-Objekt um
          endDate: newEndDate.toDate(),
          recurring: newRecurring,
          recurrence: newRecurring ? newRecurrence : undefined,
        };

        // Add the new event to state immediately for instant UI update
        setEvents((prevEvents) => {
          const updatedEvents = [...prevEvents, newEvent];
          return filterDuplicateEvents(updatedEvents);
        });

        setSuccess("Event erfolgreich erstellt");
        resetCreateForm();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Fehler beim Erstellen des Events");
      }
    } catch (err) {
      setError("Fehler bei der Anfrage");
    }
  };

  const resetCreateForm = () => {
    setNewTitle("");
    setNewDescription("");
    setNewStartDate(dayjs());
    setNewEndDate(dayjs().add(1, "hour"));
    setNewRecurring(false);
    setNewRecurrence("daily");
  };

  const openEditDialog = (event: EventData) => {
    setCurrentEvent(event);
    setEditTitle(event.title);
    setEditDescription(event.description);
    setEditStartDate(dayjs(event.startDate));
    setEditEndDate(dayjs(event.endDate));
    setEditRecurring(event.recurring);
    setEditRecurrence(event.recurrence || "daily");
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (
      (!currentEvent?._id && !currentEvent?.originalEventId) ||
      !validateForm(editTitle, editDescription, editStartDate, editEndDate)
    )
      return;

    // Überprüfe die Datumswerte und stelle sicher, dass sie gültig sind
    if (!editStartDate?.isValid() || !editEndDate?.isValid()) {
      setError("Ungültiges Datum. Bitte wähle ein gültiges Datum aus.");
      return;
    }

    const eventData = {
      title: editTitle,
      description: editDescription,
      startDate: editStartDate
        ? editStartDate.format("YYYY-MM-DDTHH:mm:ssZ")
        : undefined,
      endDate: editEndDate
        ? editEndDate.format("YYYY-MM-DDTHH:mm:ssZ")
        : undefined,
      recurring: editRecurring,
      recurrence: editRecurring ? editRecurrence : undefined,
      // No recurrenceEnd - events will run indefinitely
    };

    // ID bestimmen: Entweder die eigene _id oder die originalEventId für Wiederholungen
    const eventId = currentEvent?._id || currentEvent?.originalEventId;

    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      if (res.ok) {
        // Hier gab es einen Typfehler mit den Date-Objekten vs. Strings
        // Wir erstellen ein EventData-kompatibles Objekt mit korrekten Date-Typen
        const updatedEvent: EventData = {
          ...currentEvent!,
          title: editTitle,
          description: editDescription,
          startDate: editStartDate ? editStartDate.toDate() : new Date(),
          endDate: editEndDate ? editEndDate.toDate() : new Date(),
          recurring: editRecurring,
          recurrence: editRecurring ? editRecurrence : undefined,
        };

        // Update the event in state immediately for instant UI update
        setEvents((prevEvents) => {
          const updatedEvents = prevEvents.map((e) => {
            // Match by ID or originalEventId
            const currentId = getEventId(e);
            if (currentId === eventId) {
              return updatedEvent;
            }
            return e;
          });

          return filterDuplicateEvents(updatedEvents);
        });

        setSuccess("Event erfolgreich aktualisiert");
        setEditDialogOpen(false);
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Fehler beim Aktualisieren des Events");
      }
    } catch (err) {
      setError("Fehler bei der Anfrage");
    }
  };

  const validateForm = (
    title: string,
    description: string,
    startDate: Dayjs | null,
    endDate: Dayjs | null
  ) => {
    if (!title || !description || !startDate || !endDate) {
      setError("Bitte fülle alle Pflichtfelder aus");
      return false;
    }

    // Überprüfen, ob die Datumswerte gültig sind
    if (!startDate.isValid() || !endDate.isValid()) {
      setError("Ungültiges Datum. Bitte wähle ein gültiges Datum aus.");
      return false;
    }

    if (endDate.isBefore(startDate)) {
      setError("Das Enddatum muss nach dem Startdatum liegen");
      return false;
    }

    return true;
  };

  const handleDelete = async (eventId: string) => {
    try {
      await confirm({
        title: "Event löschen?",
        description: "Diese Aktion kann nicht rückgängig gemacht werden",
        confirmationText: "Löschen",
        confirmationButtonProps: { color: "error" },
      });

      console.log("Versuche Event mit ID zu löschen:", eventId); // Debugging

      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      if (res.ok) {
        // Remove the event from state immediately for instant UI update
        setEvents((prevEvents) => {
          return prevEvents.filter((event) => {
            const currentId = getEventId(event);
            return currentId !== eventId;
          });
        });

        setSuccess("Event erfolgreich gelöscht");
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Fehler beim Löschen des Events");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleNewRecurrenceChange = (event: SelectChangeEvent<string>) => {
    setNewRecurrence(event.target.value as RecurrenceType);
  };

  const handleEditRecurrenceChange = (event: SelectChangeEvent<string>) => {
    setEditRecurrence(event.target.value as RecurrenceType);
  };

  const formatDate = (date: string | Date) => {
    return dayjs(date).format("DD.MM.YYYY HH:mm");
  };

  const isActiveNow = (event: EventData) => {
    const now = new Date();
    return new Date(event.startDate) <= now && new Date(event.endDate) >= now;
  };

  const getTimeRemaining = (event: EventData) => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    if (now < start) {
      const diffMs = start.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(
        (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );

      if (diffDays > 0) {
        return `Beginnt in ${diffDays} Tag${
          diffDays !== 1 ? "en" : ""
        } und ${diffHours} Stunde${diffHours !== 1 ? "n" : ""}`;
      } else if (diffHours > 0) {
        return `Beginnt in ${diffHours} Stunde${diffHours !== 1 ? "n" : ""}`;
      } else {
        const diffMinutes = Math.floor(
          (diffMs % (1000 * 60 * 60)) / (1000 * 60)
        );
        return `Beginnt in ${diffMinutes} Minute${
          diffMinutes !== 1 ? "n" : ""
        }`;
      }
    } else if (now <= end) {
      const diffMs = end.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffHours > 0) {
        return `Läuft noch ${diffHours} Stunde${diffHours !== 1 ? "n" : ""}`;
      } else {
        const diffMinutes = Math.floor(
          (diffMs % (1000 * 60 * 60)) / (1000 * 60)
        );
        return `Endet in ${diffMinutes} Minute${diffMinutes !== 1 ? "n" : ""}`;
      }
    }

    return "Beendet";
  };

  const groupEventsByDate = () => {
    const grouped: Record<string, EventData[]> = {};

    events.forEach((event) => {
      const dateKey = dayjs(event.startDate).format("YYYY-MM-DD");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    Object.keys(grouped).forEach((date) => {
      grouped[date].sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
    });

    return grouped;
  };

  // Event-Typ-Erkennung modifizieren: Wiederholungsinstanzen haben eine originalEventId
  const isOccurrenceEvent = (event: EventData): boolean => {
    return event.isOccurrence === true;
  };

  // Funktion, um die ID für ein Event zu bestimmen
  const getEventId = (event: EventData): string | undefined => {
    // Falls das Event eine _id hat, verwenden wir diese
    if (event._id) {
      return event._id;
    }
    // Ansonsten verwenden wir die originalEventId
    return event.originalEventId;
  };

  const groupedEvents = groupEventsByDate();
  const sortedDates = Object.keys(groupedEvents).sort();

  return (
    <>
      <Head>
        <title>Event-Management</title>
      </Head>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
          Event-Management
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, position: "sticky", top: 20 }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 3 }}
              >
                <Add color="primary" />
                <Typography variant="h6">Neues Event erstellen</Typography>
              </Stack>

              <form onSubmit={handleCreateSubmit}>
                <Stack spacing={2}>
                  <TextField
                    label="Event-Titel"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />

                  <TextField
                    label="Beschreibung"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    multiline
                    rows={3}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />

                  <FormControl fullWidth>
                    <Typography variant="caption" color="textSecondary">
                      STARTDATUM
                    </Typography>
                    <CustomDateTimePicker
                      value={newStartDate}
                      onChange={setNewStartDate}
                      minDate={dayjs()}
                    />
                  </FormControl>

                  <FormControl fullWidth>
                    <Typography variant="caption" color="textSecondary">
                      ENDDATUM
                    </Typography>
                    <CustomDateTimePicker
                      value={newEndDate}
                      onChange={setNewEndDate}
                      minDate={newStartDate || dayjs()}
                    />
                  </FormControl>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newRecurring}
                        onChange={(e) => setNewRecurring(e.target.checked)}
                        size="small"
                      />
                    }
                    label={
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Typography variant="body2">
                          Wiederkehrendes Event
                        </Typography>
                        <Tooltip title="Ein wiederkehrendes Event wird nach einem bestimmten Muster wiederholt (täglich, wöchentlich, etc.) und läuft unbegrenzt, bis es manuell gelöscht wird">
                          <IconButton size="small">
                            <Info fontSize="small" color="info" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    }
                  />

                  {newRecurring && (
                    <>
                      <FormControl fullWidth size="small">
                        <InputLabel>Häufigkeit der Wiederholung</InputLabel>
                        <Select
                          value={newRecurrence}
                          label="Häufigkeit der Wiederholung"
                          onChange={handleNewRecurrenceChange}
                        >
                          {recurrenceOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Check />}
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    Event erstellen
                  </Button>
                </Stack>
              </form>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Box
              sx={{
                mb: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="h6"
                sx={{ pl: 1, display: "flex", alignItems: "center" }}
              >
                <CalendarMonth sx={{ mr: 1 }} />
                Events ({events.length})
              </Typography>
            </Box>

            {loading ? (
              <Card sx={{ p: 3, textAlign: "center" }}>
                <Typography>Lade Events...</Typography>
              </Card>
            ) : events.length === 0 ? (
              <Card sx={{ p: 3, textAlign: "center" }}>
                <Typography color="textSecondary">
                  Keine Events gefunden
                </Typography>
              </Card>
            ) : (
              <Stack spacing={3}>
                {sortedDates.map((dateKey) => (
                  <Box key={dateKey}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        px: 2,
                        py: 1,
                        bgcolor: "background.paper",
                        borderRadius: 1,
                        fontWeight: "bold",
                        mb: 1,
                        border: "1px solid",
                        borderColor: "divider",
                        boxShadow: 1,
                      }}
                    >
                      {dayjs(dateKey).format("dddd, DD. MMMM YYYY")}
                    </Typography>

                    <Stack spacing={2}>
                      {groupedEvents[dateKey].map((event) => (
                        <Card
                          key={
                            event._id ||
                            `${event.originalEventId}-${new Date(
                              event.startDate
                            ).getTime()}`
                          }
                          sx={{
                            borderLeft: isActiveNow(event)
                              ? "4px solid #4caf50"
                              : "1px solid #e0e0e0",
                            boxShadow: isActiveNow(event) ? 3 : 1,
                            bgcolor: isActiveNow(event)
                              ? "rgba(76, 175, 80, 0.08)"
                              : "background.paper",
                            position: "relative",
                            transition: "all 0.2s ease-in-out",
                            "&:hover": {
                              boxShadow: 4,
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          {isOccurrenceEvent(event) && (
                            <Tooltip title="Dies ist ein Vorkommen eines wiederkehrenden Events. Änderungen werden am Hauptevent vorgenommen.">
                              <Chip
                                size="small"
                                icon={<Repeat fontSize="small" />}
                                label="Wiederholung"
                                sx={{
                                  position: "absolute",
                                  top: 8,
                                  right: 8,
                                  zIndex: 1,
                                  backgroundColor: "rgba(0, 0, 0, 0.08)",
                                }}
                              />
                            </Tooltip>
                          )}

                          <CardContent>
                            <Stack spacing={1}>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="flex-start"
                              >
                                <Typography variant="h6" component="div">
                                  {event.title}
                                </Typography>
                                <Box>
                                  <Tooltip title="Event bearbeiten">
                                    <IconButton
                                      size="small"
                                      onClick={() => openEditDialog(event)}
                                    >
                                      <Edit fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Event löschen">
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        const id =
                                          event._id || event.originalEventId;
                                        if (id) handleDelete(id);
                                      }}
                                      color="error"
                                    >
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Stack>

                              <Typography
                                color="text.secondary"
                                variant="body2"
                              >
                                {event.description}
                              </Typography>

                              <Divider sx={{ my: 1 }} />

                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <EventIcon fontSize="small" color="action" />
                                <Typography variant="body2">
                                  {dayjs(event.startDate).format("HH:mm")} -{" "}
                                  {dayjs(event.endDate).format("HH:mm")}
                                </Typography>
                              </Stack>

                              {event.recurring && (
                                <Chip
                                  size="small"
                                  icon={<Repeat fontSize="small" />}
                                  label={
                                    recurrenceLabels[
                                      event.recurrence || "daily"
                                    ]
                                  }
                                  variant="outlined"
                                  color="primary"
                                />
                              )}

                              <Box sx={{ mt: 1 }}>
                                <Chip
                                  size="small"
                                  label={getTimeRemaining(event)}
                                  color={
                                    isActiveNow(event) ? "success" : "default"
                                  }
                                  variant={
                                    isActiveNow(event) ? "filled" : "outlined"
                                  }
                                />
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Grid>
        </Grid>

        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Edit fontSize="small" />
              <Typography variant="h6">Event bearbeiten</Typography>
            </Stack>
          </DialogTitle>

          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Event-Titel"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
              />

              <TextField
                label="Beschreibung"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                multiline
                rows={3}
                fullWidth
                variant="outlined"
                size="small"
              />

              <FormControl fullWidth>
                <Typography variant="caption" color="textSecondary">
                  STARTDATUM
                </Typography>
                <CustomDateTimePicker
                  value={editStartDate}
                  onChange={setEditStartDate}
                  minDate={dayjs()}
                />
              </FormControl>

              <FormControl fullWidth>
                <Typography variant="caption" color="textSecondary">
                  ENDDATUM
                </Typography>
                <CustomDateTimePicker
                  value={editEndDate}
                  onChange={setEditEndDate}
                  minDate={editStartDate || dayjs()}
                />
              </FormControl>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={editRecurring}
                    onChange={(e) => setEditRecurring(e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography variant="body2">
                      Wiederkehrendes Event
                    </Typography>
                    <Tooltip title="Ein wiederkehrendes Event wird nach einem bestimmten Muster wiederholt (täglich, wöchentlich, etc.) und läuft unbegrenzt, bis es manuell gelöscht wird">
                      <IconButton size="small">
                        <Info fontSize="small" color="info" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                }
              />

              {editRecurring && (
                <>
                  <FormControl fullWidth size="small">
                    <InputLabel>Häufigkeit der Wiederholung</InputLabel>
                    <Select
                      value={editRecurrence}
                      label="Häufigkeit der Wiederholung"
                      onChange={handleEditRecurrenceChange}
                    >
                      {recurrenceOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              )}
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Abbrechen</Button>
            <Button
              variant="contained"
              onClick={handleEditSubmit}
              startIcon={<Save />}
            >
              Änderungen speichern
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError("")}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setError("")}
            severity="error"
            sx={{ width: "100%" }}
          >
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess("")}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSuccess("")}
            severity="success"
            sx={{ width: "100%" }}
          >
            {success}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default EventsPage;

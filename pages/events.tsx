/* eslint-disable @typescript-eslint/no-unused-vars */
// components/EventCreator.tsx
import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  Snackbar,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { Add, Edit, Check, Save } from "@mui/icons-material";
import CustomDateTimePicker from "@/components/customDateTimePicker/CustomDateTimePicker";
import EventCard from "@/components/eventCard/EventCard";
import { useConfirm } from "material-ui-confirm";
import { IEvent } from "@/models/Event";

const EventCreator: React.FC = () => {
  const theme = useTheme();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<IEvent | null>(null);

  // New Event State
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStartDate, setNewStartDate] = useState<Dayjs | null>(dayjs());
  const [newEndDate, setNewEndDate] = useState<Dayjs | null>(dayjs());
  const [newRecurring, setNewRecurring] = useState(false);
  const [newRecurrence, setNewRecurrence] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("daily");

  // Edit Event State
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStartDate, setEditStartDate] = useState<Dayjs | null>(dayjs());
  const [editEndDate, setEditEndDate] = useState<Dayjs | null>(dayjs());
  const [editRecurring, setEditRecurring] = useState(false);
  const [editRecurrence, setEditRecurrence] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("daily");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const confirm = useConfirm();

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      const { events } = await res.json();
      setEvents(events);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // New Event Handlers
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm(newTitle, newDescription, newStartDate, newEndDate))
      return;

    const eventData = {
      title: newTitle,
      description: newDescription,
      startDate: newStartDate?.toISOString(),
      endDate: newEndDate?.toISOString(),
      recurring: newRecurring,
      recurrence: newRecurring ? newRecurrence : undefined,
    };

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      if (res.ok) {
        setSuccess("Event created successfully");
        resetCreateForm();
        await fetchEvents();
      }
    } catch (err) {
      setError("Error creating event");
    }
  };

  const resetCreateForm = () => {
    setNewTitle("");
    setNewDescription("");
    setNewStartDate(dayjs());
    setNewEndDate(dayjs());
    setNewRecurring(false);
    setNewRecurrence("daily");
  };

  // Edit Event Handlers
  const openEditDialog = (event: IEvent) => {
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
    console.log(currentEvent);
    if (
      !currentEvent?._id ||
      !validateForm(editTitle, editDescription, editStartDate, editEndDate)
    )
      return;

    const eventData = {
      title: editTitle,
      description: editDescription,
      startDate: editStartDate?.toISOString(),
      endDate: editEndDate?.toISOString(),
      recurring: editRecurring,
      recurrence: editRecurring ? editRecurrence : undefined,
    };

    try {
      const res = await fetch(`/api/events/${currentEvent._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      if (res.ok) {
        setSuccess("Erfolgreich das Event geupdated");
        setEditDialogOpen(false);
        await fetchEvents();
      }
    } catch (err) {
      setError("Fehler beim updaten des Events");
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

    if (endDate.isBefore(startDate)) {
      setError("Das Enddatum muss vor dem Startdatum liegen");
      return false;
    }

    if (endDate.isBefore(dayjs())) {
      setError("Das Enddatum muss in der Zukunft liegen");
      return false;
    }

    return true;
  };

  const handleDelete = async (eventId: string) => {
    try {
      await confirm({
        title: "Delete Event?",
        description: "This action cannot be undone",
        confirmationText: "Delete",
        confirmationButtonProps: { color: "error" },
      });

      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      if (res.ok) {
        setSuccess("Event deleted");
        await fetchEvents();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Create Event Section */}
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3, position: "sticky", top: 20 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 3 }}
            >
              <Add color="primary" />
              <Typography variant="h6">Create New Event</Typography>
            </Stack>

            <form onSubmit={handleCreateSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="Event Title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="small"
                />

                <TextField
                  label="Description"
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
                    START DATE
                  </Typography>
                  <CustomDateTimePicker
                    value={newStartDate}
                    onChange={setNewStartDate}
                    minDate={dayjs()}
                  />
                </FormControl>

                <FormControl fullWidth>
                  <Typography variant="caption" color="textSecondary">
                    END DATE
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
                  label="Recurring Event"
                />

                {newRecurring && (
                  <FormControl fullWidth size="small">
                    <InputLabel>Recurrence</InputLabel>
                    <Select
                      value={newRecurrence}
                      label="Recurrence"
                      onChange={(e) =>
                        setNewRecurrence(e.target.value as typeof newRecurrence)
                      }
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="yearly">Yearly</MenuItem>
                    </Select>
                  </FormControl>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Check />}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Create Event
                </Button>
              </Stack>
            </form>
          </Card>
        </Grid>

        {/* Events List */}
        <Grid item xs={12} md={7}>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ pl: 1 }}>
              Upcoming Events ({events.length})
            </Typography>

            {events.length === 0 ? (
              <Card sx={{ p: 3, textAlign: "center" }}>
                <Typography color="textSecondary">
                  No upcoming events
                </Typography>
              </Card>
            ) : (
              events.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onEdit={() => openEditDialog(event)}
                  onDelete={() => event.id && handleDelete(event.id)}
                />
              ))
            )}
          </Stack>
        </Grid>
      </Grid>

      {/* Edit Event Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Edit fontSize="small" />
            <Typography variant="h6">Edit Event</Typography>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={2}
            sx={{
              mt: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TextField
              label="Event Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
            />

            <TextField
              label="Description"
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
                START DATE
              </Typography>
              <CustomDateTimePicker
                value={editStartDate}
                onChange={setEditStartDate}
                minDate={dayjs()}
              />
            </FormControl>

            <FormControl fullWidth>
              <Typography variant="caption" color="textSecondary">
                END DATE
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
              label="Recurring Event"
            />

            {editRecurring && (
              <FormControl fullWidth size="small">
                <InputLabel>Recurrence</InputLabel>
                <Select
                  value={editRecurrence}
                  label="Recurrence"
                  onChange={(e) =>
                    setEditRecurrence(e.target.value as typeof editRecurrence)
                  }
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleEditSubmit}
            startIcon={<Save />}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
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

      {/* Success Snackbar */}
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
  );
};

export default EventCreator;

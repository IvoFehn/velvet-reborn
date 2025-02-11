/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Dialog,
  IconButton,
  FormControl,
  TextField,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Chip,
  useMediaQuery,
  useTheme,
  BottomNavigation,
  BottomNavigationAction,
  Snackbar,
  Alert,
  SnackbarCloseReason,
} from "@mui/material";
import {
  MailOutline,
  ArchiveOutlined,
  SendOutlined,
  Close,
  ChevronRight,
} from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/router";
import { ITicket } from "@/models/Ticket";
import { GeneratorData } from "@/types";
import { sendTelegramMessage } from "@/util/sendTelegramMessage";
import dayjs from "dayjs";

// Beispielsubjekte
const TICKET_SUBJECTS = ["Änderungsantrag", "Ablehnungsantrag", "Sonstiges"];

/** Hauptkomponente */
export default function TicketSystemPage() {
  return (
    <Container maxWidth="xl" sx={{ p: 0, m: 0 }}>
      <UserView />
    </Container>
  );
}

/** USER-VIEW */
function UserView() {
  // Theme & Responsive
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  // Router-Query
  const router = useRouter();
  const { view } = router.query;

  // Tab-Steuerung (0 = Offene Tickets, 1 = Archiv)
  const [tabIndex, setTabIndex] = useState(0);

  // Tickets
  const [openTickets, setOpenTickets] = useState<ITicket[]>([]);
  const [archivedTickets, setArchivedTickets] = useState<ITicket[]>([]);

  // Neues Ticket
  const [subject, setSubject] = useState(TICKET_SUBJECTS[0]);
  const [description, setDescription] = useState("");
  const [availableGenerators, setAvailableGenerators] = useState<
    GeneratorData[]
  >([]);
  const [selectedGeneratorId, setSelectedGeneratorId] = useState<string>("");

  // "Neues Ticket" Modal
  const [showNewTicket, setShowNewTicket] = useState(false);

  // Loading & Fehler
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Snackbar State
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // onClose-Handler für die Snackbar (zwei Parameter: event und reason)
  const handleSnackbarClose = (
    event: React.SyntheticEvent<Element, Event> | Event,
    reason: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // onClose-Handler für das Alert (nur ein Parameter, wie von Alert erwartet)
  const handleAlertClose = (event: React.SyntheticEvent<Element, Event>) => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // ---------------------- FETCH-FUNKTIONEN ----------------------

  /** Offene Tickets laden */
  const fetchOpenTickets = async () => {
    try {
      const res = await fetch("/api/tickets?archived=false");
      const data = await res.json();
      setOpenTickets(data.tickets || []);
    } catch (err) {
      console.error("Fehler beim Laden offener Tickets:", err);
    }
  };

  /** Archivierte Tickets laden */
  const fetchArchivedTickets = async () => {
    try {
      const res = await fetch("/api/tickets?archived=true");
      const data = await res.json();
      setArchivedTickets(data.tickets || []);
    } catch (err) {
      console.error("Fehler beim Laden archivierter Tickets:", err);
    }
  };

  /** Generatoren für Tickets laden (ohne DONE und DECLINED) */
  const fetchGeneratorsForTicket = async () => {
    try {
      const res = await fetch("/api/generator?exclude_status=DONE,DECLINED");
      const data = await res.json();
      if (data.success) {
        setAvailableGenerators(data.data);
      }
    } catch (err) {
      console.error("Fehler beim Laden der Generatoren:", err);
      setError("Fehler beim Laden der Generatoren.");
    }
  };

  /** Neues Ticket anlegen */
  const handleSubmit = async () => {
    if (!subject || !description) return;

    // Validierung: Bei Änderungs- und Ablehnungsanträgen muss ein Generator ausgewählt werden.
    if (
      ["Änderungsantrag", "Ablehnungsantrag"].includes(subject) &&
      !selectedGeneratorId
    ) {
      setSnackbar({
        open: true,
        message: "Bitte wählen Sie einen Generator aus.",
        severity: "error",
      });
      return;
    }

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          description,
          generatorId: selectedGeneratorId || null,
        }),
      });

      if (res.ok) {
        setSnackbar({
          open: true,
          message: "Ticket erfolgreich erstellt!",
          severity: "success",
        });
        setShowNewTicket(false);
        await fetchOpenTickets(); // Tickets neu laden

        // Falls ein Generator ausgewählt wurde, aktualisiere dessen Status auf "PENDING"
        if (selectedGeneratorId) {
          try {
            const putRes = await fetch("/api/generator", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: selectedGeneratorId,
                newStatus: "PENDING",
              }),
            });
            if (!putRes.ok) {
              console.error(
                "Fehler beim Aktualisieren des Generators auf PENDING",
                await putRes.json()
              );
            }
          } catch (error) {
            console.error("Fehler beim Aktualisieren des Generators:", error);
          }
        }

        // Reset
        setSubject(TICKET_SUBJECTS[0]);
        setDescription("");
        setSelectedGeneratorId("");

        // Telegram-Benachrichtigung über die vorhandene Funktion ausführen
        const telegramResponse = await sendTelegramMessage(
          "admin",
          `Ein neuer Antrag wurde eingereicht am ${dayjs()
            .locale("de")
            .format("DD.MM.YYYY HH:mm:ss")}`
        );
        if (!telegramResponse.success) {
          console.error("Telegram message error:", telegramResponse.error);
        }
      } else {
        setSnackbar({
          open: true,
          message: "Fehler beim Erstellen des Tickets.",
          severity: "error",
        });
      }
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Fehler beim Erstellen des Tickets.",
        severity: "error",
      });
    }
  };

  // ---------------------- HANDLER ----------------------

  /** Manueller Tab-Wechsel (0 = Offen, 1 = Archiv) */
  const handleTabChange = async (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setTabIndex(newValue);

    // Tickets laden
    if (newValue === 1) {
      // Archivierte Tickets laden
      if (archivedTickets.length === 0) {
        await fetchArchivedTickets();
      }
    }
  };

  // ---------------------- USEEFFECTS ----------------------

  /** Direkt beim Laden: offene Tickets */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await fetchOpenTickets();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /** Auswertung des URL-Parameters "view" */
  useEffect(() => {
    if (!view) return;
    const viewParam = (view as string).toUpperCase();

    if (viewParam === "ARCHIVED") {
      // Archiv-Tab
      setTabIndex(1);
      fetchArchivedTickets();
    } else if (viewParam === "CREATE") {
      // Neues Ticket-Modal
      setShowNewTicket(true);
      setTabIndex(0);
    } else if (viewParam === "TICKET") {
      // Tab 0 = Offen
      setTabIndex(0);
      fetchOpenTickets();
    }
  }, [view]);

  /** Generatoren laden, wenn der Betreff Änderungsantrag, Ablehnungsantrag oder Sonstiges ist */
  useEffect(() => {
    if (
      ["Änderungsantrag", "Ablehnungsantrag", "Sonstiges"].includes(subject)
    ) {
      fetchGeneratorsForTicket();
    } else {
      setAvailableGenerators([]);
      setSelectedGeneratorId("");
    }
  }, [subject]);

  // ---------------------- RENDERING ----------------------
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Hauptbereich mit Sidebar (nur Desktop) + Inhalt */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: isDesktop ? "row" : "column",
          position: "relative",
        }}
      >
        {/* Sidebar nur für Desktop/Tablet */}
        {isDesktop && (
          <Paper
            sx={{
              width: 280,
              flexShrink: 0,
              borderRight: 1,
              borderColor: "divider",
              p: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Navigation
            </Typography>
            <Tabs
              orientation="vertical"
              value={tabIndex}
              onChange={handleTabChange}
              sx={{ mt: 2 }}
            >
              <Tab
                label={
                  <Badge badgeContent={openTickets.length} color="primary">
                    Offen
                  </Badge>
                }
              />
              <Tab label="Archiv" />
            </Tabs>

            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                startIcon={<SendOutlined />}
                onClick={() => setShowNewTicket(true)}
                fullWidth
              >
                Neues Ticket
              </Button>
            </Box>
          </Paper>
        )}

        {/* Inhaltsbereich / Tickets */}
        <Box sx={{ flex: 1, p: 2 }}>
          {loading && <Typography variant="body1">Lade Daten...</Typography>}

          {!loading && tabIndex === 0 && (
            <TicketList tickets={openTickets} title="Offene Tickets" />
          )}

          {!loading && tabIndex === 1 && (
            <TicketList tickets={archivedTickets} title="Archivierte Tickets" />
          )}

          {error && (
            <Typography variant="body1" color="error">
              {error}
            </Typography>
          )}
        </Box>
      </Box>

      {/* BOTTOM NAV nur auf Mobile */}
      {!isDesktop && (
        <BottomNavigation
          value={tabIndex}
          onChange={(event, newValue) => handleTabChange(event, newValue)}
          showLabels
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            boxShadow: 3,
          }}
        >
          <BottomNavigationAction
            label="Offen"
            icon={
              <Badge badgeContent={openTickets.length} color="primary">
                <MailOutline />
              </Badge>
            }
          />
          <BottomNavigationAction label="Archiv" icon={<ArchiveOutlined />} />
          <BottomNavigationAction
            label="Neu"
            icon={<SendOutlined />}
            onClick={() => setShowNewTicket(true)}
          />
        </BottomNavigation>
      )}

      {/* Dialog / Modal für neues Ticket */}
      <Dialog
        open={showNewTicket}
        onClose={() => setShowNewTicket(false)}
        fullScreen={!isDesktop}
        PaperProps={{
          sx: isDesktop
            ? {
                width: 400,
                position: "fixed",
                bottom: 24,
                right: 24,
                m: 0,
              }
            : {},
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Neues Ticket</Typography>
            <IconButton onClick={() => setShowNewTicket(false)}>
              <Close />
            </IconButton>
          </Box>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Betreff
            </Typography>
            <SelectSubject
              value={subject}
              onChange={(val: string) => setSubject(val)}
            />
          </FormControl>

          {/* Generator-Auswahl: Wird angezeigt, wenn der Betreff Änderungsantrag, Ablehnungsantrag oder Sonstiges ist */}
          {["Änderungsantrag", "Ablehnungsantrag", "Sonstiges"].includes(
            subject
          ) && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Bezogener Generator (optional bei Sonstiges)
              </Typography>
              <TextField
                select
                value={selectedGeneratorId}
                onChange={(e) => setSelectedGeneratorId(e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="">Bitte wählen...</option>
                {availableGenerators.map((generator) => (
                  <option key={generator._id} value={generator._id}>
                    {generator.createdAt
                      ? new Date(generator.createdAt).toLocaleDateString()
                      : "Kein Datum"}{" "}
                    - {generator._id}
                  </option>
                ))}
              </TextField>
            </FormControl>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Beschreibung
            </Typography>
            <TextField
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormControl>

          <Button variant="contained" fullWidth onClick={handleSubmit}>
            Absenden
          </Button>
        </Box>
      </Dialog>

      {/* Snackbar: unten zentriert */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleAlertClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

/** Auswahl Betreff für das Ticket */
function SelectSubject({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <TextField
      select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      SelectProps={{ native: true }}
    >
      {TICKET_SUBJECTS.map((sub) => (
        <option key={sub} value={sub}>
          {sub}
        </option>
      ))}
    </TextField>
  );
}

/** TICKET-LISTE mit Responsive Design */
function TicketList({ tickets, title }: { tickets: ITicket[]; title: string }) {
  if (!tickets || tickets.length === 0) {
    return (
      <Typography variant="body1" sx={{ mt: 2 }}>
        Keine Tickets in &quot;{title}&quot; vorhanden.
      </Typography>
    );
  }

  return (
    <List sx={{ width: "100%", mt: 2 }}>
      {tickets.map((ticket) => (
        <React.Fragment key={ticket._id}>
          <ListItem
            component={Link}
            href={`/tickets/${ticket._id}`}
            sx={{
              "&:hover": { bgcolor: "action.hover" },
              borderRadius: 1,
              mb: 1,
              p: 1.5,
              alignItems: "flex-start",
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: "primary.main" }}>
                {ticket.subject ? ticket.subject[0] : "?"}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: 1,
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    {ticket.subject}
                  </Typography>
                  <Chip
                    label={ticket.archived ? "Archiviert" : "Offen"}
                    size="small"
                    color={ticket.archived ? "default" : "success"}
                  />
                </Box>
              }
              secondary={
                <>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {ticket.description}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 0.5 }}
                  >
                    {ticket.createdAt
                      ? new Date(ticket.createdAt).toLocaleDateString()
                      : "Unbekanntes Datum"}
                  </Typography>
                </>
              }
            />
            <IconButton edge="end">
              <ChevronRight />
            </IconButton>
          </ListItem>
          <Divider variant="inset" component="li" />
        </React.Fragment>
      ))}
    </List>
  );
}

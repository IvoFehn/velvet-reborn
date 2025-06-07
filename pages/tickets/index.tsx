/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
import { ISanction } from "@/types/index";

// Aktualisierte Beispielsubjekte
const TICKET_SUBJECTS = [
  "Änderungsantrag",
  "Ablehnungsantrag",
  "Sonstiges",
  "Sanktionen",
  "Beschwerden",
];

/** Hauptkomponente */
export default function TicketSystemPage() {
  return (
    <Container maxWidth="xl" disableGutters>
      <UserView />
    </Container>
  );
}

/** USER-VIEW */
function UserView() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  // Router-Query
  const router = useRouter();
  const { view, subject: urlSubject, sanctionsFrontendId } = router.query; // Änderung von sanctionId zu sanctionsFrontendId

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

  // Sanktionen-spezifisch
  const [availableSanctions, setAvailableSanctions] = useState<ISanction[]>([]);
  const [selectedSanctionsFrontendId, setSelectedSanctionsFrontendId] =
    useState<string>(""); // Änderung von selectedSanctionId zu selectedSanctionsFrontendId
  const [sanctionDescription, setSanctionDescription] = useState<string>("");

  // "Neues Ticket" Dialog
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

  // ---------------------- HANDLER ----------------------

  const handleTabChange = async (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setTabIndex(newValue);
    if (newValue === 1 && archivedTickets.length === 0) {
      await fetchArchivedTickets();
    }
  };

  const handleSnackbarClose = (
    event: React.SyntheticEvent<Element, Event> | Event,
    reason: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleAlertClose = (event: React.SyntheticEvent<Element, Event>) => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSubjectChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSubject = event.target.value;
    setSubject(newSubject);

    // Zurücksetzen der IDs bei Änderung des Betreffs
    setSelectedGeneratorId("");
    setSelectedSanctionsFrontendId(""); // Änderung von setSelectedSanctionId zu setSelectedSanctionsFrontendId

    // Standardtextvorschläge für verschiedene Antragstypen
    if (newSubject === "Sanktionen") {
      setSanctionDescription(
        "Ich beantrage eine Überprüfung der folgenden Sanktion: "
      );
    } else if (newSubject === "Beschwerden") {
      setSanctionDescription("Ich möchte folgende Beschwerde einreichen: ");
    } else {
      setSanctionDescription("");
    }
  };

  // ---------------------- FETCH-FUNKTIONEN ----------------------

  const fetchOpenTickets = async () => {
    try {
      const res = await fetch("/api/content?type=tickets&archived=false");
      const data = await res.json();
      setOpenTickets(data.tickets || []);
    } catch (err) {
      console.error("Fehler beim Laden offener Tickets:", err);
    }
  };

  const fetchArchivedTickets = async () => {
    try {
      const res = await fetch("/api/content?type=tickets&archived=true");
      const data = await res.json();
      setArchivedTickets(data.tickets || []);
    } catch (err) {
      console.error("Fehler beim Laden archivierter Tickets:", err);
    }
  };

  const fetchGeneratorsForTicket = async () => {
    try {
      const res = await fetch("/api/gaming?action=generator&exclude_status=DONE,DECLINED");
      const data = await res.json();
      if (data.success) {
        setAvailableGenerators(data.data);
      }
    } catch (err) {
      console.error("Fehler beim Laden der Generatoren:", err);
      setError("Fehler beim Laden der Generatoren.");
    }
  };

  const fetchSanctionsForTicket = async () => {
    try {
      const res = await fetch("/api/content?type=sanctions&status=offen,eskaliert");
      const data = await res.json();
      if (data.success) {
        setAvailableSanctions(data.data || []);
      }
    } catch (err) {
      console.error("Fehler beim Laden der Sanktionen:", err);
      setError("Fehler beim Laden der Sanktionen.");
    }
  };

  const handleSubmit = async () => {
    if (!subject || !description) return;

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

    if (subject === "Sanktionen" && !selectedSanctionsFrontendId) {
      // Änderung von selectedSanctionId zu selectedSanctionsFrontendId
      setSnackbar({
        open: true,
        message: "Bitte wählen Sie eine Sanktion aus.",
        severity: "error",
      });
      return;
    }

    try {
      const res = await fetch("/api/content?type=tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          description,
          generatorId: selectedGeneratorId || null,
          sanctionsFrontendId: selectedSanctionsFrontendId || null, // Änderung von sanctionId zu sanctionsFrontendId
        }),
      });

      if (res.ok) {
        setSnackbar({
          open: true,
          message: "Ticket erfolgreich erstellt!",
          severity: "success",
        });
        setShowNewTicket(false);
        await fetchOpenTickets();

        if (selectedGeneratorId) {
          try {
            const putRes = await fetch("/api/gaming?action=generator", {
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
        setSelectedSanctionsFrontendId(""); // Änderung von setSelectedSanctionId zu setSelectedSanctionsFrontendId

        // Telegram-Benachrichtigung
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

  // Lädt Sanktionsdetails wenn eine ausgewählt wurde
  const handleSanctionSelect = async (id: string) => {
    setSelectedSanctionsFrontendId(id); // Änderung von setSelectedSanctionId zu setSelectedSanctionsFrontendId

    if (!id) return;

    try {
      const res = await fetch(`/api/content?type=sanctions&id=${id}`);
      const data = await res.json();

      if (data.success && data.data) {
        const sanction = data.data;

        let detailText = "";
        if (subject === "Sanktionen") {
          detailText = `Ich beantrage die Überprüfung der folgenden Sanktion:
          
Titel: ${sanction.title}
Aufgabe: ${sanction.task}
Kategorie: ${sanction.category}
Menge: ${sanction.amount} ${sanction.unit}
Status: ${sanction.status}

Ich möchte diese Sanktion als erledigt markieren.
`;
        } else if (subject === "Beschwerden") {
          detailText = `Ich möchte folgende Beschwerde zur Sanktion einreichen:
          
Betroffene Sanktion: ${sanction.title}
Aufgabe: ${sanction.task}
Menge: ${sanction.amount} ${sanction.unit}

Meine Beschwerde:
`;
        }

        setDescription(detailText);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Sanktionsdetails:", error);
    }
  };

  // ---------------------- USEEFFECTS ----------------------

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

  useEffect(() => {
    if (!view) return;
    const viewParam = (view as string).toUpperCase();

    if (viewParam === "ARCHIVED") {
      setTabIndex(1);
      fetchArchivedTickets();
    } else if (viewParam === "CREATE") {
      setShowNewTicket(true);
      setTabIndex(0);

      if (urlSubject) {
        setSubject(urlSubject as string);
      }

      if (sanctionsFrontendId) {
        // Änderung von sanctionId zu sanctionsFrontendId
        setSelectedSanctionsFrontendId(sanctionsFrontendId as string); // Änderung von setSelectedSanctionId zu setSelectedSanctionsFrontendId
        handleSanctionSelect(sanctionsFrontendId as string); // Änderung von sanctionId zu sanctionsFrontendId
      }
    } else if (viewParam === "TICKET") {
      setTabIndex(0);
      fetchOpenTickets();
    }
  }, [view, urlSubject, sanctionsFrontendId]); // Änderung von sanctionId zu sanctionsFrontendId

  useEffect(() => {
    if (
      ["Änderungsantrag", "Ablehnungsantrag", "Sonstiges"].includes(subject)
    ) {
      fetchGeneratorsForTicket();
    } else if (["Sanktionen", "Beschwerden"].includes(subject)) {
      fetchSanctionsForTicket();
    } else {
      setAvailableGenerators([]);
      setSelectedGeneratorId("");
      setAvailableSanctions([]);
      setSelectedSanctionsFrontendId(""); // Änderung von setSelectedSanctionId zu setSelectedSanctionsFrontendId
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
      }}
    >
      {/* Mobile Header */}
      {!isDesktop && (
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Neuer Antrag
            </Typography>
            <IconButton color="inherit" onClick={() => setShowNewTicket(true)}>
              <SendOutlined />
            </IconButton>
          </Toolbar>
        </AppBar>
      )}

      {/* Hauptbereich: Sidebar (Desktop) + Inhalt */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: isDesktop ? "row" : "column",
          pt: !isDesktop ? 2 : 0,
        }}
      >
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

        {/* Inhaltsbereich */}
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

      {/* Bottom Navigation nur auf mobilen Geräten */}
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
        </BottomNavigation>
      )}

      {/* Dialog für Neues Ticket */}
      <Dialog
        open={showNewTicket}
        onClose={() => setShowNewTicket(false)}
        fullScreen={!isDesktop}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Neues Ticket
          <IconButton
            onClick={() => setShowNewTicket(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Betreff
            </Typography>
            <SelectSubject value={subject} onChange={handleSubjectChange} />
          </FormControl>

          {/* Generator-Auswahl für bestimmte Antragsarten */}
          {["Änderungsantrag", "Ablehnungsantrag", "Sonstiges"].includes(
            subject
          ) && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Bezogener Generator {subject === "Sonstiges" && "(optional)"}
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

          {/* Sanktions-Auswahl für sanktionsbezogene Anträge */}
          {["Sanktionen", "Beschwerden"].includes(subject) && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Betroffene Sanktion
              </Typography>
              <TextField
                select
                value={selectedSanctionsFrontendId} // Änderung von selectedSanctionId zu selectedSanctionsFrontendId
                onChange={(e) => handleSanctionSelect(e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="">Bitte wählen...</option>
                {availableSanctions.map((sanction) => (
                  <option
                    key={sanction._id.toString()}
                    value={sanction._id.toString()}
                  >
                    {sanction.title} - {sanction.status} ({sanction.amount}{" "}
                    {sanction.unit})
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
        </DialogContent>
        <DialogActions>
          <Button variant="contained" fullWidth onClick={handleSubmit}>
            Absenden
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

/** Auswahl des Ticket-Betreffs */
function SelectSubject({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <TextField
      select
      value={value}
      onChange={onChange}
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

/** Ticket-Liste */
function TicketList({ tickets, title }: { tickets: ITicket[]; title: string }) {
  if (!tickets || tickets.length === 0) {
    return (
      <Typography variant="body1" sx={{ mt: 2 }}>
        Keine Tickets in &ldquo;{title}&ldquo; vorhanden.
      </Typography>
    );
  }

  return (
    <List sx={{ width: "100%", mt: 2 }}>
      {tickets.map((ticket) => (
        <React.Fragment key={String(ticket._id)}>
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

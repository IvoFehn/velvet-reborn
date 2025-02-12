import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";
import {
  Container,
  Box,
  Typography,
  Chip,
  Rating,
  CircularProgress,
  Grid,
  Divider,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Notes,
  Favorite,
  Star,
  Info,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { keyframes } from "@emotion/react";
import { motion } from "framer-motion";
import { sendTelegramMessage } from "@/util/sendTelegramMessage";

// Keyframe-Animation: sanftes Hereinzoomen von unten
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Neue Animationen für den failed state
const shake = {
  x: [0, -15, 15, -15, 15, 0],
  transition: { duration: 0.8, type: "spring" },
};

const pulse = {
  scale: [1, 1.05, 1],
  transition: { duration: 1.5, repeat: Infinity },
};

// Keyframes für den pulsierenden Hintergrund des Pseudo-Elements
const pulseKeyframes = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Vollständige Typdefinition für News
interface NewsDetail {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
  type: "general" | "review" | "failed";
  overallRating: number;
  seen: boolean;
  obedience?: number;
  didSquirt?: boolean;
  vibeDuringSex?: number;
  vibeAfterSex?: number;
  orgasmIntensity?: number;
  painlessness?: number;
  wasAnal?: boolean;
  ballsWorshipping?: number;
  cumWorshipping?: number;
  didEverythingForHisPleasure?: number;
  bestMoment?: string;
  improvementSuggestion?: string;
  additionalNotes?: string;
}

// Erstelle ein motion-fähiges Paper-Element
const MotionPaper = motion(Paper);

const NewsDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [news, setNews] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State für Modal und Snackbar
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  // useWindowSize aus react-use: liefert aktuelle Fenstermaße
  const { width, height } = useWindowSize();

  // Mapping: Erklärungen für Bewertungen
  const ratingExplanations: Record<string, string> = {
    obedience:
      "Diese Bewertung misst, wie gehorsam der Partner war. Eine hohe Bewertung zeigt, dass er aufmerksam und folgsam war.",
    vibeDuringSex:
      "Diese Bewertung misst, wie angenehm die Stimmung während des Sex war.",
    vibeAfterSex:
      "Diese Bewertung misst, wie angenehm die Stimmung nach dem Sex war.",
    orgasmIntensity: "Diese Bewertung misst die Intensität seines Orgasmus.",
    painlessness:
      "Diese Bewertung gibt an, wie problemlos der gesamte Auftrag verlaufen ist.",
    ballsWorshipping:
      "Eier sind das wichtigste für dich. Diese Bewertung zeigt, wie sehr du ihnen Aufmerksamkeit geschenkt hast.",
    cumWorshipping:
      "Sperma ist für dich weißes Gold. Die Bewertung misst, wie sehr du gezeigt hast, dass du Sperma liebst.",
    didEverythingForHisPleasure:
      "Diese Bewertung misst, inwiefern der Partner alles für sein Vergnügen getan hat.",
    didSquirt: "Diese Bewertung zeigt an, ob Squirting stattgefunden hat.",
    wasAnal: "Diese Bewertung zeigt an, ob der Sex anal beinhaltete.",
  };

  // Mapping: Titel für die Modale
  const ratingTitles: Record<string, string> = {
    obedience: "Gehorsam",
    vibeDuringSex: "Stimmung (während)",
    vibeAfterSex: "Stimmung (nach)",
    orgasmIntensity: "Orgasmusintensität",
    painlessness: "Schmerzfreiheit",
    ballsWorshipping: "Eier-Verehrung",
    cumWorshipping: "Sperma-Verehrung",
    didEverythingForHisPleasure: "Alles für sein Vergnügen",
    didSquirt: "Gesquirted",
    wasAnal: "Anal",
  };

  const handleOpenModal = (rating: string) => {
    setOpenModal(rating);
  };

  const handleCloseModal = () => {
    setOpenModal(null);
  };

  // Funktion, um News als gesehen zu markieren (PATCH-Request)
  const handleMarkAsSeen = async () => {
    if (!news) return;
    try {
      const response = await fetch(`/api/news?id=${news._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ seen: true }),
      });
      const result = await response.json();
      if (result.success) {
        setNews({ ...news, seen: true });
        setSnackbarMessage("News als gesehen markiert.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        sendTelegramMessage(
          "admin",
          `Der Nutzer hat eine News als gesehen markiert. ${window.location.href}`
        );
      } else {
        setSnackbarMessage(
          result.message || "Fehler beim Aktualisieren des Gesehen-Status."
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error("Mark as seen error:", err);
      setSnackbarMessage("Fehler beim Aktualisieren des Gesehen-Status.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;
    if (!id) return;

    const fetchNews = async () => {
      try {
        const response = await fetch(`/api/news?id=${id}`);
        const result = await response.json();
        if (!result.success) {
          setError(result.message || "Fehler beim Laden der News");
        } else {
          setNews(result.data);
        }
      } catch (err) {
        console.error("Fetch-Error:", err);
        setError("Fehler beim Abrufen der News");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [router.isReady, id]);

  // Hilfsfunktion, um das Overall Rating bei Reviews oder Failed zu berechnen
  const computeOverallRating = (news: NewsDetail): number => {
    const ratings: number[] = [];
    if (typeof news.obedience === "number") ratings.push(news.obedience);
    if (typeof news.vibeDuringSex === "number")
      ratings.push(news.vibeDuringSex);
    if (typeof news.vibeAfterSex === "number") ratings.push(news.vibeAfterSex);
    if (typeof news.orgasmIntensity === "number")
      ratings.push(news.orgasmIntensity);
    if (typeof news.painlessness === "number") ratings.push(news.painlessness);
    if (typeof news.ballsWorshipping === "number")
      ratings.push(news.ballsWorshipping);
    if (typeof news.cumWorshipping === "number")
      ratings.push(news.cumWorshipping);
    if (typeof news.didEverythingForHisPleasure === "number")
      ratings.push(news.didEverythingForHisPleasure);
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  };

  // Falls Overall Rating angezeigt werden soll (bei Reviews oder Failed)
  const displayedOverallRating =
    news?.type === "review" || news?.type === "failed"
      ? computeOverallRating(news)
      : news?.overallRating || 0;

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Lade News…
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push("/")}
          sx={{
            mt: 2,
            transition: "transform 0.3s ease",
            "&:hover": { transform: "scale(1.05)" },
          }}
        >
          Zurück zur Übersicht
        </Button>
      </Container>
    );
  }

  if (!news) return null;

  return (
    <>
      {/* Confetti-Effekt anzeigen, wenn das Overall Rating über 4 liegt */}
      {displayedOverallRating > 4 && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: width,
            height: height,
            pointerEvents: "none",
            zIndex: 9999,
          }}
        >
          <Confetti width={width} height={height} numberOfPieces={50} />
        </div>
      )}

      <Container maxWidth="md" sx={{ my: 4, px: { xs: 2, sm: 3 } }}>
        <MotionPaper
          elevation={4}
          initial={{ opacity: 0, y: 50 }}
          animate={{
            opacity: 1,
            y: 0,
            ...(news.type === "failed" ? shake : {}),
          }}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 3,
            animation: `${fadeInUp} 0.6s ease-out`,
            backgroundColor: "background.paper",
            border: news.type === "failed" ? "3px solid" : "none",
            borderColor: news.type === "failed" ? "error.main" : undefined,
            boxShadow: news.type === "failed" ? 6 : 4,
            position: "relative",
            overflow: "hidden",
            "&::after":
              news.type === "failed"
                ? {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(244,67,54,0.1)",
                    animation: `${pulseKeyframes} 2s infinite`,
                  }
                : {},
          }}
        >
          {/* Kopfbereich */}
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            mb={4}
          >
            <motion.div animate={news.type === "failed" ? pulse : {}}>
              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                sx={{
                  mb: { xs: 2, sm: 0 },
                  fontWeight: "bold",
                  color: news.type === "failed" ? "error.main" : "inherit",
                  textShadow:
                    news.type === "failed"
                      ? "0 0 10px rgba(244,67,54,0.5)"
                      : "none",
                }}
              >
                {news.title}
                {news.type === "failed" && (
                  <Cancel
                    sx={{ ml: 2, fontSize: "inherit", color: "error.main" }}
                  />
                )}
              </Typography>
            </motion.div>
          </Box>

          {/* Meta-Informationen */}
          <Box
            mt={2}
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            alignItems="center"
            gap={2}
            mb={4}
          >
            <Chip
              label={dayjs(news.createdAt)
                .locale("de")
                .format("DD. MMMM YYYY - HH:mm")}
              variant="outlined"
              size="small"
              sx={{ backgroundColor: "background.default" }}
            />
            <Chip
              label={news.seen ? "Gesehen" : "Nicht gesehen"}
              color={news.seen ? "success" : "default"}
              size="small"
            />
            <Box display="flex" alignItems="center">
              <Rating
                value={displayedOverallRating}
                readOnly
                precision={0.5}
                icon={<Star fontSize="inherit" color="primary" />}
                emptyIcon={<Star fontSize="inherit" />}
              />
              <Typography variant="body2" ml={1} color="text.secondary">
                ({displayedOverallRating.toFixed(1)}/5)
              </Typography>
            </Box>
          </Box>

          {/* Fehlermeldung für failed state */}
          {news.type === "failed" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Alert severity="error" sx={{ my: 3, fontWeight: "bold" }}>
                <Typography variant="h6">
                  Auftrag nicht bestanden! Bitte dringend Verbesserungen
                  vornehmen!
                </Typography>
              </Alert>
            </motion.div>
          )}

          <Divider sx={{ my: 4 }} />

          {/* Hauptinhalt */}
          <Grid container spacing={4}>
            {news.message && (
              <Grid item xs={12}>
                <Typography
                  variant="h5"
                  gutterBottom
                  display="flex"
                  alignItems="center"
                  sx={{ fontWeight: "bold" }}
                >
                  <Notes color="primary" sx={{ mr: 1 }} />
                  Hauptnachricht
                </Typography>
                <Typography
                  variant="body1"
                  whiteSpace="pre-wrap"
                  sx={{ lineHeight: 1.6 }}
                >
                  {news.message}
                </Typography>
              </Grid>
            )}

            {/* Leistungs- und Detailbewertungen werden nur bei "review" angezeigt */}
            {news.type === "review" && (
              <>
                {/* Leistungsbewertungen (boolesche Werte) */}
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    display="flex"
                    alignItems="center"
                    sx={{ fontWeight: "bold" }}
                  >
                    <Favorite color="primary" sx={{ mr: 1 }} />
                    Leistungsbewertungen
                  </Typography>
                  <Grid container spacing={2}>
                    {typeof news.didSquirt !== "undefined" && (
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1}>
                          {news.didSquirt ? (
                            <CheckCircle color="success" />
                          ) : (
                            <Cancel color="error" />
                          )}
                          <Typography>Squirting</Typography>
                          <IconButton
                            onClick={() => handleOpenModal("didSquirt")}
                          >
                            <Info fontSize="small" color="action" />
                          </IconButton>
                        </Box>
                      </Grid>
                    )}
                    {typeof news.wasAnal !== "undefined" && (
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1}>
                          {news.wasAnal ? (
                            <CheckCircle color="success" />
                          ) : (
                            <Cancel color="error" />
                          )}
                          <Typography>Anal</Typography>
                          <IconButton
                            onClick={() => handleOpenModal("wasAnal")}
                          >
                            <Info fontSize="small" color="action" />
                          </IconButton>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Grid>

                {/* Detailbewertungen (numerische Bewertungen) */}
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    display="flex"
                    alignItems="center"
                    sx={{ fontWeight: "bold" }}
                  >
                    <Star color="primary" sx={{ mr: 1 }} />
                    Detailbewertungen
                  </Typography>
                  <Grid container spacing={2}>
                    {typeof news.obedience !== "undefined" && (
                      <Grid item xs={12} sm={6}>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          flexWrap="wrap"
                        >
                          <Typography
                            sx={{
                              color:
                                news.obedience < 3 ? "error.main" : "inherit",
                            }}
                          >
                            Gehorsam:
                          </Typography>
                          <Rating
                            value={news.obedience}
                            readOnly
                            size="small"
                            precision={0.5}
                          />
                          <IconButton
                            onClick={() => handleOpenModal("obedience")}
                          >
                            <Info fontSize="small" color="action" />
                          </IconButton>
                        </Box>
                      </Grid>
                    )}
                    {typeof news.vibeDuringSex !== "undefined" && (
                      <Grid item xs={12} sm={6}>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          flexWrap="wrap"
                        >
                          <Typography
                            sx={{
                              color:
                                news.vibeDuringSex < 3
                                  ? "error.main"
                                  : "inherit",
                            }}
                          >
                            Stimmung (während):
                          </Typography>
                          <Rating
                            value={news.vibeDuringSex}
                            readOnly
                            size="small"
                            precision={0.5}
                          />
                          <IconButton
                            onClick={() => handleOpenModal("vibeDuringSex")}
                          >
                            <Info fontSize="small" color="action" />
                          </IconButton>
                        </Box>
                      </Grid>
                    )}
                    {typeof news.vibeAfterSex !== "undefined" && (
                      <Grid item xs={12} sm={6}>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          flexWrap="wrap"
                        >
                          <Typography
                            sx={{
                              color:
                                news.vibeAfterSex < 3
                                  ? "error.main"
                                  : "inherit",
                            }}
                          >
                            Stimmung (nach):
                          </Typography>
                          <Rating
                            value={news.vibeAfterSex}
                            readOnly
                            size="small"
                            precision={0.5}
                          />
                          <IconButton
                            onClick={() => handleOpenModal("vibeAfterSex")}
                          >
                            <Info fontSize="small" color="action" />
                          </IconButton>
                        </Box>
                      </Grid>
                    )}
                    {typeof news.orgasmIntensity !== "undefined" && (
                      <Grid item xs={12} sm={6}>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          flexWrap="wrap"
                        >
                          <Typography
                            sx={{
                              color:
                                news.orgasmIntensity < 3
                                  ? "error.main"
                                  : "inherit",
                            }}
                          >
                            Orgasmusintensität:
                          </Typography>
                          <Rating
                            value={news.orgasmIntensity}
                            readOnly
                            size="small"
                            precision={0.5}
                          />
                          <IconButton
                            onClick={() => handleOpenModal("orgasmIntensity")}
                          >
                            <Info fontSize="small" color="action" />
                          </IconButton>
                        </Box>
                      </Grid>
                    )}
                    {typeof news.painlessness !== "undefined" && (
                      <Grid item xs={12} sm={6}>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          flexWrap="wrap"
                        >
                          <Typography
                            sx={{
                              color:
                                news.painlessness < 3
                                  ? "error.main"
                                  : "inherit",
                            }}
                          >
                            Schmerzfreiheit:
                          </Typography>
                          <Rating
                            value={news.painlessness}
                            readOnly
                            size="small"
                            precision={0.5}
                          />
                          <IconButton
                            onClick={() => handleOpenModal("painlessness")}
                          >
                            <Info fontSize="small" color="action" />
                          </IconButton>
                        </Box>
                      </Grid>
                    )}
                    {typeof news.ballsWorshipping !== "undefined" && (
                      <Grid item xs={12} sm={6}>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          flexWrap="wrap"
                        >
                          <Typography
                            sx={{
                              color:
                                news.ballsWorshipping < 3
                                  ? "error.main"
                                  : "inherit",
                            }}
                          >
                            Eier-Verehrung:
                          </Typography>
                          <Rating
                            value={news.ballsWorshipping}
                            readOnly
                            size="small"
                            precision={0.5}
                          />
                          <IconButton
                            onClick={() => handleOpenModal("ballsWorshipping")}
                          >
                            <Info fontSize="small" color="action" />
                          </IconButton>
                        </Box>
                      </Grid>
                    )}
                    {typeof news.cumWorshipping !== "undefined" && (
                      <Grid item xs={12} sm={6}>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          flexWrap="wrap"
                        >
                          <Typography
                            sx={{
                              color:
                                news.cumWorshipping < 3
                                  ? "error.main"
                                  : "inherit",
                            }}
                          >
                            Sperma-Verehrung:
                          </Typography>
                          <Rating
                            value={news.cumWorshipping}
                            readOnly
                            size="small"
                            precision={0.5}
                          />
                          <IconButton
                            onClick={() => handleOpenModal("cumWorshipping")}
                          >
                            <Info fontSize="small" color="action" />
                          </IconButton>
                        </Box>
                      </Grid>
                    )}
                    {typeof news.didEverythingForHisPleasure !==
                      "undefined" && (
                      <Grid item xs={12} sm={6}>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          flexWrap="wrap"
                        >
                          <Typography
                            sx={{
                              color:
                                news.didEverythingForHisPleasure < 3
                                  ? "error.main"
                                  : "inherit",
                            }}
                          >
                            Alles für sein Vergnügen:
                          </Typography>
                          <Rating
                            value={news.didEverythingForHisPleasure}
                            readOnly
                            size="small"
                            precision={0.5}
                          />
                          <IconButton
                            onClick={() =>
                              handleOpenModal("didEverythingForHisPleasure")
                            }
                          >
                            <Info fontSize="small" color="action" />
                          </IconButton>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    display="flex"
                    alignItems="center"
                    sx={{ fontWeight: "bold" }}
                  >
                    <Notes color="primary" sx={{ mr: 1 }} />
                    Weitere Details
                  </Typography>
                  <Box>
                    {news.bestMoment && (
                      <Box mb={3}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Bester Moment:
                        </Typography>
                        <Typography
                          variant="body1"
                          whiteSpace="pre-wrap"
                          sx={{ lineHeight: 1.6 }}
                        >
                          {news.bestMoment}
                        </Typography>
                      </Box>
                    )}
                    {news.improvementSuggestion && (
                      <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        style={{
                          borderLeft: "4px solid",
                          borderColor: "#f44336",
                          paddingLeft: 8,
                          marginBottom: 24,
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold">
                          Verbesserungsvorschlag:
                        </Typography>
                        <Typography
                          variant="body1"
                          whiteSpace="pre-wrap"
                          sx={{ lineHeight: 1.6 }}
                        >
                          {news.improvementSuggestion}
                        </Typography>
                      </motion.div>
                    )}
                  </Box>
                </Grid>
              </>
            )}
            {news.additionalNotes && (
              <Grid item xs={12}>
                <Divider sx={{ my: 4 }} />
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ fontWeight: "bold" }}
                >
                  Zusätzliche Anmerkungen
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  whiteSpace="pre-wrap"
                  sx={{ lineHeight: 1.6 }}
                >
                  {news.additionalNotes}
                </Typography>
              </Grid>
            )}
          </Grid>
        </MotionPaper>

        {/* Buttons am Seitenende */}
        <Box
          mt={6}
          textAlign="center"
          display="flex"
          justifyContent="center"
          gap={2}
        >
          <Button
            variant="contained"
            color="success"
            onClick={handleMarkAsSeen}
            disabled={news.seen}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: "1rem",
              transition: "transform 0.3s ease",
              "&:hover": { transform: "scale(1.05)" },
            }}
          >
            {news.seen ? "Bereits gesehen" : "Gesehen"}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => router.push("/")}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: "1rem",
              transition: "transform 0.3s ease",
              "&:hover": { transform: "scale(1.05)" },
            }}
          >
            Zurück zur Übersicht
          </Button>
        </Box>

        {/* Modal Dialog für Erklärungen */}
        <Dialog open={openModal !== null} onClose={handleCloseModal}>
          <DialogTitle>{openModal ? ratingTitles[openModal] : ""}</DialogTitle>
          <DialogContent>
            <Typography>
              {openModal ? ratingExplanations[openModal] : ""}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="primary">
              Schließen
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default NewsDetailPage;

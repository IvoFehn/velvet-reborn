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
  alpha,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Notes,
  Favorite,
  Star,
  Info,
  Visibility,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { sendTelegramMessage } from "@/util/sendTelegramMessage";

// Design Tokens
const PRIMARY_COLOR = "#6366f1";
const SUCCESS_COLOR = "#22c55e";
const ERROR_COLOR = "#ef4444";
const BACKGROUND_GRADIENT = "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)";

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
  goldDeduction?: number;
  expDeduction?: number;
}

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
  didSquirt: "Squirting",
  wasAnal: "Anal",
};

// Erstelle ein motion-fähiges Paper-Element
const StyledPaper = motion(Paper);

const NewsDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { width, height } = useWindowSize();

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
      {/* Confetti-Effekt bei hohem Overall Rating */}
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

      <Container
        maxWidth="md"
        sx={{
          py: { xs: 2, md: 4 },
          background: BACKGROUND_GRADIENT,
          minHeight: "100vh",
        }}
      >
        <StyledPaper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 4,
            boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
            border: "1px solid rgba(255,255,255,0.3)",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Header Section */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mb: 4,
              position: "relative",
            }}
          >
            <Chip
              label={dayjs(news.createdAt).format("DD.MM.YYYY - HH:mm")}
              size="small"
              sx={{
                alignSelf: "flex-start",
                bgcolor: alpha(PRIMARY_COLOR, 0.1),
                color: PRIMARY_COLOR,
                fontWeight: 600,
              }}
            />

            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: "2rem", sm: "2.5rem" },
                fontWeight: 800,
                background: `linear-gradient(45deg, ${PRIMARY_COLOR}, ${alpha(
                  PRIMARY_COLOR,
                  0.7
                )})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1.2,
              }}
            >
              {news.title}
            </Typography>

            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              <Rating
                value={displayedOverallRating}
                readOnly
                precision={0.5}
                size="medium"
                sx={{
                  "& .MuiRating-icon": { color: PRIMARY_COLOR },
                }}
              />
              <Chip
                label={`${displayedOverallRating.toFixed(1)}/5`}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
              {!news.seen && (
                <Chip
                  label="Neu"
                  color="error"
                  size="small"
                  sx={{ fontWeight: 700, ml: 1 }}
                />
              )}
            </Box>
          </Box>

          {/* Failed Banner */}
          {news.type === "failed" && (
            <Paper
              sx={{
                p: 2,
                mb: 4,
                background: `linear-gradient(135deg, ${alpha(
                  ERROR_COLOR,
                  0.1
                )}, ${alpha(ERROR_COLOR, 0.05)})`,
                borderLeft: `4px solid ${ERROR_COLOR}`,
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Cancel sx={{ color: ERROR_COLOR, fontSize: 32 }} />
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Auftrag nicht bestanden
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bitte um dringende Verbesserungen
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: alpha(ERROR_COLOR, 0.08),
                      borderRadius: 2,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="overline" color="error">
                      Gold Abzug
                    </Typography>
                    <Typography
                      variant="h5"
                      color="error"
                      sx={{ fontWeight: 800 }}
                    >
                      -{news.goldDeduction || 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: alpha(ERROR_COLOR, 0.08),
                      borderRadius: 2,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="overline" color="error">
                      EXP Abzug
                    </Typography>
                    <Typography
                      variant="h5"
                      color="error"
                      sx={{ fontWeight: 800 }}
                    >
                      -{news.expDeduction || 0}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Main Content */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {news.message && (
              <Box>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    display: "flex",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <Notes sx={{ color: PRIMARY_COLOR }} />
                  Hauptnachricht
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.7,
                    color: "text.secondary",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {news.message}
                </Typography>
              </Box>
            )}

            {news.type === "review" && (
              <>
                {/* Boolean Ratings */}
                <Grid container spacing={2}>
                  {typeof news.didSquirt !== "undefined" && (
                    <Grid item xs={6}>
                      <Paper
                        sx={{
                          p: 2,
                          height: "100%",
                          borderRadius: 2,
                          border: `1px solid ${alpha("#000", 0.1)}`,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          {news.didSquirt ? (
                            <CheckCircle sx={{ color: SUCCESS_COLOR }} />
                          ) : (
                            <Cancel sx={{ color: ERROR_COLOR }} />
                          )}
                          <Box>
                            <Typography fontWeight={600}>Squirting</Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {news.didSquirt
                                ? "Erfolgreich"
                                : "Nicht erreicht"}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  )}
                  {typeof news.wasAnal !== "undefined" && (
                    <Grid item xs={6}>
                      <Paper
                        sx={{
                          p: 2,
                          height: "100%",
                          borderRadius: 2,
                          border: `1px solid ${alpha("#000", 0.1)}`,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          {news.wasAnal ? (
                            <CheckCircle sx={{ color: SUCCESS_COLOR }} />
                          ) : (
                            <Cancel sx={{ color: ERROR_COLOR }} />
                          )}
                          <Box>
                            <Typography fontWeight={600}>Anal</Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {news.wasAnal ? "Ja" : "Nein"}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  )}
                </Grid>

                {/* Detail Ratings */}
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      display: "flex",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Star sx={{ color: PRIMARY_COLOR }} />
                    Detailbewertungen
                  </Typography>
                  <Grid container spacing={2}>
                    {[
                      "obedience",
                      "vibeDuringSex",
                      "vibeAfterSex",
                      "orgasmIntensity",
                      "painlessness",
                      "ballsWorshipping",
                      "cumWorshipping",
                      "didEverythingForHisPleasure",
                    ].map((ratingKey) => (
                      <Grid item xs={12} sm={6} key={ratingKey}>
                        <Paper
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            "&:hover": {
                              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Box>
                              <Typography fontWeight={600}>
                                {ratingTitles[ratingKey]}
                              </Typography>
                              <Rating
                                value={
                                  (news[
                                    ratingKey as keyof NewsDetail
                                  ] as number) || 0
                                }
                                readOnly
                                size="small"
                              />
                            </Box>
                            <IconButton
                              onClick={() => handleOpenModal(ratingKey)}
                              size="small"
                            >
                              <Info fontSize="small" />
                            </IconButton>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {news.bestMoment && (
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        display: "flex",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <Favorite sx={{ color: PRIMARY_COLOR }} />
                      Bester Moment
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        p: 2,
                        bgcolor: alpha(SUCCESS_COLOR, 0.05),
                        borderRadius: 2,
                        color: "text.secondary",
                        borderLeft: `3px solid ${SUCCESS_COLOR}`,
                      }}
                    >
                      {news.bestMoment}
                    </Typography>
                  </Box>
                )}
              </>
            )}

            {news.additionalNotes && (
              <Box>
                <Divider sx={{ my: 4 }} />
                <Typography variant="h6" fontWeight={700}>
                  Zusätzliche Anmerkungen
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6, mt: 1 }}
                >
                  {news.additionalNotes}
                </Typography>
              </Box>
            )}

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
                pt: 4,
              }}
            >
              <Button
                variant="contained"
                fullWidth
                onClick={handleMarkAsSeen}
                disabled={news.seen}
                startIcon={<Visibility />}
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${PRIMARY_COLOR}, ${alpha(
                    PRIMARY_COLOR,
                    0.7
                  )})`,
                  "&:disabled": { background: "grey.200" },
                }}
              >
                {news.seen ? "Bereits gesehen" : "Als gesehen markieren"}
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => router.push("/")}
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  borderColor: "divider",
                }}
              >
                Zurück zur Übersicht
              </Button>
            </Box>
          </Box>
        </StyledPaper>

        {/* Dialog für Erklärungen */}
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

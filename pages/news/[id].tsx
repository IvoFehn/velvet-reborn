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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Alert, // Keep for Snackbar, maybe reconsider for inline failed state
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  alpha,
  useTheme,
  Paper, // Use sparingly for specific sections if needed
} from "@mui/material";
import {
  CheckCircleOutline, // Use outlined icons for a lighter feel
  HighlightOff, // Use outlined icons
  NotesOutlined,
  StarBorder, // Use outlined icons
  InfoOutlined,
  VisibilityOutlined,
  AccessTime,
  ArrowBack,
  CelebrationOutlined,
  EditNoteOutlined,
  ReportProblemOutlined,
  LabelImportantOutlined, // For status
  WarningAmberOutlined, // For deductions
} from "@mui/icons-material";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { sendTelegramMessage } from "@/util/sendTelegramMessage";
import QuickTaskDetail from "@/components/QuickTaskDetail/QuickTaskDetail";

// --- Interface and Mappings (Keep as is) ---
interface NewsDetail {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
  type: "general" | "review" | "failed" | "quickTask";
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
  description?: string; // Quick Task
  url?: string; // Quick Task
  status?: "NEW" | "ACCEPTED" | "DONE" | "FAILED"; // Quick Task
}

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
  didSquirt: "Zeigt an, ob Squirting stattgefunden hat.",
  wasAnal: "Zeigt an, ob der Sex anal beinhaltete.",
};

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
// --- End Interface and Mappings ---

// Animation Variants for Staggering
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Stagger animation of children
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

const NewsDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { width, height } = useWindowSize();
  const theme = useTheme();

  // --- State Variables (Keep as is) ---
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  // --- End State Variables ---

  // --- Handlers (Keep as is) ---
  const handleOpenModal = (rating: string) => setOpenModal(rating);
  const handleCloseModal = () => setOpenModal(null);
  const handleMarkAsSeen = async () => {
    if (!news) return;
    try {
      const response = await fetch(`/api/news?id=${news._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
          `Nutzer hat News ID ${news._id} als gesehen markiert.`
        );
      } else {
        setSnackbarMessage(result.message || "Fehler beim Aktualisieren.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error("Mark as seen error:", err);
      setSnackbarMessage("Netzwerkfehler beim Aktualisieren.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };
  // --- End Handlers ---

  // --- useEffect for Fetching Data (Keep as is) ---
  useEffect(() => {
    if (!router.isReady || !id) return;
    let isMounted = true; // Prevent state update on unmounted component

    const fetchNews = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/news?id=${id}`);
        const result = await response.json();
        if (!isMounted) return; // Exit if component unmounted

        if (!response.ok || !result.success) {
          setError(result.message || `Fehler ${response.status} beim Laden.`);
          setNews(null);
        } else {
          setNews(result.data);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Fetch-Error:", err);
        setError("Netzwerkfehler beim Abrufen der News.");
        setNews(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchNews();

    return () => {
      isMounted = false; // Cleanup function
    };
  }, [router.isReady, id]);
  // --- End useEffect ---

  // --- Rating Calculation (Keep as is) ---
  const computeOverallRating = (newsItem: NewsDetail): number => {
    const ratings: number[] = [];
    if (typeof newsItem.obedience === "number")
      ratings.push(newsItem.obedience);
    if (typeof newsItem.vibeDuringSex === "number")
      ratings.push(newsItem.vibeDuringSex);
    if (typeof newsItem.vibeAfterSex === "number")
      ratings.push(newsItem.vibeAfterSex);
    if (typeof newsItem.orgasmIntensity === "number")
      ratings.push(newsItem.orgasmIntensity);
    if (typeof newsItem.painlessness === "number")
      ratings.push(newsItem.painlessness);
    if (typeof newsItem.ballsWorshipping === "number")
      ratings.push(newsItem.ballsWorshipping);
    if (typeof newsItem.cumWorshipping === "number")
      ratings.push(newsItem.cumWorshipping);
    if (typeof newsItem.didEverythingForHisPleasure === "number")
      ratings.push(newsItem.didEverythingForHisPleasure);
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  };

  const displayedOverallRating =
    news && (news.type === "review" || news.type === "failed")
      ? computeOverallRating(news)
      : news?.overallRating || 0;
  // --- End Rating Calculation ---

  // --- Loading / Error / No Data States (Simplified) ---
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: "center", py: 5 }}>
        <Alert severity="error" sx={{ mb: 3, justifyContent: "center" }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => router.push("/")}
        >
          Zurück
        </Button>
      </Container>
    );
  }

  if (!news) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: "center", py: 5 }}>
        <Alert severity="warning" sx={{ mb: 3, justifyContent: "center" }}>
          Keine Daten gefunden.
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => router.push("/")}
        >
          Zurück
        </Button>
      </Container>
    );
  }
  // --- End Loading / Error / No Data States ---

  // --- Determine Status Chip ---
  let statusChip = null;
  if (news.type === "failed") {
    statusChip = (
      <Chip
        icon={<ReportProblemOutlined />}
        label="Fehlgeschlagen"
        color="error"
        size="small"
      />
    );
  } else if (!news.seen) {
    statusChip = (
      <Chip
        icon={<LabelImportantOutlined />}
        label="Neu"
        color="info"
        size="small"
      />
    );
  }
  // --- End Determine Status Chip ---

  // --- Main Render ---
  return (
    <>
      {/* Confetti Effect */}
      {displayedOverallRating > 4.5 && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
          tweenDuration={10000}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1301,
          }}
        />
      )}

      <Container
        maxWidth="lg" // Wider container
        sx={{
          py: { xs: 3, md: 6 }, // More vertical padding
          bgcolor: "transparent", // Let page background show through or set globally
        }}
      >
        {/* Use framer-motion on the main Stack for staggered animation */}
        <Stack
          component={motion.div} // Make Stack motion-aware
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          spacing={{ xs: 4, md: 5 }} // Responsive spacing between sections
        >
          {/* --- Header Section --- */}
          <Stack component={motion.div} variants={itemVariants} spacing={1.5}>
            {/* Top row: Date and Status */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <AccessTime sx={{ fontSize: "1rem" }} />
                {dayjs(news.createdAt).format("DD. MMMM YYYY, HH:mm")}
              </Typography>
              {statusChip}
            </Stack>

            {/* Title */}
            <Typography
              variant="h2" // More prominent title
              component="h1"
              fontWeight={700} // Bolder
              sx={{
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" }, // Larger Font
                lineHeight: 1.15,
                color: "text.primary", // Default text color for title
              }}
            >
              {news.title}
            </Typography>

            {/* Overall Rating (if applicable) */}
            {(news.type === "review" ||
              news.type === "failed" ||
              news.overallRating > 0) && (
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
              >
                <Rating
                  value={displayedOverallRating}
                  readOnly
                  precision={0.5}
                  size="medium"
                  sx={{ color: theme.palette.warning.main }}
                />
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  color="text.secondary"
                >
                  ({displayedOverallRating.toFixed(1)})
                </Typography>
              </Box>
            )}
          </Stack>
          {/* --- End Header Section --- */}

          <Divider component={motion.div} variants={itemVariants} />

          {/* --- Main Content Area (Message or QuickTask) --- */}
          {news.type === "quickTask" && news.description && news.status ? (
            <Box component={motion.div} variants={itemVariants}>
              <QuickTaskDetail
                task={{
                  _id: news._id,
                  title: news.title,
                  description: news.description,
                  url: news.url,
                  createdAt: news.createdAt,
                  status: news.status,
                }}
              />
            </Box>
          ) : news.message ? (
            <Box component={motion.div} variants={itemVariants}>
              <Typography
                variant="h5"
                component="h2"
                fontWeight="600"
                gutterBottom
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "text.secondary",
                }}
              >
                <NotesOutlined />
                Nachricht
              </Typography>
              {/* Use Paper for slight visual separation of the main message */}
              <Paper
                elevation={0}
                variant="outlined"
                sx={{
                  p: { xs: 2, md: 3 },
                  bgcolor: alpha(theme.palette.grey[500], 0.04),
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.8,
                    whiteSpace: "pre-wrap",
                    color: "text.primary",
                    fontSize: "1.1rem",
                  }}
                >
                  {news.message}
                </Typography>
              </Paper>
            </Box>
          ) : null}
          {/* --- End Main Content Area --- */}

          {/* --- Review/Failed Specific Details --- */}
          {(news.type === "review" || news.type === "failed") && (
            <Grid
              container
              spacing={{ xs: 4, md: 5 }}
              component={motion.div}
              variants={itemVariants}
            >
              {/* Left Column (Ratings, Bools, Deductions) - Takes more space on medium+ screens */}
              <Grid item xs={12} md={7}>
                <Stack spacing={4}>
                  {/* Deductions (if applicable) */}
                  {news.type === "failed" &&
                    (news.goldDeduction || news.expDeduction) && (
                      <Box>
                        <Typography
                          variant="h6"
                          component="h3"
                          fontWeight="600"
                          gutterBottom
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            color: "error.main",
                          }}
                        >
                          <WarningAmberOutlined />
                          Abzüge
                        </Typography>
                        <Paper
                          variant="outlined"
                          sx={{
                            borderColor: "error.light",
                            bgcolor: alpha(theme.palette.error.main, 0.05),
                            p: 2,
                          }}
                        >
                          <Stack direction="row" spacing={3}>
                            {news.goldDeduction && (
                              <Box>
                                <Typography variant="overline" display="block">
                                  Gold
                                </Typography>
                                <Typography
                                  variant="h5"
                                  fontWeight="bold"
                                  color="error.dark"
                                >
                                  -{news.goldDeduction}
                                </Typography>
                              </Box>
                            )}
                            {news.expDeduction && (
                              <Box>
                                <Typography variant="overline" display="block">
                                  EXP
                                </Typography>
                                <Typography
                                  variant="h5"
                                  fontWeight="bold"
                                  color="error.dark"
                                >
                                  -{news.expDeduction}
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </Paper>
                      </Box>
                    )}

                  {/* Boolean Results */}
                  {(typeof news.didSquirt !== "undefined" ||
                    typeof news.wasAnal !== "undefined") && (
                    <Box>
                      <Typography
                        variant="overline"
                        component="h3"
                        fontWeight="600"
                        gutterBottom
                        color="text.secondary"
                      >
                        Spezifische Ergebnisse
                      </Typography>
                      <List dense disablePadding>
                        {typeof news.didSquirt !== "undefined" && (
                          <ListItem disableGutters>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              {news.didSquirt ? (
                                <CheckCircleOutline color="success" />
                              ) : (
                                <HighlightOff color="error" />
                              )}
                            </ListItemIcon>
                            <ListItemText primary="Squirting" />
                          </ListItem>
                        )}
                        {typeof news.wasAnal !== "undefined" && (
                          <ListItem disableGutters>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              {news.wasAnal ? (
                                <CheckCircleOutline color="success" />
                              ) : (
                                <HighlightOff color="error" />
                              )}
                            </ListItemIcon>
                            <ListItemText primary="Analverkehr" />
                          </ListItem>
                        )}
                      </List>
                    </Box>
                  )}

                  {/* Detailed Ratings */}
                  <Box>
                    <Typography
                      variant="overline"
                      component="h3"
                      fontWeight="600"
                      gutterBottom
                      color="text.secondary"
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <StarBorder sx={{ fontSize: "1.1rem" }} />
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
                      ]
                        .filter(
                          (key) =>
                            typeof news[key as keyof NewsDetail] === "number"
                        )
                        .map((ratingKey) => (
                          <Grid item xs={12} sm={6} key={ratingKey}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography variant="body2" fontWeight={500}>
                                {ratingTitles[ratingKey]}
                              </Typography>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Rating
                                  value={
                                    (news[
                                      ratingKey as keyof NewsDetail
                                    ] as number) || 0
                                  }
                                  readOnly
                                  size="small"
                                  precision={0.5}
                                  sx={{ mr: 0.5 }}
                                />
                                <IconButton
                                  edge="end"
                                  onClick={() => handleOpenModal(ratingKey)}
                                  size="small"
                                  sx={{ p: 0.2 }}
                                >
                                  <InfoOutlined sx={{ fontSize: "1rem" }} />
                                </IconButton>
                              </Box>
                            </Stack>
                          </Grid>
                        ))}
                    </Grid>
                  </Box>
                </Stack>
              </Grid>

              {/* Right Column (Textual Notes) - Takes less space on medium+ */}
              <Grid item xs={12} md={5}>
                <Stack spacing={4}>
                  {/* Best Moment */}
                  {news.bestMoment && (
                    <Box>
                      <Typography
                        variant="overline"
                        component="h3"
                        fontWeight="600"
                        gutterBottom
                        color="text.secondary"
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CelebrationOutlined
                          sx={{ fontSize: "1.1rem", color: "success.main" }}
                        />
                        Positivster Moment
                      </Typography>
                      <Box
                        sx={{
                          borderLeft: `3px solid ${theme.palette.success.main}`,
                          pl: 2,
                          bgcolor: alpha(theme.palette.success.main, 0.05),
                          py: 1,
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{ fontStyle: "italic", color: "text.secondary" }}
                        >
                          &ldquo;{news.bestMoment}&ldquo;
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Additional Notes */}
                  {news.additionalNotes && (
                    <Box>
                      <Typography
                        variant="overline"
                        component="h3"
                        fontWeight="600"
                        gutterBottom
                        color="text.secondary"
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <EditNoteOutlined sx={{ fontSize: "1.1rem" }} />
                        Zusätzliche Anmerkungen
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}
                      >
                        {news.additionalNotes}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Grid>
            </Grid>
          )}
          {/* --- End Review/Failed Specific Details --- */}

          {/* --- Action Buttons --- */}
          <Box component={motion.div} variants={itemVariants} sx={{ pt: 3 }}>
            <Divider sx={{ mb: 3 }} />
            <Stack
              direction={{ xs: "column-reverse", sm: "row" }} // Reverse column on mobile so "Mark Seen" is lower
              spacing={2}
              justifyContent="flex-end"
            >
              <Button
                variant="text" // Less prominent back button
                size="large"
                onClick={() => router.push("/")}
                startIcon={<ArrowBack />}
                sx={{ color: "text.secondary" }}
              >
                Übersicht
              </Button>
              <Button
                variant="contained"
                size="large" // Make primary action larger
                onClick={handleMarkAsSeen}
                disabled={news.seen}
                startIcon={<VisibilityOutlined />}
                color="primary"
                sx={{ fontWeight: "bold" }}
              >
                {news.seen ? "Gesehen" : "Als Gesehen Markieren"}
              </Button>
            </Stack>
          </Box>
          {/* --- End Action Buttons --- */}
        </Stack>{" "}
        {/* End Main Animated Stack */}
      </Container>

      {/* --- Dialog and Snackbar (Keep as is, maybe update Dialog style slightly) --- */}
      <Dialog
        open={openModal !== null}
        onClose={handleCloseModal}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <InfoOutlined sx={{ color: "primary.main" }} />
            <Typography variant="h6">
              {openModal ? ratingTitles[openModal] : ""}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {" "}
          {/* Add dividers for better separation */}
          <Typography>
            {openModal ? ratingExplanations[openModal] : ""}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal} variant="outlined">
            {" "}
            {/* Outlined close button */}
            Schließen
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      {/* --- End Dialog and Snackbar --- */}
    </>
  );
};

export default NewsDetailPage;

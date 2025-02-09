/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
// components/ProfilePage.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Modal,
  TextField,
  Button,
  Grid,
  IconButton,
  Paper,
  Stack,
  useTheme,
  alpha,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ImageIcon from "@mui/icons-material/Image";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PaidIcon from "@mui/icons-material/Paid";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { checkAuth } from "@/components/navigation/NavBar";
import {
  InventoryItem as InventoryItemType,
  Profile as ProfileType,
} from "@/types/profile";
import SlideToConfirm from "@/components/slideToConfirm/SlideToConfirm";

const auth = checkAuth();

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State für das abgefragte Profil
  const [profile, setProfile] = useState<ProfileType | null>(null);

  // Lokale States für das Bearbeiten
  const [editMode, setEditMode] = useState<boolean>(false);
  const [localName, setLocalName] = useState("");
  const [localGold, setLocalGold] = useState(0);
  const [localExp, setLocalExp] = useState(0);

  // Image Modal
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState("");

  // Inventar anzeigen/verbergen
  const [showFullInventory, setShowFullInventory] = useState(false);

  // Dialog für Item-Verwendung
  const [useDialogOpen, setUseDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItemType | null>(
    null
  );

  // Fehlerstatus
  const [error, setError] = useState<string>("");

  // Inventar-Item verwenden
  const handleUseItem = async () => {
    if (!selectedItem) return;

    console.log("Verwende InventoryItem:", selectedItem);

    try {
      // Verwende die InventoryItem-ID statt der Item-ID
      const response = await fetch(`/api/profile/${selectedItem._id}`, {
        method: "PUT",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Item konnte nicht verwendet werden"
        );
      }

      const data = await response.json();

      if (data.success) {
        // Aktualisiere lokalen Zustand
        setProfile((prev) => {
          if (!prev) return null;

          const updatedInventory = prev.inventory
            .map((item) => {
              if (item._id === selectedItem._id) {
                // Vergleiche mit InventoryItem-ID
                if (item.quantity === 1) {
                  return null; // Entferne das Item
                } else {
                  return { ...item, quantity: item.quantity - 1 }; // Verringere die Menge
                }
              }
              return item;
            })
            .filter(Boolean) as InventoryItemType[];

          return { ...prev, inventory: updatedInventory };
        });

        setUseDialogOpen(false);
        setSelectedItem(null);
        setError("");
      } else {
        throw new Error(data.message || "Fehler beim Verwenden des Items");
      }
    } catch (error: any) {
      console.error("Fehler beim Verwenden des Items:", error);
      setError(error.message || "Unbekannter Fehler");
    }
  };

  // Item-Klick-Handler
  const handleItemClick = (item: InventoryItemType) => {
    setSelectedItem(item);
    setUseDialogOpen(true);
  };

  // Daten für das Inventar anzeigen
  const displayedInventory = showFullInventory
    ? profile?.inventory || []
    : (profile?.inventory || []).slice(0, isMobile ? 4 : 8);

  // Profil-Daten abrufen
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile/get");
        if (!response.ok) {
          throw new Error("Fehler beim Abrufen des Profils");
        }
        const data = await response.json();
        const fetchedProfile = data.data as ProfileType;

        setProfile(fetchedProfile);
        setLocalName(fetchedProfile.name);
        setLocalGold(fetchedProfile.gold);
        setLocalExp(fetchedProfile.exp);
        setTempImageUrl(fetchedProfile.profileImage || "");
      } catch (error) {
        console.error(error);
        setError("Fehler beim Laden des Profils");
      }
    };

    fetchProfile();
  }, []);

  // Bearbeitete Daten speichern
  const handleSaveEdits = async () => {
    if (!profile) return;

    try {
      const payload = {
        id: profile._id, // Geändert von 'id' zu '_id'
        name: localName,
        gold: localGold,
        exp: localExp,
      };

      const response = await fetch("/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Update fehlgeschlagen");
      }

      // Lokalen Zustand aktualisieren
      setProfile({
        ...profile,
        name: localName,
        gold: localGold,
        exp: localExp,
      });
      // Bearbeitungsmodus verlassen
      setEditMode(false);
      setError("");
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Fehler beim Speichern der Änderungen");
    }
  };

  // Bild aktualisieren (immer erlaubt)
  const handleImageUpdate = async () => {
    if (!profile) return;

    try {
      const payload = {
        id: profile._id, // Geändert von 'id' zu '_id'
        profileImage: tempImageUrl,
      };

      const response = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Update fehlgeschlagen");
      }

      // Zustand aktualisieren
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              profileImage: tempImageUrl,
            }
          : null
      );
      setImageModalOpen(false);
      setError("");
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Fehler beim Aktualisieren des Bildes");
    }
  };

  if (error) {
    return (
      <Box className="mx-auto max-w-2xl px-4 py-8">
        <Box className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-600">
          <WarningAmberIcon fontSize="small" />
          <Typography>{error}</Typography>
        </Box>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box
        sx={{
          textAlign: "center",
          mt: 5,
          color: theme.palette.text.secondary,
        }}
      >
        <Typography variant="h6">Lade Profil ...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 800,
        mx: "auto",
        p: { xs: 1.5, sm: 4 },
        background: `linear-gradient(45deg, ${alpha(
          theme.palette.background.default,
          0.8
        )} 0%, ${theme.palette.background.paper} 100%)`,
        borderRadius: { xs: 2, sm: 4 },
        boxShadow: theme.shadows[2],
      }}
    >
      {/* Header + Edit Buttons */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          gap: { xs: 2, sm: 4 },
          mb: { xs: 3, sm: 6 },
          position: "relative",
          "&:after": {
            content: '""',
            position: "absolute",
            bottom: { xs: -16, sm: -24 },
            left: 0,
            right: 0,
            height: "1px",
            background: `linear-gradient(90deg, transparent, ${alpha(
              theme.palette.divider,
              0.3
            )}, transparent)`,
          },
        }}
      >
        {/* Profilbild (immer aktualisierbar) */}
        <Box
          sx={{
            position: "relative",
            alignSelf: { xs: "center", sm: "flex-start" },
          }}
        >
          <IconButton
            onClick={() => setImageModalOpen(true)}
            sx={{
              p: 0,
              "&:hover .edit-overlay": { opacity: 1 },
              transition: "transform 0.2s",
              "&:active": { transform: "scale(0.95)" },
            }}
          >
            <Avatar
              src={profile.profileImage}
              sx={{
                width: { xs: 96, sm: 128, md: 140 },
                height: { xs: 96, sm: 128, md: 140 },
                bgcolor: theme.palette.primary.light,
                border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <ImageIcon sx={{ fontSize: { xs: 48, sm: 56 } }} />
            </Avatar>
            <Box
              className="edit-overlay"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: "50%",
                bgcolor: alpha(theme.palette.primary.dark, 0.5),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0,
                transition: "opacity 0.2s",
              }}
            >
              <EditRoundedIcon
                sx={{ color: "white", fontSize: { xs: 24, sm: 32 } }}
              />
            </Box>
          </IconButton>
        </Box>

        {/* Profilinfo */}
        <Box sx={{ textAlign: { xs: "center", sm: "left" }, flex: 1 }}>
          {editMode && auth ? (
            <TextField
              variant="outlined"
              size="small"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              sx={{
                mb: { xs: 1, sm: 2 },
                "& .MuiOutlinedInput-input": {
                  fontSize: { xs: "1.8rem", sm: "2.4rem", md: "2.4rem" },
                  fontWeight: 700,
                },
              }}
            />
          ) : (
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "1.8rem", sm: "2.4rem", md: "3rem" },
                fontWeight: 800,
                lineHeight: 1.2,
                mb: { xs: 1, sm: 2 },
              }}
            >
              {profile.name}
            </Typography>
          )}

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 1, sm: 3 }}
            divider={
              <Box
                sx={{
                  width: { xs: "60%", sm: "1px" },
                  height: { xs: "1px", sm: "auto" },
                  mx: "auto",
                  bgcolor: alpha(theme.palette.divider, 0.3),
                }}
              />
            }
          >
            {/* Gold */}
            <Stack direction="row" spacing={1} justifyContent="center">
              <PaidIcon
                sx={{
                  fontSize: { xs: "1.4rem", sm: "1.6rem" },
                  color: theme.palette.warning.main,
                }}
              />
              {editMode && auth ? (
                <TextField
                  variant="outlined"
                  size="small"
                  type="number"
                  value={localGold}
                  onChange={(e) => setLocalGold(+e.target.value)}
                  sx={{ maxWidth: 80 }}
                />
              ) : (
                <Typography
                  variant="h6"
                  sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
                >
                  {profile.gold} Gold
                </Typography>
              )}
            </Stack>

            {/* Exp */}
            <Stack direction="row" spacing={1} justifyContent="center">
              {editMode && auth ? (
                <TextField
                  variant="outlined"
                  size="small"
                  type="number"
                  value={localExp}
                  onChange={(e) => setLocalExp(+e.target.value)}
                  sx={{ maxWidth: 100 }}
                />
              ) : (
                <Typography
                  variant="h6"
                  sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
                >
                  ⭐ {profile.exp} XP
                </Typography>
              )}
            </Stack>
          </Stack>
        </Box>

        {/* Edit Mode Buttons (nur wenn auth === true) */}
        {auth && (
          <Stack direction="row" spacing={2}>
            {!editMode ? (
              <Button
                variant="outlined"
                startIcon={<EditRoundedIcon />}
                onClick={() => setEditMode(true)}
              >
                Edit
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveEdits}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<CancelIcon />}
                  onClick={() => {
                    // Setze lokale States auf Originalwerte zurück
                    setLocalName(profile.name);
                    setLocalGold(profile.gold);
                    setLocalExp(profile.exp);
                    setEditMode(false);
                    setError("");
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
          </Stack>
        )}
      </Box>

      {/* Inventar Abschnitt */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: { xs: 2, sm: 3 },
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: "blur(8px)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{ mb: { xs: 2, sm: 3 } }}
        >
          <Inventory2OutlinedIcon
            sx={{
              fontSize: { xs: 24, sm: 28 },
              color: theme.palette.primary.main,
            }}
          />
          <Typography
            variant="h6"
            sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
          >
            Inventar ({profile.inventory.length})
          </Typography>
        </Stack>

        <Grid container spacing={{ xs: 1.5, sm: 2.5 }}>
          {displayedInventory.map((inventoryItem) => (
            <Grid item xs={6} sm={4} md={3} key={inventoryItem._id}>
              <Paper
                onClick={() => handleItemClick(inventoryItem)}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: theme.shadows[2],
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    bgcolor: theme.palette.primary.main,
                  },
                  cursor: "pointer",
                }}
              >
                <Box
                  sx={{
                    mb: 1,
                    width: "100%",
                    height: 100,
                    borderRadius: 1,
                    overflow: "hidden",
                  }}
                >
                  {inventoryItem.item && inventoryItem.item.img ? (
                    <img
                      src={inventoryItem.item.img}
                      alt={inventoryItem.item.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: alpha(theme.palette.divider, 0.2),
                      }}
                    >
                      <ImageIcon
                        sx={{
                          fontSize: 40,
                          color: theme.palette.text.secondary,
                        }}
                      />
                    </Box>
                  )}
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                    lineHeight: 1.2,
                    mb: 0.5,
                  }}
                >
                  {inventoryItem.item.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontSize: { xs: "0.75rem", sm: "0.85rem" },
                  }}
                >
                  Menge: {inventoryItem.quantity}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {profile.inventory.length > (isMobile ? 4 : 8) && (
          <Box sx={{ mt: { xs: 2, sm: 3 }, textAlign: "center" }}>
            <Button
              onClick={() => setShowFullInventory(!showFullInventory)}
              endIcon={
                <ExpandMoreIcon
                  sx={{
                    transform: showFullInventory ? "rotate(180deg)" : "none",
                    transition: "transform 0.3s",
                  }}
                />
              }
              variant="outlined"
              size="small"
              sx={{
                px: 3,
                borderRadius: 2,
                fontSize: { xs: "0.85rem", sm: "0.9rem" },
                "& .MuiButton-endIcon": { ml: 0.5 },
              }}
            >
              {showFullInventory ? "Show Less" : "Show More"}
            </Button>
          </Box>
        )}
      </Paper>

      {/* Bild Bearbeitungs-Modal */}
      <Modal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        aria-labelledby="image-edit-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 500 },
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 24,
            p: { xs: 2.5, sm: 3.5 },
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 2, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
          >
            Update Profile Image
          </Typography>

          {tempImageUrl && (
            <Box
              sx={{
                mb: 2.5,
                borderRadius: 2,
                overflow: "hidden",
                aspectRatio: "16/9",
                bgcolor: "action.hover",
              }}
            >
              <img
                src={tempImageUrl}
                alt="Preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Box>
          )}

          <TextField
            fullWidth
            size="small"
            label="Image URL"
            value={tempImageUrl}
            onChange={(e) => setTempImageUrl(e.target.value)}
            sx={{ mb: 2.5 }}
            InputProps={{
              sx: {
                borderRadius: 1.5,
                fontSize: { xs: "0.9rem", sm: "1rem" },
              },
            }}
          />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ "& > *": { flex: 1 } }}
          >
            <Button
              variant="outlined"
              onClick={() => setImageModalOpen(false)}
              sx={{
                py: { xs: 1, sm: 0.75 },
                fontSize: { xs: "0.85rem", sm: "0.9rem" },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleImageUpdate}
              disabled={!tempImageUrl}
              sx={{
                py: { xs: 1, sm: 0.75 },
                fontSize: { xs: "0.85rem", sm: "0.9rem" },
              }}
            >
              Save Changes
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Use Item Dialog */}
      <Dialog
        open={useDialogOpen}
        onClose={() => setUseDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center" }}>
          {selectedItem?.item.title} verwenden?
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography variant="body2">
              Ziehe den Schieber nach rechts, um das Item zu verwenden
            </Typography>
          </Box>
          <SlideToConfirm
            onConfirm={() => {
              handleUseItem();
              setUseDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;

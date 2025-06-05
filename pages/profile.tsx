/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
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
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import { checkAuth } from "@/components/navigation/NavBar";
import { useRouter } from "next/router";
import {
  InventoryItem as InventoryItemType,
  Profile as ProfileType,
} from "@/types/profile";
import { CoinBookWidget } from "@/components/coinBookWidget/CoinBookWidget";
import Survey from "@/components/Survey/Survey";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";

const auth = checkAuth();

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();

  // Use the new API hooks
  const { data: profile, loading, error, refetch } = useProfile();
  const updateProfile = useUpdateProfile();

  // Lokaler Bearbeitungs-Status
  const [editMode, setEditMode] = useState<boolean>(false);
  const [localName, setLocalName] = useState(profile?.name || "");
  const [localGold, setLocalGold] = useState(profile?.gold || 0);
  const [localExp, setLocalExp] = useState(profile?.exp || 0);
  const [localKeys, setLocalKeys] = useState(profile?.keys || 0);

  // Modal für Profilbild
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState("");

  // Inventar anzeigen/verbergen
  const [showFullInventory, setShowFullInventory] = useState(false);

  // Dialog für das Verwenden von Inventar-Items
  const [useDialogOpen, setUseDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItemType | null>(
    null
  );

  // Dialog für das Öffnen von Lootboxes
  const [lootboxDialogOpen, setLootboxDialogOpen] = useState(false);
  const [selectedLootbox, setSelectedLootbox] = useState<any>(null);

  // Zustand zum Laden aller Lootboxen (für vollständige Daten)
  const [allLootboxes, setAllLootboxes] = useState<any[]>([]);
  const [loadingAllLootboxes, setLoadingAllLootboxes] =
    useState<boolean>(false);
  const [errorAllLootboxes, setErrorAllLootboxes] = useState<string>("");

  // Update local state when profile data changes
  React.useEffect(() => {
    if (profile) {
      setLocalName(profile.name);
      setLocalGold(profile.gold);
      setLocalExp(profile.exp);
      setLocalKeys(profile.keys);
      setTempImageUrl(profile.profileImage || "");
    }
  }, [profile]);

  // Alle Lootboxen laden
  useEffect(() => {
    const fetchAllLootboxes = async () => {
      try {
        setLoadingAllLootboxes(true);
        const response = await fetch("/api/lootbox");
        const data = await response.json();
        if (data.success) {
          setAllLootboxes(data.lootboxes);
        } else {
          setErrorAllLootboxes(
            data.message || "Fehler beim Laden der Lootboxen"
          );
        }
      } catch (err: any) {
        console.error(err);
        setErrorAllLootboxes("Fehler: " + err.message);
      } finally {
        setLoadingAllLootboxes(false);
      }
    };

    fetchAllLootboxes();
  }, []);

  // Hilfsfunktion: Liefert vollständige Lootbox-Daten für einen Eintrag aus profile.lootboxes
  const getLootboxData = (entry: any) => {
    if (
      entry.lootbox &&
      typeof entry.lootbox === "object" &&
      entry.lootbox.img
    ) {
      return entry.lootbox;
    }
    return allLootboxes.find((lb) => lb._id === entry.lootbox) || {};
  };

  // Falls ein Fehler vorliegt, diesen anzeigen
  if (error) {
    return (
      <Box sx={{ mx: "auto", maxWidth: 800, p: 4 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            backgroundColor: alpha(theme.palette.error.main, 0.1),
            borderRadius: 2,
          }}
        >
          <WarningAmberIcon />
          <Typography>{error}</Typography>
        </Box>
      </Box>
    );
  }

  // Falls das Profil noch nicht geladen wurde, Ladeanzeige
  if (loading || !profile) {
    return (
      <Box
        sx={{ textAlign: "center", mt: 5, color: theme.palette.text.secondary }}
      >
        <Typography variant="h6">Lade Profil ...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{ textAlign: "center", mt: 5, color: theme.palette.error.main }}
      >
        <Typography variant="h6">Fehler: {error}</Typography>
      </Box>
    );
  }

  // Für die Anzeige des Inventars (limitiert oder voll)
  const displayedInventory = showFullInventory
    ? profile.inventory || []
    : (profile.inventory || []).slice(0, isMobile ? 4 : 8);

  // Handler für Bearbeitungsfunktionen im Admin-Modus (Admin-Endpoint)
  const handleSaveEdits = async () => {
    if (!profile) return;
    try {
      const payload = {
        id: profile._id,
        name: localName,
        gold: localGold,
        exp: localExp,
        keys: localKeys,
      };

      await updateProfile.mutate(payload);
      setEditMode(false);
      refetch(); // Refresh profile data
    } catch (err: any) {
      console.error(err);
      // Error is already handled by the hook
    }
  };

  const handleImageUpdate = async () => {
    if (!profile) return;
    try {
      const payload = {
        id: profile._id,
        profileImage: tempImageUrl,
      };
      
      await updateProfile.mutate(payload);
      setImageModalOpen(false);
      refetch(); // Refresh profile data
    } catch (err: any) {
      console.error(err);
      // Error is already handled by the hook
    }
  };

  // Handler für die Verwendung eines Inventar-Items
  const handleUseItem = async () => {
    if (!selectedItem) return;
    try {
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
        setProfile((prev) => {
          if (!prev) return null;
          const updatedInventory = prev.inventory
            .map((item) => {
              if (item._id === selectedItem._id) {
                if (item.quantity === 1) {
                  return null;
                } else {
                  return { ...item, quantity: item.quantity - 1 };
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
    } catch (err: any) {
      console.error("Fehler beim Verwenden des Items:", err);
      setError(err.message || "Unbekannter Fehler");
    }
  };

  const handleItemClick = (item: InventoryItemType) => {
    setSelectedItem(item);
    setUseDialogOpen(true);
  };

  return (
    <Box
      sx={{ width: "100%", maxWidth: 800, mx: "auto", p: { xs: 1.5, sm: 4 } }}
    >
      {/* Header und Profilinformationen */}
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

            <Stack direction="row" spacing={1} justifyContent="center">
              <VpnKeyIcon
                sx={{
                  fontSize: { xs: "1.4rem", sm: "1.6rem" },
                  color: theme.palette.info.main,
                }}
              />
              {editMode && auth ? (
                <TextField
                  variant="outlined"
                  size="small"
                  type="number"
                  value={localKeys}
                  onChange={(e) => setLocalKeys(+e.target.value)}
                  sx={{ maxWidth: 80 }}
                />
              ) : (
                <Typography
                  variant="h6"
                  sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
                >
                  {profile.keys} Keys
                </Typography>
              )}
            </Stack>
          </Stack>
        </Box>

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
                    setLocalName(profile.name);
                    setLocalGold(profile.gold);
                    setLocalExp(profile.exp);
                    setLocalKeys(profile.keys);
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

      {/* Inventar-Abschnitt */}
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
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
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

      {/* Lootbox-Abschnitt */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: { xs: 2, sm: 3 },
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: "blur(8px)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          mt: 3,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{ mb: { xs: 2, sm: 3 } }}
        >
          <CardGiftcardIcon
            sx={{
              fontSize: { xs: 24, sm: 28 },
              color: theme.palette.primary.main,
            }}
          />
          <Typography
            variant="h6"
            sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
          >
            Lootboxes ({profile.lootboxes?.length || 0})
          </Typography>
        </Stack>
        {loadingAllLootboxes ? (
          <Typography>Lade Lootboxen...</Typography>
        ) : errorAllLootboxes ? (
          <Typography color="error">{errorAllLootboxes}</Typography>
        ) : (
          <Grid container spacing={{ xs: 1.5, sm: 2.5 }}>
            {profile.lootboxes &&
              profile.lootboxes.map((entry: any, index: number) => {
                // entry: { lootbox: <ID oder Objekt>, quantity: number }
                const lb = getLootboxData(entry);
                return (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Paper
                      onClick={() => {
                        if (profile.keys < 1) {
                          setError(
                            "Nicht genügend Keys, um die Lootbox zu öffnen."
                          );
                        } else {
                          setSelectedLootbox(lb);
                          setLootboxDialogOpen(true);
                        }
                      }}
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
                        {lb.img ? (
                          <img
                            src={lb.img}
                            alt={lb.type}
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
                        {lb.type}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        Menge: {entry.quantity}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
          </Grid>
        )}
      </Paper>
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: { xs: 2, sm: 3 },
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          mt: 3,
        }}
      >
        <CoinBookWidget />
      </Paper>
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: { xs: 2, sm: 3 },
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          mt: 3,
        }}
      >
        <Survey />
      </Paper>

      {/* Dialog für das Öffnen einer Lootbox */}
      <Dialog
        open={lootboxDialogOpen}
        onClose={() => setLootboxDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center" }}>
          {selectedLootbox?.type} öffnen?
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: "center", mb: 2 }}>
            {profile.keys < 1 ? (
              <Typography variant="body2" color="error">
                Nicht genügend Keys vorhanden.
              </Typography>
            ) : (
              <Typography variant="body2">Lootbox öffnen.</Typography>
            )}
          </Box>
          {profile.keys >= 1 && (
            <Button
              variant="contained"
              fullWidth
              onClick={() => router.push(`/lootbox?id=${selectedLootbox?._id}`)}
            >
              Lootbox öffnen
            </Button>
          )}
          {profile.keys < 1 && (
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setLootboxDialogOpen(false)}
            >
              Schließen
            </Button>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal zum Bearbeiten des Profilbildes */}
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
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
              sx: { borderRadius: 1.5, fontSize: { xs: "0.9rem", sm: "1rem" } },
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

      {/* Dialog für das Verwenden eines Inventar-Items */}
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
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              handleUseItem();
              setUseDialogOpen(false);
            }}
          >
            Item verwenden
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;

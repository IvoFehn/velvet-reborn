import React, { useState, useEffect, useCallback } from 'react';
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
  Alert,
  Snackbar,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ImageIcon from '@mui/icons-material/Image';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PaidIcon from '@mui/icons-material/Paid';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import { checkAuth } from '@/components/navigation/SimpleNavBar';
import { useRouter } from 'next/router';
import {
  InventoryItem as InventoryItemType,
} from '@/types/profile';
import { CoinBookWidget } from '@/components/coinBookWidget/CoinBookWidget';
import Survey from '@/components/Survey/Survey';
import { useProfile, useUpdateProfile, useOptimisticProfileUpdate } from '@/hooks/useProfile';
import { useAppStore } from '@/stores/appStore';

// Types for local state
interface LootboxData {
  _id: string;
  type: string;
  img?: string;
}

interface LootboxEntry {
  lootbox: string | LootboxData;
  quantity: number;
}

interface EditFormData {
  name: string;
  gold: number;
  exp: number;
  keys: number;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
  };
}

// Check authentication once at module level
const auth = checkAuth();

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();

  // Store-based hooks for profile data
  const { data: profile, loading, error, refetch } = useProfile();
  const updateProfile = useUpdateProfile();
  const { updateOptimistic } = useOptimisticProfileUpdate();
  const { addLoadingOperation, removeLoadingOperation } = useAppStore();

  // Local UI state
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<EditFormData>({
    name: '',
    gold: 0,
    exp: 0,
    keys: 0,
  });

  // Modal states
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState('');

  // Inventory display state
  const [showFullInventory, setShowFullInventory] = useState(false);

  // Item usage dialog
  const [useDialogOpen, setUseDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItemType | null>(null);

  // Lootbox dialog
  const [lootboxDialogOpen, setLootboxDialogOpen] = useState(false);
  const [selectedLootbox, setSelectedLootbox] = useState<LootboxData | null>(null);

  // Lootbox data
  const [allLootboxes, setAllLootboxes] = useState<LootboxData[]>([]);
  const [loadingAllLootboxes, setLoadingAllLootboxes] = useState<boolean>(false);
  const [errorAllLootboxes, setErrorAllLootboxes] = useState<string>('');

  // Notification state
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Update local form when profile data changes
  useEffect(() => {
    if (profile) {
      setEditForm(prev => {
        // Only update if values have actually changed
        if (prev.name !== profile.name || 
            prev.gold !== profile.gold || 
            prev.exp !== profile.exp || 
            prev.keys !== profile.keys) {
          return {
            name: profile.name,
            gold: profile.gold,
            exp: profile.exp,
            keys: profile.keys,
          };
        }
        return prev;
      });
      setTempImageUrl(prev => {
        const newUrl = profile.profileImage || '';
        return prev !== newUrl ? newUrl : prev;
      });
    }
  }, [profile]);

  // Load all lootboxes on mount
  useEffect(() => {
    const fetchAllLootboxes = async () => {
      try {
        setLoadingAllLootboxes(true);
        setErrorAllLootboxes('');

        const response = await fetch('/api/gaming?action=lootbox');
        const data: ApiResponse<{ lootboxes: LootboxData[] }> = await response.json();

        if (data.success && data.data) {
          setAllLootboxes(data.data.lootboxes);
        } else {
          setErrorAllLootboxes(
            data.error?.message || 'Fehler beim Laden der Lootboxen'
          );
        }
      } catch (err) {
        console.error('Error fetching lootboxes:', err);
        setErrorAllLootboxes(
          err instanceof Error ? err.message : 'Unbekannter Fehler'
        );
      } finally {
        setLoadingAllLootboxes(false);
      }
    };

    fetchAllLootboxes();
  }, []);

  // Helper function to get full lootbox data
  const getLootboxData = useCallback((entry: LootboxEntry): LootboxData => {
    if (
      entry.lootbox &&
      typeof entry.lootbox === 'object' &&
      'img' in entry.lootbox
    ) {
      return entry.lootbox as LootboxData;
    }
    
    const lootboxId = typeof entry.lootbox === 'string' ? entry.lootbox : entry.lootbox._id;
    return allLootboxes.find((lb) => lb._id === lootboxId) || {
      _id: lootboxId,
      type: 'Unknown',
    };
  }, [allLootboxes]);

  // Show notification
  const showNotification = useCallback((
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    setNotification({ open: true, message, severity });
  }, []);

  // Close notification
  const closeNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  // Handle profile edit save
  const handleSaveEdits = useCallback(async () => {
    if (!profile) return;

    const operationId = 'profile-save-edits';
    addLoadingOperation(operationId);

    try {
      const payload = {
        id: profile._id,
        ...editForm,
      };

      // Optimistic update first (immediate UI response)
      updateOptimistic(editForm);

      // Then sync with server
      await updateProfile.mutate(payload);
      setEditMode(false);
      showNotification('Profil erfolgreich aktualisiert', 'success');
    } catch (err) {
      console.error('Error saving profile:', err);
      showNotification(
        err instanceof Error ? err.message : 'Fehler beim Speichern',
        'error'
      );
      // Error is already handled by the hook, profile will revert
    } finally {
      removeLoadingOperation(operationId);
    }
  }, [
    profile,
    editForm,
    updateOptimistic,
    updateProfile,
    addLoadingOperation,
    removeLoadingOperation,
    showNotification,
  ]);

  // Handle image update
  const handleImageUpdate = useCallback(async () => {
    if (!profile) return;

    const operationId = 'profile-image-update';
    addLoadingOperation(operationId);

    try {
      const payload = {
        id: profile._id,
        profileImage: tempImageUrl,
      };

      // Optimistic update first
      updateOptimistic({ profileImage: tempImageUrl });

      // Then sync with server
      await updateProfile.mutate(payload);
      setImageModalOpen(false);
      showNotification('Profilbild erfolgreich aktualisiert', 'success');
    } catch (err) {
      console.error('Error updating image:', err);
      showNotification(
        err instanceof Error ? err.message : 'Fehler beim Aktualisieren des Bildes',
        'error'
      );
      // Error is already handled by the hook, profile will revert
    } finally {
      removeLoadingOperation(operationId);
    }
  }, [
    profile,
    tempImageUrl,
    updateOptimistic,
    updateProfile,
    addLoadingOperation,
    removeLoadingOperation,
    showNotification,
  ]);

  // Handle item usage
  const handleUseItem = useCallback(async () => {
    if (!selectedItem || !profile) return;

    try {
      const response = await fetch(
        `/api/user?action=inventory&itemId=${selectedItem._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Item konnte nicht verwendet werden');
      }

      // Refresh profile data
      await refetch();
      setUseDialogOpen(false);
      setSelectedItem(null);
      showNotification('Item erfolgreich verwendet', 'success');
    } catch (err) {
      console.error('Error using item:', err);
      showNotification(
        err instanceof Error ? err.message : 'Fehler beim Verwenden des Items',
        'error'
      );
    }
  }, [selectedItem, profile, refetch, showNotification]);

  // Handle item click
  const handleItemClick = useCallback((item: InventoryItemType) => {
    setSelectedItem(item);
    setUseDialogOpen(true);
  }, []);

  // Handle edit form changes
  const handleEditFormChange = useCallback(
    (field: keyof EditFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = field === 'name' ? event.target.value : Number(event.target.value);
      setEditForm(prev => ({ ...prev, [field]: value }));
    },
    []
  );

  // Handle edit cancel
  const handleEditCancel = useCallback(() => {
    if (profile) {
      setEditForm({
        name: profile.name,
        gold: profile.gold,
        exp: profile.exp,
        keys: profile.keys,
      });
    }
    setEditMode(false);
  }, [profile]);

  // Handle lootbox click
  const handleLootboxClick = useCallback(
    (lootbox: LootboxData) => {
      if (!profile || profile.keys < 1) {
        showNotification('Nicht genügend Keys, um die Lootbox zu öffnen.', 'warning');
        return;
      }
      setSelectedLootbox(lootbox);
      setLootboxDialogOpen(true);
    },
    [profile, showNotification]
  );

  // Handle lootbox open
  const handleOpenLootbox = useCallback(() => {
    if (selectedLootbox) {
      router.push(`/lootbox?id=${selectedLootbox._id}`);
    }
  }, [selectedLootbox, router]);

  // Error display
  if (error) {
    return (
      <Box sx={{ mx: 'auto', maxWidth: 800, p: 4 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
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

  // Loading display
  if (loading || !profile) {
    return (
      <Box
        sx={{ textAlign: 'center', mt: 5, color: theme.palette.text.secondary }}
      >
        <Typography variant="h6">Lade Profil ...</Typography>
      </Box>
    );
  }

  // Calculate displayed inventory
  const displayedInventory = showFullInventory
    ? profile.inventory || []
    : (profile.inventory || []).slice(0, isMobile ? 4 : 8);

  return (
    <Box
      sx={{ width: '100%', maxWidth: 800, mx: 'auto', p: { xs: 1.5, sm: 4 } }}
    >
      {/* Header and Profile Information */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          gap: { xs: 2, sm: 4 },
          mb: { xs: 3, sm: 6 },
          position: 'relative',
          '&:after': {
            content: '""',
            position: 'absolute',
            bottom: { xs: -16, sm: -24 },
            left: 0,
            right: 0,
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${alpha(
              theme.palette.divider,
              0.3
            )}, transparent)`,
          },
        }}
      >
        {/* Profile Image */}
        <Box
          sx={{
            position: 'relative',
            alignSelf: { xs: 'center', sm: 'flex-start' },
          }}
        >
          <IconButton
            onClick={() => setImageModalOpen(true)}
            sx={{
              p: 0,
              '&:hover .edit-overlay': { opacity: 1 },
              transition: 'transform 0.2s',
              '&:active': { transform: 'scale(0.95)' },
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
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.dark, 0.5),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.2s',
              }}
            >
              <EditRoundedIcon
                sx={{ color: 'white', fontSize: { xs: 24, sm: 32 } }}
              />
            </Box>
          </IconButton>
        </Box>

        {/* Profile Details */}
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, flex: 1 }}>
          {editMode && auth ? (
            <TextField
              variant="outlined"
              size="small"
              value={editForm.name}
              onChange={handleEditFormChange('name')}
              sx={{
                mb: { xs: 1, sm: 2 },
                '& .MuiOutlinedInput-input': {
                  fontSize: { xs: '1.8rem', sm: '2.4rem', md: '2.4rem' },
                  fontWeight: 700,
                },
              }}
            />
          ) : (
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '1.8rem', sm: '2.4rem', md: '3rem' },
                fontWeight: 800,
                lineHeight: 1.2,
                mb: { xs: 1, sm: 2 },
              }}
            >
              {profile.name}
            </Typography>
          )}

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1, sm: 3 }}
            divider={
              <Box
                sx={{
                  width: { xs: '60%', sm: '1px' },
                  height: { xs: '1px', sm: 'auto' },
                  mx: 'auto',
                  bgcolor: alpha(theme.palette.divider, 0.3),
                }}
              />
            }
          >
            {/* Gold */}
            <Stack direction="row" spacing={1} justifyContent="center">
              <PaidIcon
                sx={{
                  fontSize: { xs: '1.4rem', sm: '1.6rem' },
                  color: theme.palette.warning.main,
                }}
              />
              {editMode && auth ? (
                <TextField
                  variant="outlined"
                  size="small"
                  type="number"
                  value={editForm.gold}
                  onChange={handleEditFormChange('gold')}
                  sx={{ maxWidth: 80 }}
                />
              ) : (
                <Typography
                  variant="h6"
                  sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                >
                  {profile.gold} Gold
                </Typography>
              )}
            </Stack>

            {/* Experience */}
            <Stack direction="row" spacing={1} justifyContent="center">
              {editMode && auth ? (
                <TextField
                  variant="outlined"
                  size="small"
                  type="number"
                  value={editForm.exp}
                  onChange={handleEditFormChange('exp')}
                  sx={{ maxWidth: 100 }}
                />
              ) : (
                <Typography
                  variant="h6"
                  sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                >
                  ⭐ {profile.exp} XP
                </Typography>
              )}
            </Stack>

            {/* Keys */}
            <Stack direction="row" spacing={1} justifyContent="center">
              <VpnKeyIcon
                sx={{
                  fontSize: { xs: '1.4rem', sm: '1.6rem' },
                  color: theme.palette.info.main,
                }}
              />
              {editMode && auth ? (
                <TextField
                  variant="outlined"
                  size="small"
                  type="number"
                  value={editForm.keys}
                  onChange={handleEditFormChange('keys')}
                  sx={{ maxWidth: 80 }}
                />
              ) : (
                <Typography
                  variant="h6"
                  sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                >
                  {profile.keys} Keys
                </Typography>
              )}
            </Stack>
          </Stack>
        </Box>

        {/* Edit Controls */}
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
                  onClick={handleEditCancel}
                >
                  Cancel
                </Button>
              </>
            )}
          </Stack>
        )}
      </Box>

      {/* Inventory Section */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: { xs: 2, sm: 3 },
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(8px)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
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
            sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
          >
            Inventar ({profile.inventory?.length || 0})
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
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[2],
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    bgcolor: theme.palette.primary.main,
                  },
                  cursor: 'pointer',
                }}
              >
                <Box
                  sx={{
                    mb: 1,
                    width: '100%',
                    height: 100,
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  {inventoryItem.item?.img ? (
                    <img
                      src={inventoryItem.item.img}
                      alt={inventoryItem.item.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
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
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    lineHeight: 1.2,
                    mb: 0.5,
                  }}
                >
                  {inventoryItem.item?.title || 'Unknown Item'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Menge: {inventoryItem.quantity}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {(profile.inventory?.length || 0) > (isMobile ? 4 : 8) && (
          <Box sx={{ mt: { xs: 2, sm: 3 }, textAlign: 'center' }}>
            <Button
              onClick={() => setShowFullInventory(!showFullInventory)}
              endIcon={
                <ExpandMoreIcon
                  sx={{
                    transform: showFullInventory ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.3s',
                  }}
                />
              }
              variant="outlined"
              size="small"
              sx={{
                px: 3,
                borderRadius: 2,
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                '& .MuiButton-endIcon': { ml: 0.5 },
              }}
            >
              {showFullInventory ? 'Show Less' : 'Show More'}
            </Button>
          </Box>
        )}
      </Paper>

      {/* Lootbox Section */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: { xs: 2, sm: 3 },
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(8px)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
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
            sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
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
            {profile.lootboxes?.map((entry: LootboxEntry, index: number) => {
              const lb = getLootboxData(entry);
              return (
                <Grid item xs={6} sm={4} md={3} key={`${lb._id}-${index}`}>
                  <Paper
                    onClick={() => handleLootboxClick(lb)}
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 2,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[2],
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        bgcolor: theme.palette.primary.main,
                      },
                      cursor: 'pointer',
                    }}
                  >
                    <Box
                      sx={{
                        mb: 1,
                        width: '100%',
                        height: 100,
                        borderRadius: 1,
                        overflow: 'hidden',
                      }}
                    >
                      {lb.img ? (
                        <img
                          src={lb.img}
                          alt={lb.type}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
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
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        lineHeight: 1.2,
                        mb: 0.5,
                      }}
                    >
                      {lb.type}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Menge: {entry.quantity}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Paper>

      {/* Coin Book Widget */}
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

      {/* Survey Widget */}
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

      {/* Image Edit Modal */}
      <Modal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        aria-labelledby="image-edit-modal"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 500 },
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: { xs: 2.5, sm: 3.5 },
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 2, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
          >
            Update Profile Image
          </Typography>

          {tempImageUrl && (
            <Box
              sx={{
                mb: 2.5,
                borderRadius: 2,
                overflow: 'hidden',
                aspectRatio: '16/9',
                bgcolor: 'action.hover',
              }}
            >
              <img
                src={tempImageUrl}
                alt="Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              variant="outlined"
              onClick={() => setImageModalOpen(false)}
              sx={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleImageUpdate}
              disabled={!tempImageUrl}
              sx={{ flex: 1 }}
            >
              Save Changes
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Item Use Dialog */}
      <Dialog
        open={useDialogOpen}
        onClose={() => setUseDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center' }}>
          {selectedItem?.item?.title} verwenden?
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="body2">
              Möchten Sie dieses Item verwenden?
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setUseDialogOpen(false)}
            >
              Abbrechen
            </Button>
            <Button variant="contained" fullWidth onClick={handleUseItem}>
              Item verwenden
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Lootbox Open Dialog */}
      <Dialog
        open={lootboxDialogOpen}
        onClose={() => setLootboxDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center' }}>
          {selectedLootbox?.type} öffnen?
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            {profile && profile.keys >= 1 ? (
              <Typography variant="body2">
                Möchten Sie diese Lootbox öffnen?
              </Typography>
            ) : (
              <Typography variant="body2" color="error">
                Nicht genügend Keys vorhanden.
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setLootboxDialogOpen(false)}
            >
              {profile && profile.keys >= 1 ? 'Abbrechen' : 'Schließen'}
            </Button>
            {profile && profile.keys >= 1 && (
              <Button variant="contained" fullWidth onClick={handleOpenLootbox}>
                Lootbox öffnen
              </Button>
            )}
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={closeNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;
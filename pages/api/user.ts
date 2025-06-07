import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Profile from '@/models/Profile';

// Enhanced API Response interface with proper typing
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  meta?: {
    timestamp: string;
    version: string;
    requestId?: string;
  };
  error?: {
    code: string;
    message: string;
    details?: string[];
    instance: string;
    timestamp: string;
  };
}

interface ProfileData {
  _id: string;
  name: string;
  email?: string;
  profileImage?: string;
  gold: number;
  exp: number;
  level: number;
  keys: number;
  streakCount: number;
  lastLogin?: Date;
  inventory?: InventoryItem[];
  lootboxes?: LootboxEntry[];
}

interface InventoryItem {
  _id: string;
  item: {
    _id: string;
    title: string;
    img?: string;
    description?: string;
  };
  quantity: number;
}

interface LootboxEntry {
  lootbox: string;
  quantity: number;
}

interface UpdateProfilePayload {
  id?: string;
  name?: string;
  email?: string;
  profileImage?: string;
  gold?: number;
  exp?: number;
  level?: number;
  keys?: number;
  streakCount?: number;
}

interface StatsData {
  level: number;
  exp: number;
  gold: number;
  keys: number;
  streakCount: number;
  lastLogin?: Date;
}

interface DailyLoginBonus {
  gold: number;
  exp: number;
}

interface DailyLoginResponse {
  bonus: DailyLoginBonus;
  streak: number;
  consecutiveDays: number;
  lastClaimAt: Date;
  canClaimToday: boolean;
  profile: {
    gold: number;
    exp: number;
    level: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
): Promise<void> {
  await dbConnect();

  const { query } = req;
  const action = query.action as string;

  // Generate request ID for tracing
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    switch (action) {
      case 'profile':
        return await handleProfile(req, res, requestId);
      case 'inventory':
        return await handleInventory(req, res, requestId);
      case 'stats':
        return await handleStats(req, res, requestId);
      case 'daily-login':
        return await handleDailyLogin(req, res, requestId);
      case 'login':
        return await handleLogin(req, res, requestId);
      default:
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ACTION',
            message: `Invalid action: ${action}. Valid actions: profile, inventory, stats, daily-login, login`,
            instance: '/api/user',
            timestamp: new Date().toISOString(),
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: 'v1',
            requestId,
          }
        });
    }
  } catch (error) {
    console.error('User API Error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? [error instanceof Error ? error.message : String(error)] : undefined,
        instance: '/api/user',
        timestamp: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId,
      }
    });
  }
}

// Profile Management
async function handleProfile(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  requestId: string
): Promise<void> {
  switch (req.method) {
    case 'GET':
      return await getProfile(res, requestId);
    case 'PUT':
      return await updateProfile(req, res, requestId);
    case 'POST':
      return await createProfile(req, res, requestId);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'POST']);
      return res.status(405).json({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: `Method ${req.method} not allowed for profile. Allowed methods: GET, PUT, POST`,
          instance: '/api/user?action=profile',
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId,
        }
      });
  }
}

async function getProfile(res: NextApiResponse<ApiResponse>, requestId: string): Promise<void> {
  try {
    const profile = await Profile.findOne({}).lean() as ProfileData | null;
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'No profile found. Please create a profile first.',
          instance: '/api/user?action=profile',
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId,
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: profile,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId,
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
}

async function updateProfile(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  requestId: string
): Promise<void> {
  try {
    const updates = req.body as UpdateProfilePayload;
    
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST_BODY',
          message: 'Request body must be a valid object with profile updates',
          instance: '/api/user?action=profile',
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId,
        }
      });
    }

    const profile = await Profile.findOne({});
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'Profile not found',
          instance: '/api/user?action=profile',
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId,
        }
      });
    }

    // Validate and apply updates
    const allowedFields: (keyof UpdateProfilePayload)[] = [
      'name', 'email', 'profileImage', 'gold', 'exp', 'level', 'keys', 'streakCount'
    ];

    const validUpdates: Partial<ProfileData> = {};
    let hasValidUpdates = false;

    for (const field of allowedFields) {
      if (field in updates && updates[field] !== undefined) {
        (validUpdates as Record<string, unknown>)[field] = updates[field];
        hasValidUpdates = true;
      }
    }

    if (!hasValidUpdates) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_VALID_UPDATES',
          message: 'No valid fields provided for update',
          details: [`Valid fields: ${allowedFields.join(', ')}`],
          instance: '/api/user?action=profile',
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId,
        }
      });
    }

    Object.assign(profile, validUpdates);
    await profile.save();

    return res.status(200).json({
      success: true,
      data: profile.toObject(),
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId,
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

async function createProfile(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  requestId: string
): Promise<void> {
  try {
    const profileData = req.body as Partial<ProfileData>;
    
    const existingProfile = await Profile.findOne({});
    if (existingProfile) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'PROFILE_ALREADY_EXISTS',
          message: 'A profile already exists. Use PUT to update it.',
          instance: '/api/user?action=profile',
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId,
        }
      });
    }

    const profile = new Profile(profileData);
    await profile.save();

    return res.status(201).json({
      success: true,
      data: profile.toObject(),
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId,
      }
    });
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
}

// Inventory Management
async function handleInventory(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  requestId: string
): Promise<void> {
  const { query } = req;
  const itemId = query.itemId as string;

  switch (req.method) {
    case 'GET':
      return await getInventory(res, requestId);
    case 'PUT':
      if (!itemId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_ITEM_ID',
            message: 'Item ID is required for inventory operations. Use ?itemId=<id> query parameter.',
            instance: '/api/user?action=inventory',
            timestamp: new Date().toISOString(),
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: 'v1',
            requestId,
          }
        });
      }
      return await consumeInventoryItem(itemId, res, requestId);
    case 'POST':
      return await addInventoryItem(req, res, requestId);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'POST']);
      return res.status(405).json({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: `Method ${req.method} not allowed for inventory. Allowed methods: GET, PUT, POST`,
          instance: '/api/user?action=inventory',
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId,
        }
      });
  }
}

async function getInventory(res: NextApiResponse<ApiResponse>, requestId: string): Promise<void> {
  try {
    const profile = await Profile.findOne({}).lean() as ProfileData | null;
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'Profile not found',
          instance: '/api/user?action=inventory',
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId,
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: profile.inventory || [],
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId,
      }
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
}

async function consumeInventoryItem(
  itemId: string,
  res: NextApiResponse<ApiResponse>,
  requestId: string
): Promise<void> {
  try {
    const profile = await Profile.findOne({});
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'Profile not found',
          instance: '/api/user?action=inventory',
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId,
        }
      });
    }

    if (!profile.inventory || profile.inventory.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'EMPTY_INVENTORY',
          message: 'Inventory is empty',
          instance: '/api/user?action=inventory',
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId,
        }
      });
    }

    const itemIndex = profile.inventory.findIndex((item: { _id?: { toString(): string } }) => item._id?.toString() === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ITEM_NOT_FOUND',
          message: 'Item not found in inventory',
          details: [`Item ID: ${itemId}`],
          instance: '/api/user?action=inventory',
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId,
        }
      });
    }

    const item = profile.inventory[itemIndex];
    const itemName = item.item?.title || 'Unknown Item';
    
    // Consume item logic (reduce quantity or remove)
    if (item.quantity <= 1) {
      profile.inventory.splice(itemIndex, 1);
    } else {
      profile.inventory[itemIndex].quantity -= 1;
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      data: { 
        message: `${itemName} used successfully`,
        itemId,
        remainingQuantity: item.quantity <= 1 ? 0 : item.quantity - 1,
        inventory: profile.inventory,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId,
      }
    });
  } catch (error) {
    console.error('Error consuming inventory item:', error);
    throw error;
  }
}

async function addInventoryItem(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  requestId: string
): Promise<void> {
  try {
    const itemData = req.body as InventoryItem;
    
    if (!itemData || !itemData.item || !itemData.quantity) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ITEM_DATA',
          message: 'Item data must include item object and quantity',
          instance: '/api/user?action=inventory',
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId,
        }
      });
    }

    const profile = await Profile.findOne({});
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'Profile not found',
          instance: '/api/user?action=inventory',
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId,
        }
      });
    }

    if (!profile.inventory) {
      profile.inventory = [];
    }

    profile.inventory.push(itemData);
    await profile.save();

    return res.status(201).json({
      success: true,
      data: {
        message: 'Item added to inventory successfully',
        addedItem: itemData,
        inventory: profile.inventory,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId,
      }
    });
  } catch (error) {
    console.error('Error adding inventory item:', error);
    throw error;
  }
}

// Stats Management
async function handleStats(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  requestId: string
): Promise<void> {
  switch (req.method) {
    case 'GET':
      return await getStats(res, requestId);
    case 'PUT':
      return await updateStats(req, res, requestId);
    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).json({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: `Method ${req.method} not allowed for stats. Allowed methods: GET, PUT`,
          instance: '/api/user?action=stats',
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId,
        }
      });
  }
}

async function getStats(res: NextApiResponse<ApiResponse>, requestId: string): Promise<void> {
  try {
    const profile = await Profile.findOne({}).lean() as ProfileData | null;
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'Profile not found',
          instance: '/api/user?action=stats',
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId,
        }
      });
    }

    const stats: StatsData = {
      level: profile.level || 1,
      exp: profile.exp || 0,
      gold: profile.gold || 0,
      keys: profile.keys || 0,
      streakCount: profile.streakCount || 0,
      lastLogin: profile.lastLogin,
    };

    return res.status(200).json({
      success: true,
      data: stats,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId,
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
}

async function updateStats(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  requestId: string
): Promise<void> {
  try {
    const updates = req.body as Partial<StatsData>;
    
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST_BODY',
          message: 'Request body must be a valid object with stat updates',
          instance: '/api/user?action=stats',
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId,
        }
      });
    }

    const profile = await Profile.findOne({});
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'Profile not found',
          instance: '/api/user?action=stats',
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId,
        }
      });
    }

    // Only allow specific stat updates with validation
    const allowedFields: (keyof StatsData)[] = ['level', 'exp', 'gold', 'keys', 'streakCount'];
    const validUpdates: Partial<ProfileData> = {};

    for (const field of allowedFields) {
      if (field in updates && updates[field] !== undefined) {
        const value = updates[field];
        
        // Validate numeric fields
        if (typeof value === 'number' && value >= 0) {
          (validUpdates as Record<string, unknown>)[field] = value;
        } else if (field === 'lastLogin' && value instanceof Date) {
          (validUpdates as Record<string, unknown>)[field] = value;
        } else {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_FIELD_VALUE',
              message: `Invalid value for field '${field}'. Must be a non-negative number.`,
              instance: '/api/user?action=stats',
              timestamp: new Date().toISOString(),
            },
            meta: {
              timestamp: new Date().toISOString(),
              version: 'v1',
              requestId,
            }
          });
        }
      }
    }

    if (Object.keys(validUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_VALID_UPDATES',
          message: 'No valid stat updates provided',
          details: [`Valid fields: ${allowedFields.join(', ')}`],
          instance: '/api/user?action=stats',
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId,
        }
      });
    }

    Object.assign(profile, validUpdates);
    await profile.save();

    return res.status(200).json({
      success: true,
      data: {
        message: 'Stats updated successfully',
        updatedFields: Object.keys(validUpdates),
        profile: profile.toObject(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId,
      }
    });
  } catch (error) {
    console.error('Error updating stats:', error);
    throw error;
  }
}

// Daily Login
async function handleDailyLogin(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  requestId: string
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method allowed for daily login',
        instance: '/api/user?action=daily-login',
        timestamp: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId,
      }
    });
  }

  try {
    const profile = await Profile.findOne({});
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'Profile not found',
          instance: '/api/user?action=daily-login',
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId,
        }
      });
    }

    const now = new Date();
    const today = now.toDateString();
    const lastLogin = profile.lastLogin ? new Date(profile.lastLogin).toDateString() : null;

    if (lastLogin === today) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'ALREADY_CLAIMED_TODAY',
          message: 'Daily login reward already claimed today',
          details: [`Last claimed: ${profile.lastLogin?.toISOString()}`],
          instance: '/api/user?action=daily-login',
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId,
        }
      });
    }

    // Calculate bonus based on streak
    const baseBonus: DailyLoginBonus = {
      gold: 100,
      exp: 50,
    };

    // Calculate streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();
    
    let newStreak: number;
    if (lastLogin === yesterdayString) {
      newStreak = (profile.streakCount || 0) + 1;
    } else {
      newStreak = 1;
    }

    // Bonus multiplier for longer streaks
    const streakMultiplier = Math.min(1 + (newStreak - 1) * 0.1, 2); // Max 2x multiplier
    const bonus: DailyLoginBonus = {
      gold: Math.floor(baseBonus.gold * streakMultiplier),
      exp: Math.floor(baseBonus.exp * streakMultiplier),
    };

    // Apply rewards
    profile.gold = (profile.gold || 0) + bonus.gold;
    profile.exp = (profile.exp || 0) + bonus.exp;
    profile.lastLogin = now;
    profile.streakCount = newStreak;

    await profile.save();

    const response: DailyLoginResponse = {
      bonus,
      streak: newStreak,
      consecutiveDays: newStreak,
      lastClaimAt: now,
      canClaimToday: false, // Just claimed
      profile: {
        gold: profile.gold,
        exp: profile.exp,
        level: profile.level || 1,
      }
    };

    return res.status(200).json({
      success: true,
      data: response,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId,
      }
    });
  } catch (error) {
    console.error('Error processing daily login:', error);
    throw error;
  }
}

// Authentication Login (placeholder for future implementation)
async function handleLogin(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  requestId: string
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method allowed for login',
        instance: '/api/user?action=login',
        timestamp: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId,
      }
    });
  }

  try {
    // Placeholder for future authentication implementation
    // In a real application, this would validate credentials
    
    return res.status(200).json({
      success: true,
      data: { 
        message: 'Login successful',
        // Future: return JWT token, user session, etc.
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId,
      }
    });
  } catch (error) {
    console.error('Error processing login:', error);
    throw error;
  }
}
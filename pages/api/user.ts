import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Profile from '@/models/Profile';

interface ApiResponse<T = any> {
  data?: T;
  meta?: {
    timestamp: string;
    version: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any[];
    instance: string;
    timestamp: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  await dbConnect();

  const { method, query } = req;
  const action = query.action as string;

  try {
    switch (action) {
      case 'profile':
        return handleProfile(req, res);
      case 'inventory':
        return handleInventory(req, res);
      case 'stats':
        return handleStats(req, res);
      case 'daily-login':
        return handleDailyLogin(req, res);
      case 'login':
        return handleLogin(req, res);
      default:
        return res.status(400).json({
          error: {
            code: 'INVALID_ACTION',
            message: `Invalid action: ${action}`,
            instance: '/api/user',
            timestamp: new Date().toISOString(),
          }
        });
    }
  } catch (error) {
    console.error('User API Error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
        instance: '/api/user',
        timestamp: new Date().toISOString(),
      }
    });
  }
}

// Profile Management
async function handleProfile(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return await getProfile(res);
    case 'PUT':
      return await updateProfile(req, res);
    case 'POST':
      return await createProfile(req, res);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'POST']);
      return res.status(405).json({
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: `Method ${method} not allowed for profile`,
          instance: '/api/user?action=profile',
          timestamp: new Date().toISOString(),
        }
      });
  }
}

async function getProfile(res: NextApiResponse<ApiResponse>) {
  const profile = await Profile.findOne({}).lean();
  
  if (!profile) {
    return res.status(404).json({
      error: {
        code: 'PROFILE_NOT_FOUND',
        message: 'Profile not found',
        instance: '/api/user?action=profile',
        timestamp: new Date().toISOString(),
      }
    });
  }

  return res.status(200).json({
    data: profile,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

async function updateProfile(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const updates = req.body;
  
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({
      error: {
        code: 'INVALID_REQUEST_BODY',
        message: 'Request body must be a valid object',
        instance: '/api/user?action=profile',
        timestamp: new Date().toISOString(),
      }
    });
  }

  const profile = await Profile.findOne({});
  
  if (!profile) {
    return res.status(404).json({
      error: {
        code: 'PROFILE_NOT_FOUND',
        message: 'Profile not found',
        instance: '/api/user?action=profile',
        timestamp: new Date().toISOString(),
      }
    });
  }

  Object.assign(profile, updates);
  await profile.save();

  return res.status(200).json({
    data: profile,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

async function createProfile(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const profileData = req.body;
  
  const existingProfile = await Profile.findOne({});
  if (existingProfile) {
    return res.status(409).json({
      error: {
        code: 'PROFILE_ALREADY_EXISTS',
        message: 'Profile already exists',
        instance: '/api/user?action=profile',
        timestamp: new Date().toISOString(),
      }
    });
  }

  const profile = new Profile(profileData);
  await profile.save();

  return res.status(201).json({
    data: profile,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

// Inventory Management
async function handleInventory(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { method, query } = req;
  const itemId = query.item as string;

  switch (method) {
    case 'GET':
      return await getInventory(res);
    case 'PUT':
      if (!itemId) {
        return res.status(400).json({
          error: {
            code: 'MISSING_ITEM_ID',
            message: 'Item ID is required for inventory operations',
            instance: '/api/user?action=inventory',
            timestamp: new Date().toISOString(),
          }
        });
      }
      return await useInventoryItem(itemId, res);
    case 'POST':
      return await addInventoryItem(req, res);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'POST']);
      return res.status(405).json({
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: `Method ${method} not allowed for inventory`,
          instance: '/api/user?action=inventory',
          timestamp: new Date().toISOString(),
        }
      });
  }
}

async function getInventory(res: NextApiResponse<ApiResponse>) {
  const profile = await Profile.findOne({}).lean();
  
  if (!profile) {
    return res.status(404).json({
      error: {
        code: 'PROFILE_NOT_FOUND',
        message: 'Profile not found',
        instance: '/api/user?action=inventory',
        timestamp: new Date().toISOString(),
      }
    });
  }

  return res.status(200).json({
    data: profile.inventory || [],
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

async function useInventoryItem(itemId: string, res: NextApiResponse<ApiResponse>) {
  const profile = await Profile.findOne({});
  
  if (!profile) {
    return res.status(404).json({
      error: {
        code: 'PROFILE_NOT_FOUND',
        message: 'Profile not found',
        instance: '/api/user?action=inventory',
        timestamp: new Date().toISOString(),
      }
    });
  }

  const itemIndex = profile.inventory?.findIndex(item => item._id.toString() === itemId);
  
  if (itemIndex === -1 || itemIndex === undefined) {
    return res.status(404).json({
      error: {
        code: 'ITEM_NOT_FOUND',
        message: 'Item not found in inventory',
        instance: '/api/user?action=inventory',
        timestamp: new Date().toISOString(),
      }
    });
  }

  const item = profile.inventory![itemIndex];
  
  // Use item logic here (reduce quantity or remove)
  if (item.quantity <= 1) {
    profile.inventory!.splice(itemIndex, 1);
  } else {
    profile.inventory![itemIndex].quantity -= 1;
  }

  await profile.save();

  return res.status(200).json({
    data: { message: 'Item used successfully' },
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

async function addInventoryItem(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const itemData = req.body;
  const profile = await Profile.findOne({});
  
  if (!profile) {
    return res.status(404).json({
      error: {
        code: 'PROFILE_NOT_FOUND',
        message: 'Profile not found',
        instance: '/api/user?action=inventory',
        timestamp: new Date().toISOString(),
      }
    });
  }

  if (!profile.inventory) {
    profile.inventory = [];
  }

  profile.inventory.push(itemData);
  await profile.save();

  return res.status(201).json({
    data: profile.inventory,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

// Stats Management
async function handleStats(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return await getStats(res);
    case 'PUT':
      return await updateStats(req, res);
    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).json({
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: `Method ${method} not allowed for stats`,
          instance: '/api/user?action=stats',
          timestamp: new Date().toISOString(),
        }
      });
  }
}

async function getStats(res: NextApiResponse<ApiResponse>) {
  const profile = await Profile.findOne({}).lean();
  
  if (!profile) {
    return res.status(404).json({
      error: {
        code: 'PROFILE_NOT_FOUND',
        message: 'Profile not found',
        instance: '/api/user?action=stats',
        timestamp: new Date().toISOString(),
      }
    });
  }

  const stats = {
    level: profile.level,
    exp: profile.exp,
    gold: profile.gold,
    keys: profile.keys,
    streakCount: profile.streakCount,
    lastLogin: profile.lastLogin,
  };

  return res.status(200).json({
    data: stats,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

async function updateStats(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const updates = req.body;
  const profile = await Profile.findOne({});
  
  if (!profile) {
    return res.status(404).json({
      error: {
        code: 'PROFILE_NOT_FOUND',
        message: 'Profile not found',
        instance: '/api/user?action=stats',
        timestamp: new Date().toISOString(),
      }
    });
  }

  // Only allow stat updates
  const allowedFields = ['level', 'exp', 'gold', 'keys', 'streakCount'];
  const filteredUpdates = Object.keys(updates)
    .filter(key => allowedFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = updates[key];
      return obj;
    }, {} as any);

  Object.assign(profile, filteredUpdates);
  await profile.save();

  return res.status(200).json({
    data: profile,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

// Daily Login
async function handleDailyLogin(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method allowed for daily login',
        instance: '/api/user?action=daily-login',
        timestamp: new Date().toISOString(),
      }
    });
  }

  const profile = await Profile.findOne({});
  
  if (!profile) {
    return res.status(404).json({
      error: {
        code: 'PROFILE_NOT_FOUND',
        message: 'Profile not found',
        instance: '/api/user?action=daily-login',
        timestamp: new Date().toISOString(),
      }
    });
  }

  const today = new Date().toDateString();
  const lastLogin = profile.lastLogin ? new Date(profile.lastLogin).toDateString() : null;

  if (lastLogin === today) {
    return res.status(409).json({
      error: {
        code: 'ALREADY_CLAIMED_TODAY',
        message: 'Daily login already claimed today',
        instance: '/api/user?action=daily-login',
        timestamp: new Date().toISOString(),
      }
    });
  }

  // Award daily login bonus
  const bonus = {
    gold: 100,
    exp: 50,
  };

  profile.gold += bonus.gold;
  profile.exp += bonus.exp;
  profile.lastLogin = new Date();
  
  // Update streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toDateString();
  
  if (lastLogin === yesterdayString) {
    profile.streakCount += 1;
  } else {
    profile.streakCount = 1;
  }

  await profile.save();

  return res.status(200).json({
    data: {
      bonus,
      streak: profile.streakCount,
      profile: {
        gold: profile.gold,
        exp: profile.exp,
        level: profile.level,
      }
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

// Login (placeholder for future authentication)
async function handleLogin(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method allowed for login',
        instance: '/api/user?action=login',
        timestamp: new Date().toISOString(),
      }
    });
  }

  // Simple login logic - in real app would validate credentials
  return res.status(200).json({
    data: { message: 'Login successful' },
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}
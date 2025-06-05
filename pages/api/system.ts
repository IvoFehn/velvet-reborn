import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Mood from '@/models/Mood';
import MoodBaseDate from '@/models/MoodBaseDate';
import MoodOverride from '@/models/MoodOverride';
import Warning from '@/models/Warning';
import Sanction from '@/models/Sanction';

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
  const module = query.module as string;
  const action = query.action as string;

  try {
    switch (module) {
      case 'mood':
        return handleMood(req, res);
      case 'warnings':
        return handleWarnings(req, res);
      case 'config':
        return handleConfig(req, res);
      default:
        if (action) {
          return handleSystemActions(req, res);
        }
        return res.status(400).json({
          error: {
            code: 'INVALID_MODULE',
            message: `Invalid system module: ${module}`,
            instance: '/api/system',
            timestamp: new Date().toISOString(),
          }
        });
    }
  } catch (error) {
    console.error('System API Error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
        instance: '/api/system',
        timestamp: new Date().toISOString(),
      }
    });
  }
}

// Mood Management
async function handleMood(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { method, query } = req;
  const action = query.action as string;

  switch (action) {
    case 'current':
      return await getCurrentMood(res);
    case 'submit':
      return await submitMood(req, res);
    case 'reset':
      return await resetMood(res);
    case 'override':
      return await overrideMood(req, res);
    case 'status':
      return await getMoodStatus(res);
    default:
      if (method === 'GET') {
        return await getMoodHistory(req, res);
      } else if (method === 'POST') {
        return await submitMood(req, res);
      }
      
      return res.status(400).json({
        error: {
          code: 'INVALID_MOOD_ACTION',
          message: `Invalid mood action: ${action}`,
          instance: '/api/system?module=mood',
          timestamp: new Date().toISOString(),
        }
      });
  }
}

async function getCurrentMood(res: NextApiResponse<ApiResponse>) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentMood = await Mood.findOne({
    date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
    }
  }).lean();

  if (!currentMood) {
    return res.status(404).json({
      error: {
        code: 'NO_MOOD_TODAY',
        message: 'No mood entry for today',
        instance: '/api/system?module=mood&action=current',
        timestamp: new Date().toISOString(),
      }
    });
  }

  return res.status(200).json({
    data: currentMood,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

async function submitMood(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method allowed for mood submission',
        instance: '/api/system?module=mood&action=submit',
        timestamp: new Date().toISOString(),
      }
    });
  }

  const { level, note } = req.body;

  if (typeof level !== 'number' || level < 1 || level > 10) {
    return res.status(400).json({
      error: {
        code: 'INVALID_MOOD_LEVEL',
        message: 'Mood level must be a number between 1 and 10',
        instance: '/api/system?module=mood&action=submit',
        timestamp: new Date().toISOString(),
      }
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if mood already exists for today
  const existingMood = await Mood.findOne({
    date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
    }
  });

  if (existingMood) {
    // Update existing mood
    existingMood.level = level;
    if (note) existingMood.note = note;
    existingMood.submittedAt = new Date();
    await existingMood.save();

    return res.status(200).json({
      data: existingMood,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      }
    });
  } else {
    // Create new mood entry
    const mood = new Mood({
      date: today,
      level,
      note: note || '',
      submittedAt: new Date(),
    });
    await mood.save();

    return res.status(201).json({
      data: mood,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      }
    });
  }
}

async function getMoodHistory(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { startDate, endDate, limit = '30' } = req.query;

  const filter: any = {};
  
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate as string);
    if (endDate) filter.date.$lte = new Date(endDate as string);
  }

  const moods = await Mood.find(filter)
    .sort({ date: -1 })
    .limit(parseInt(limit as string))
    .lean();

  return res.status(200).json({
    data: moods,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

async function resetMood(res: NextApiResponse<ApiResponse>) {
  // Admin function to reset mood system
  await Promise.all([
    Mood.deleteMany({}),
    MoodBaseDate.deleteMany({}),
    MoodOverride.deleteMany({})
  ]);

  return res.status(200).json({
    data: { message: 'Mood system reset successfully' },
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

async function overrideMood(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method allowed for mood override',
        instance: '/api/system?module=mood&action=override',
        timestamp: new Date().toISOString(),
      }
    });
  }

  const { level, reason } = req.body;

  const override = new MoodOverride({
    level,
    reason: reason || 'Admin override',
    date: new Date(),
  });
  await override.save();

  return res.status(201).json({
    data: override,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

async function getMoodStatus(res: NextApiResponse<ApiResponse>) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentMood, override, weeklyAverage] = await Promise.all([
    Mood.findOne({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }).lean(),
    MoodOverride.findOne().sort({ date: -1 }).lean(),
    Mood.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: null,
          averageLevel: { $avg: '$level' },
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  const status = {
    today: currentMood,
    override: override,
    weeklyAverage: weeklyAverage[0] || { averageLevel: null, count: 0 },
    hasSubmittedToday: !!currentMood,
  };

  return res.status(200).json({
    data: status,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

// Warnings Management
async function handleWarnings(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { method, query } = req;
  const action = query.action as string;
  const id = query.id as string;

  switch (method) {
    case 'GET':
      return await getWarnings(res);
    case 'POST':
      if (action === 'create') {
        return await createWarning(req, res);
      }
      break;
    case 'PUT':
      if (action === 'acknowledge' && id) {
        return await acknowledgeWarning(id, res);
      }
      break;
  }

  return res.status(400).json({
    error: {
      code: 'INVALID_WARNINGS_REQUEST',
      message: 'Invalid warnings request',
      instance: '/api/system?module=warnings',
      timestamp: new Date().toISOString(),
    }
  });
}

async function getWarnings(res: NextApiResponse<ApiResponse>) {
  const warnings = await Warning.find({ acknowledged: false })
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json({
    data: warnings,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

async function createWarning(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { title, message, severity = 'medium', expiresAt } = req.body;

  if (!title || !message) {
    return res.status(400).json({
      error: {
        code: 'MISSING_REQUIRED_FIELDS',
        message: 'Title and message are required',
        instance: '/api/system?module=warnings&action=create',
        timestamp: new Date().toISOString(),
      }
    });
  }

  const warning = new Warning({
    title,
    message,
    severity,
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    acknowledged: false,
  });
  await warning.save();

  return res.status(201).json({
    data: warning,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

async function acknowledgeWarning(id: string, res: NextApiResponse<ApiResponse>) {
  const warning = await Warning.findByIdAndUpdate(
    id,
    { acknowledged: true, acknowledgedAt: new Date() },
    { new: true }
  );

  if (!warning) {
    return res.status(404).json({
      error: {
        code: 'WARNING_NOT_FOUND',
        message: 'Warning not found',
        instance: '/api/system?module=warnings&action=acknowledge',
        timestamp: new Date().toISOString(),
      }
    });
  }

  return res.status(200).json({
    data: warning,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

// Configuration Management
async function handleConfig(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { method, query } = req;
  const type = query.type as string;

  // Placeholder for configuration management
  const configs = {
    thresholds: {
      level1: 100,
      level2: 250,
      level3: 500,
      level4: 1000,
      level5: 2000,
    },
    weights: {
      obedience: 1.0,
      performance: 1.2,
      creativity: 1.1,
    }
  };

  switch (method) {
    case 'GET':
      return res.status(200).json({
        data: configs[type as keyof typeof configs] || configs,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
        }
      });

    case 'PUT':
      // In real implementation, would save to database
      const updatedConfig = { ...configs[type as keyof typeof configs], ...req.body };
      return res.status(200).json({
        data: updatedConfig,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
        }
      });

    default:
      return res.status(405).json({
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: `Method ${method} not allowed for config`,
          instance: '/api/system?module=config',
          timestamp: new Date().toISOString(),
        }
      });
  }
}

// System Actions (bulk operations, checks, etc.)
async function handleSystemActions(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { method, query } = req;
  const action = query.action as string;
  const type = query.type as string;

  if (method !== 'POST') {
    return res.status(405).json({
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method allowed for system actions',
        instance: '/api/system',
        timestamp: new Date().toISOString(),
      }
    });
  }

  switch (action) {
    case 'bulk-complete':
      if (type === 'sanctions') {
        return await bulkCompleteSanctions(res);
      }
      break;
    case 'check':
      if (type === 'sanctions') {
        return await checkSanctions(res);
      }
      break;
    default:
      return res.status(400).json({
        error: {
          code: 'INVALID_SYSTEM_ACTION',
          message: `Invalid system action: ${action}`,
          instance: '/api/system',
          timestamp: new Date().toISOString(),
        }
      });
  }

  return res.status(400).json({
    error: {
      code: 'INVALID_SYSTEM_REQUEST',
      message: 'Invalid system request',
      instance: '/api/system',
      timestamp: new Date().toISOString(),
    }
  });
}

async function bulkCompleteSanctions(res: NextApiResponse<ApiResponse>) {
  const result = await Sanction.updateMany(
    { status: 'offen' },
    { status: 'erledigt', completedAt: new Date() }
  );

  return res.status(200).json({
    data: {
      completed: result.modifiedCount,
      matched: result.matchedCount
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

async function checkSanctions(res: NextApiResponse<ApiResponse>) {
  const now = new Date();
  
  // Find expired sanctions
  const expiredSanctions = await Sanction.find({
    status: 'offen',
    deadline: { $lt: now }
  });

  let escalatedCount = 0;

  // Escalate expired sanctions
  for (const sanction of expiredSanctions) {
    sanction.status = 'eskaliert';
    sanction.escalationCount += 1;
    sanction.amount *= sanction.escalationFactor;
    sanction.deadline = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // +2 days
    await sanction.save();
    escalatedCount++;
  }

  return res.status(200).json({
    data: {
      escalatedCount,
      totalChecked: expiredSanctions.length
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Mood from '@/models/Mood';
import MoodBaseDate from '@/models/MoodBaseDate';
import MoodOverride from '@/models/MoodOverride';
import Warning from '@/models/Warning';
import Sanction from '@/models/Sanction';
import Generator from '@/models/Generator';

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

// Type definitions for better type safety
interface MoodData {
  _id: string;
  date: Date;
  level: number;
  note?: string;
  submittedAt: Date;
}

interface MoodSubmissionPayload {
  level: number;
  note?: string;
}

interface MoodOverridePayload {
  level: number;
  reason?: string;
}

interface MoodStatus {
  generator: GeneratorData | null;
  calculatedLevel: number;
  effectiveLevel: number;
  moodOverride: {
    active: boolean;
    level: number;
    expiresAt: Date | null;
  } | null;
  thresholds: {
    level1: number;
    level2: number;
    level3: number;
    level4: number;
  };
}

interface GeneratorData {
  _id: string;
  status: string;
  createdAt: Date;
  [key: string]: unknown;
}

interface WarningData {
  _id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  expiresAt?: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  createdAt: Date;
}

interface WarningCreationPayload {
  title: string;
  message: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  expiresAt?: string;
}

interface SanctionBulkResult {
  completed: number;
  matched: number;
}

interface SanctionCheckResult {
  escalatedCount: number;
  totalChecked: number;
}

interface ConfigData {
  thresholds: {
    level1: number;
    level2: number;
    level3: number;
    level4: number;
    level5: number;
  };
  weights: {
    obedience: number;
    performance: number;
    creativity: number;
  };
}

type SystemModuleType = 'mood' | 'warnings' | 'config';
type SystemActionType = 'bulk-complete' | 'check';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
): Promise<void> {
  await dbConnect();

  const { query } = req;
  const systemModule = query.module as SystemModuleType;
  const action = query.action as string;

  // Generate request ID for tracing
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    switch (systemModule) {
      case 'mood':
        return await handleMood(req, res, requestId);
      case 'warnings':
        return await handleWarnings(req, res, requestId);
      case 'config':
        return await handleConfig(req, res, requestId);
      default:
        if (action) {
          return await handleSystemActions(req, res, requestId);
        }
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_MODULE',
            message: `Invalid system module: ${systemModule}. Valid modules: mood, warnings, config`,
            instance: '/api/system',
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
    console.error('System API Error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? [error instanceof Error ? error.message : String(error)] : undefined,
        instance: '/api/system',
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

// Mood Management
async function handleMood(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  requestId: string
): Promise<void> {
  const { query } = req;
  const action = query.action as string;

  switch (action) {
    case 'current':
      return await getCurrentMood(res, requestId);
    case 'submit':
      return await submitMood(req, res, requestId);
    case 'reset':
      return await resetMood(res, requestId);
    case 'override':
      return await overrideMood(req, res, requestId);
    case 'status':
      return await getMoodStatus(res, requestId);
    default:
      if (req.method === 'GET') {
        return await getMoodHistory(req, res, requestId);
      } else if (req.method === 'POST') {
        return await submitMood(req, res, requestId);
      }
      
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_MOOD_ACTION',
          message: `Invalid mood action: ${action}. Valid actions: current, submit, reset, override, status`,
          instance: '/api/system?module=mood',
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

async function getCurrentMood(res: NextApiResponse<ApiResponse>, requestId: string): Promise<void> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentMood = await Mood.findOne({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }).lean() as MoodData | null;

    if (!currentMood) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NO_MOOD_TODAY',
          message: 'No mood entry found for today',
          instance: '/api/system?module=mood&action=current',
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
      data: currentMood,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId,
      }
    });
  } catch (error) {
    console.error('Error fetching current mood:', error);
    throw error;
  }
}

async function submitMood(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  requestId: string
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method allowed for mood submission',
        instance: '/api/system?module=mood&action=submit',
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
    const { level, note } = req.body as MoodSubmissionPayload;

    // Validate mood level
    if (typeof level !== 'number' || level < 1 || level > 10) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_MOOD_LEVEL',
          message: 'Mood level must be a number between 1 and 10',
          details: [`Received: ${level} (${typeof level})`],
          instance: '/api/system?module=mood&action=submit',
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId,
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
        success: true,
        data: {
          message: 'Mood updated successfully',
          mood: existingMood.toObject(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId,
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
        success: true,
        data: {
          message: 'Mood submitted successfully',
          mood: mood.toObject(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId,
        }
      });
    }
  } catch (error) {
    console.error('Error submitting mood:', error);
    throw error;
  }
}

async function getMoodHistory(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  requestId: string
): Promise<void> {
  try {
    const { startDate, endDate, limit = '30' } = req.query;

    const filter: Record<string, unknown> = {};
    
    if (startDate || endDate) {
      const dateFilter: { $gte?: Date, $lte?: Date } = {};
      if (startDate) {
        dateFilter.$gte = new Date(startDate as string);
      }
      if (endDate) {
        dateFilter.$lte = new Date(endDate as string);
      }
      filter.date = dateFilter;
    }

    const parsedLimit = parseInt(limit as string, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 365) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_LIMIT',
          message: 'Limit must be a number between 1 and 365',
          instance: '/api/system?module=mood',
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId,
        }
      });
    }

    const moods = await Mood.find(filter)
      .sort({ date: -1 })
      .limit(parsedLimit)
      .lean() as unknown as MoodData[];

    return res.status(200).json({
      success: true,
      data: {
        moods,
        count: moods.length,
        filter: {
          startDate,
          endDate,
          limit: parsedLimit,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId,
      }
    });
  } catch (error) {
    console.error('Error fetching mood history:', error);
    throw error;
  }
}

async function resetMood(res: NextApiResponse<ApiResponse>, requestId: string): Promise<void> {
  try {
    // Admin function to reset mood system
    const results = await Promise.all([
      Mood.deleteMany({}),
      MoodBaseDate.deleteMany({}),
      MoodOverride.deleteMany({})
    ]);

    const totalDeleted = results.reduce((sum, result) => sum + result.deletedCount, 0);

    return res.status(200).json({
      success: true,
      data: { 
        message: 'Mood system reset successfully',
        deletedCount: {
          moods: results[0].deletedCount,
          baseDates: results[1].deletedCount,
          overrides: results[2].deletedCount,
          total: totalDeleted,
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId,
      }
    });
  } catch (error) {
    console.error('Error resetting mood system:', error);
    throw error;
  }
}

async function overrideMood(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  requestId: string
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method allowed for mood override',
        instance: '/api/system?module=mood&action=override',
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
    const { level, reason } = req.body as MoodOverridePayload;

    if (typeof level !== 'number' || level < 0 || level > 10) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_OVERRIDE_LEVEL',
          message: 'Override level must be a number between 0 and 10',
          instance: '/api/system?module=mood&action=override',
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId,
        }
      });
    }

    const override = new MoodOverride({
      level,
      reason: reason || 'Admin override',
      date: new Date(),
    });
    await override.save();

    return res.status(201).json({
      success: true,
      data: {
        message: 'Mood override created successfully',
        override: override.toObject(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId,
      }
    });
  } catch (error) {
    console.error('Error creating mood override:', error);
    throw error;
  }
}

async function getMoodStatus(res: NextApiResponse<ApiResponse>, requestId: string): Promise<void> {
  try {
    // Get latest generator with proper ES6 import (no more require!)
    const latestGenerator = await Generator.findOne({ status: { $ne: 'DONE' } })
      .sort({ createdAt: -1 })
      .lean() as GeneratorData | null;

    // Get mood override
    const moodOverride = await MoodOverride.findOne()
      .sort({ date: -1 })
      .lean();

    // Calculate level based on generator age (simplified logic)
    let calculatedLevel = 0;
    let effectiveLevel = 0;

    if (latestGenerator) {
      const daysSinceCreated = Math.floor(
        (Date.now() - new Date(latestGenerator.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // Simple level calculation (0-4 scale)
      calculatedLevel = Math.min(4, Math.max(0, daysSinceCreated));
    }

    // Check for mood override
    if (moodOverride && typeof (moodOverride as unknown as { level: unknown }).level === 'number') {
      effectiveLevel = (moodOverride as unknown as { level: number }).level;
    } else {
      effectiveLevel = calculatedLevel;
    }

    const status: MoodStatus = {
      generator: latestGenerator,
      calculatedLevel,
      effectiveLevel,
      moodOverride: moodOverride ? {
        active: typeof (moodOverride as unknown as { level: unknown }).level === 'number',
        level: (moodOverride as unknown as { level: number }).level || 0,
        expiresAt: (moodOverride as unknown as { expiresAt: Date | null }).expiresAt || null
      } : null,
      thresholds: {
        level1: 1,
        level2: 2,
        level3: 3,
        level4: 4
      }
    };

    return res.status(200).json({
      success: true,
      data: status,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId,
      }
    });
  } catch (error) {
    console.error('Error fetching mood status:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'MOOD_STATUS_ERROR',
        message: 'Failed to retrieve mood status',
        details: process.env.NODE_ENV === 'development' ? [error instanceof Error ? error.message : String(error)] : undefined,
        instance: '/api/system?module=mood&action=status',
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

// Warnings Management
async function handleWarnings(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  requestId: string
): Promise<void> {
  const { query } = req;
  const action = query.action as string;
  const id = query.id as string;

  switch (req.method) {
    case 'GET':
      return await getWarnings(res, requestId);
    case 'POST':
      if (action === 'create') {
        return await createWarning(req, res, requestId);
      }
      break;
    case 'PUT':
      if (action === 'acknowledge' && id) {
        return await acknowledgeWarning(id, res, requestId);
      }
      break;
  }

  return res.status(400).json({
    success: false,
    error: {
      code: 'INVALID_WARNINGS_REQUEST',
      message: 'Invalid warnings request. Valid operations: GET (list), POST + action=create, PUT + action=acknowledge + id',
      instance: '/api/system?module=warnings',
      timestamp: new Date().toISOString(),
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
      requestId,
    }
  });
}

async function getWarnings(res: NextApiResponse<ApiResponse>, requestId: string): Promise<void> {
  try {
    const warnings = await Warning.find({ acknowledged: false })
      .sort({ createdAt: -1 })
      .lean() as unknown as WarningData[];

    return res.status(200).json({
      success: true,
      data: {
        warnings,
        count: warnings.length,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId,
      }
    });
  } catch (error) {
    console.error('Error fetching warnings:', error);
    throw error;
  }
}

async function createWarning(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  requestId: string
): Promise<void> {
  try {
    const { title, message, severity = 'medium', expiresAt } = req.body as WarningCreationPayload;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'Title and message are required for warning creation',
          details: [`Missing: ${!title ? 'title' : ''} ${!message ? 'message' : ''}`.trim()],
          instance: '/api/system?module=warnings&action=create',
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId,
        }
      });
    }

    // Validate severity
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (!validSeverities.includes(severity)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SEVERITY',
          message: `Invalid severity level. Valid options: ${validSeverities.join(', ')}`,
          instance: '/api/system?module=warnings&action=create',
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId,
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
      success: true,
      data: {
        message: 'Warning created successfully',
        warning: warning.toObject(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId,
      }
    });
  } catch (error) {
    console.error('Error creating warning:', error);
    throw error;
  }
}

async function acknowledgeWarning(
  id: string,
  res: NextApiResponse<ApiResponse>,
  requestId: string
): Promise<void> {
  try {
    const warning = await Warning.findByIdAndUpdate(
      id,
      { acknowledged: true, acknowledgedAt: new Date() },
      { new: true }
    );

    if (!warning) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'WARNING_NOT_FOUND',
          message: 'Warning not found',
          details: [`Warning ID: ${id}`],
          instance: '/api/system?module=warnings&action=acknowledge',
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
      data: {
        message: 'Warning acknowledged successfully',
        warning: warning.toObject(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId,
      }
    });
  } catch (error) {
    console.error('Error acknowledging warning:', error);
    throw error;
  }
}

// Configuration Management
async function handleConfig(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  requestId: string
): Promise<void> {
  const { query } = req;
  const configType = query.type as string;

  // Configuration data - in production this would come from database
  const configs: ConfigData = {
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

  try {
    switch (req.method) {
      case 'GET':
        const configData = configType && configType in configs 
          ? configs[configType as keyof ConfigData] 
          : configs;

        return res.status(200).json({
          success: true,
          data: configData,
          meta: {
            timestamp: new Date().toISOString(),
            version: 'v1',
            requestId,
          }
        });

      case 'PUT':
        if (!configType || !(configType in configs)) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_CONFIG_TYPE',
              message: `Invalid configuration type. Valid types: ${Object.keys(configs).join(', ')}`,
              instance: '/api/system?module=config',
              timestamp: new Date().toISOString(),
            },
            meta: {
              timestamp: new Date().toISOString(),
              version: 'v1',
              requestId,
            }
          });
        }

        // In real implementation, would validate and save to database
        const updatedConfig = { ...configs[configType as keyof ConfigData], ...req.body };
        
        return res.status(200).json({
          success: true,
          data: {
            message: `Configuration ${configType} updated successfully`,
            config: updatedConfig,
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: 'v1',
            requestId,
          }
        });

      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({
          success: false,
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: `Method ${req.method} not allowed for config. Allowed methods: GET, PUT`,
            instance: '/api/system?module=config',
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
    console.error('Error handling config:', error);
    throw error;
  }
}

// System Actions (bulk operations, checks, etc.)
async function handleSystemActions(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  requestId: string
): Promise<void> {
  const { query } = req;
  const action = query.action as SystemActionType;
  const type = query.type as string;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method allowed for system actions',
        instance: '/api/system',
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
    switch (action) {
      case 'bulk-complete':
        if (type === 'sanctions') {
          return await bulkCompleteSanctions(res, requestId);
        }
        break;
      case 'check':
        if (type === 'sanctions') {
          return await checkSanctions(res, requestId);
        }
        break;
      default:
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_SYSTEM_ACTION',
            message: `Invalid system action: ${action}. Valid actions: bulk-complete, check`,
            instance: '/api/system',
            timestamp: new Date().toISOString(),
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: 'v1',
            requestId,
          }
        });
    }

    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_SYSTEM_REQUEST',
        message: 'Invalid system request. Check action and type parameters.',
        instance: '/api/system',
        timestamp: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId,
      }
    });
  } catch (error) {
    console.error('Error handling system action:', error);
    throw error;
  }
}

async function bulkCompleteSanctions(
  res: NextApiResponse<ApiResponse>,
  requestId: string
): Promise<void> {
  try {
    const result = await Sanction.updateMany(
      { status: 'offen' },
      { status: 'erledigt', completedAt: new Date() }
    );

    const response: SanctionBulkResult = {
      completed: result.modifiedCount || 0,
      matched: result.matchedCount || 0
    };

    return res.status(200).json({
      success: true,
      data: {
        message: 'Bulk completion completed successfully',
        result: response,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId,
      }
    });
  } catch (error) {
    console.error('Error in bulk complete sanctions:', error);
    throw error;
  }
}

async function checkSanctions(
  res: NextApiResponse<ApiResponse>,
  requestId: string
): Promise<void> {
  try {
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
      sanction.escalationCount = (sanction.escalationCount || 0) + 1;
      sanction.amount *= sanction.escalationFactor || 1.5;
      sanction.deadline = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // +2 days
      await sanction.save();
      escalatedCount++;
    }

    const response: SanctionCheckResult = {
      escalatedCount,
      totalChecked: expiredSanctions.length
    };

    return res.status(200).json({
      success: true,
      data: {
        message: 'Sanction check completed successfully',
        result: response,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId,
      }
    });
  } catch (error) {
    console.error('Error checking sanctions:', error);
    throw error;
  }
}
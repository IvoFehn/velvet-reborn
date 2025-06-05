import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Sanction from '@/models/Sanction';
import Event from '@/models/Event';
import DailyTask from '@/models/DailyTask';
import News from '@/models/News';
import WikiPage from '@/models/WikiPage';
import Ticket from '@/models/Ticket';
import Survey from '@/models/Survey';
import QuickTask from '@/models/QuickTask';
import sanctionCatalog from '@/data/sanctionCatalog';
import { ISanctionCatalog } from '@/types/index.d';

interface ApiResponse<T = any> {
  data?: T;
  meta?: {
    timestamp: string;
    version: string;
    pagination?: {
      total: number;
      page: number;
      size: number;
      hasMore: boolean;
    };
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
  const type = query.type as string;

  try {
    switch (type) {
      case 'sanctions':
        return handleSanctions(req, res);
      case 'events':
        return handleEvents(req, res);
      case 'tasks':
        return handleTasks(req, res);
      case 'news':
        return handleNews(req, res);
      case 'wiki':
        return handleWiki(req, res);
      case 'tickets':
        return handleTickets(req, res);
      case 'survey':
        return handleSurvey(req, res);
      case 'quicktasks':
        return handleQuickTasks(req, res);
      default:
        return res.status(400).json({
          error: {
            code: 'INVALID_TYPE',
            message: `Invalid content type: ${type}`,
            instance: '/api/content',
            timestamp: new Date().toISOString(),
          }
        });
    }
  } catch (error) {
    console.error('Content API Error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
        instance: '/api/content',
        timestamp: new Date().toISOString(),
      }
    });
  }
}

// Sanctions Management
async function handleSanctions(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { method, query } = req;
  const action = query.action as string;
  const id = query.id as string;

  switch (method) {
    case 'GET':
      return await getSanctions(req, res);
    case 'POST':
      return await createSanction(req, res);
    case 'PUT':
      if (action === 'complete') {
        return await completeSanction(id, res);
      } else if (action === 'escalate') {
        return await escalateSanction(id, res);
      } else if (id) {
        return await updateSanction(id, req, res);
      }
      break;
    case 'DELETE':
      if (id) {
        return await deleteSanction(id, res);
      }
      break;
  }

  return res.status(400).json({
    error: {
      code: 'INVALID_SANCTIONS_REQUEST',
      message: 'Invalid sanctions request',
      instance: '/api/content?type=sanctions',
      timestamp: new Date().toISOString(),
    }
  });
}

async function getSanctions(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { status, category, severity, page = '1', size = '20' } = req.query;

  const filter: any = {};
  if (status && status !== 'all') filter.status = status;
  if (category) filter.category = category;
  if (severity) filter.severity = parseInt(severity as string);

  const pageNum = Math.max(1, parseInt(page as string));
  const pageSize = Math.min(100, Math.max(1, parseInt(size as string)));
  const skip = (pageNum - 1) * pageSize;

  const [sanctions, total] = await Promise.all([
    Sanction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
    Sanction.countDocuments(filter)
  ]);

  return res.status(200).json({
    data: sanctions,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
      pagination: {
        total,
        page: pageNum,
        size: pageSize,
        hasMore: skip + pageSize < total
      }
    }
  });
}

async function createSanction(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { createType, severity, template, reason, deadlineDays = 2 } = req.body;

  let sanctionData;

  if (createType === 'random') {
    const severityLevel = severity || 3;
    const templates = (sanctionCatalog as ISanctionCatalog)[severityLevel as keyof ISanctionCatalog];
    
    if (!templates || templates.length === 0) {
      return res.status(400).json({
        error: {
          code: 'INVALID_SEVERITY_LEVEL',
          message: `No templates found for severity level ${severityLevel}`,
          instance: '/api/content?type=sanctions',
          timestamp: new Date().toISOString(),
        }
      });
    }

    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    sanctionData = {
      title: randomTemplate.title,
      description: randomTemplate.description,
      task: randomTemplate.task,
      severity: severityLevel,
      amount: randomTemplate.amount,
      unit: randomTemplate.unit,
      category: randomTemplate.category,
      escalationFactor: randomTemplate.escalationFactor,
      status: 'offen',
      deadline: new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000),
      escalationCount: 0,
      reason: reason || undefined,
    };
  } else {
    sanctionData = {
      ...template,
      severity: severity || 3,
      status: 'offen',
      deadline: new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000),
      escalationCount: 0,
      reason: reason || undefined,
    };
  }

  const sanction = new Sanction(sanctionData);
  await sanction.save();

  return res.status(201).json({
    data: sanction,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

async function completeSanction(id: string, res: NextApiResponse<ApiResponse>) {
  const sanction = await Sanction.findById(id);
  
  if (!sanction) {
    return res.status(404).json({
      error: {
        code: 'SANCTION_NOT_FOUND',
        message: 'Sanction not found',
        instance: '/api/content?type=sanctions',
        timestamp: new Date().toISOString(),
      }
    });
  }

  sanction.status = 'erledigt';
  await sanction.save();

  return res.status(200).json({
    data: sanction,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

async function escalateSanction(id: string, res: NextApiResponse<ApiResponse>) {
  const sanction = await Sanction.findById(id);
  
  if (!sanction) {
    return res.status(404).json({
      error: {
        code: 'SANCTION_NOT_FOUND',
        message: 'Sanction not found',
        instance: '/api/content?type=sanctions',
        timestamp: new Date().toISOString(),
      }
    });
  }

  sanction.status = 'eskaliert';
  sanction.escalationCount += 1;
  sanction.amount *= sanction.escalationFactor;
  await sanction.save();

  return res.status(200).json({
    data: sanction,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

async function updateSanction(id: string, req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const updates = req.body;
  const sanction = await Sanction.findByIdAndUpdate(id, updates, { new: true });
  
  if (!sanction) {
    return res.status(404).json({
      error: {
        code: 'SANCTION_NOT_FOUND',
        message: 'Sanction not found',
        instance: '/api/content?type=sanctions',
        timestamp: new Date().toISOString(),
      }
    });
  }

  return res.status(200).json({
    data: sanction,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

async function deleteSanction(id: string, res: NextApiResponse<ApiResponse>) {
  const sanction = await Sanction.findByIdAndDelete(id);
  
  if (!sanction) {
    return res.status(404).json({
      error: {
        code: 'SANCTION_NOT_FOUND',
        message: 'Sanction not found',
        instance: '/api/content?type=sanctions',
        timestamp: new Date().toISOString(),
      }
    });
  }

  return res.status(204).end();
}

// Events Management
async function handleEvents(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { method, query } = req;
  const id = query.id as string;

  switch (method) {
    case 'GET':
      return id ? await getEvent(id, res) : await getEvents(req, res);
    case 'POST':
      return await createEvent(req, res);
    case 'PUT':
      if (id) return await updateEvent(id, req, res);
      break;
    case 'DELETE':
      if (id) return await deleteEvent(id, res);
      break;
  }

  return res.status(400).json({
    error: {
      code: 'INVALID_EVENTS_REQUEST',
      message: 'Invalid events request',
      instance: '/api/content?type=events',
      timestamp: new Date().toISOString(),
    }
  });
}

async function getEvents(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { active, type, from, to } = req.query;

  const filter: any = {};
  if (active !== undefined) filter.isActive = active === 'true';
  if (type) filter.type = type;

  const events = await Event.find(filter).sort({ startDate: -1 }).lean();

  return res.status(200).json({
    data: events,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

async function getEvent(id: string, res: NextApiResponse<ApiResponse>) {
  const event = await Event.findById(id).lean();
  
  if (!event) {
    return res.status(404).json({
      error: {
        code: 'EVENT_NOT_FOUND',
        message: 'Event not found',
        instance: '/api/content?type=events',
        timestamp: new Date().toISOString(),
      }
    });
  }

  return res.status(200).json({
    data: event,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

async function createEvent(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const eventData = req.body;
  const event = new Event(eventData);
  await event.save();

  return res.status(201).json({
    data: event,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

async function updateEvent(id: string, req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const updates = req.body;
  const event = await Event.findByIdAndUpdate(id, updates, { new: true });
  
  if (!event) {
    return res.status(404).json({
      error: {
        code: 'EVENT_NOT_FOUND',
        message: 'Event not found',
        instance: '/api/content?type=events',
        timestamp: new Date().toISOString(),
      }
    });
  }

  return res.status(200).json({
    data: event,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

async function deleteEvent(id: string, res: NextApiResponse<ApiResponse>) {
  const event = await Event.findByIdAndDelete(id);
  
  if (!event) {
    return res.status(404).json({
      error: {
        code: 'EVENT_NOT_FOUND',
        message: 'Event not found',
        instance: '/api/content?type=events',
        timestamp: new Date().toISOString(),
      }
    });
  }

  return res.status(204).end();
}

// Tasks Management
async function handleTasks(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { method, query } = req;
  const action = query.action as string;
  const id = query.id as string;

  switch (method) {
    case 'GET':
      return await getTasks(req, res);
    case 'POST':
      return await createTask(req, res);
    case 'PUT':
      if (action === 'toggle' && id) {
        return await toggleTask(id, res);
      } else if (id) {
        return await updateTask(id, req, res);
      }
      break;
    case 'DELETE':
      if (id) return await deleteTask(id, res);
      break;
  }

  return res.status(400).json({
    error: {
      code: 'INVALID_TASKS_REQUEST',
      message: 'Invalid tasks request',
      instance: '/api/content?type=tasks',
      timestamp: new Date().toISOString(),
    }
  });
}

async function getTasks(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { completed, type, difficulty } = req.query;

  const filter: any = {};
  if (completed !== undefined) filter.completed = completed === 'true';
  if (type) filter.type = type;
  if (difficulty) filter.difficulty = parseInt(difficulty as string);

  const tasks = await DailyTask.find(filter).sort({ createdAt: -1 }).lean();

  return res.status(200).json({
    data: tasks,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

async function createTask(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const taskData = req.body;
  const task = new DailyTask({
    ...taskData,
    completed: false,
    goldReward: taskData.goldReward || taskData.difficulty * 10,
    expReward: taskData.expReward || taskData.difficulty * 5,
  });
  await task.save();

  return res.status(201).json({
    data: task,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

async function toggleTask(id: string, res: NextApiResponse<ApiResponse>) {
  const task = await DailyTask.findById(id);
  
  if (!task) {
    return res.status(404).json({
      error: {
        code: 'TASK_NOT_FOUND',
        message: 'Task not found',
        instance: '/api/content?type=tasks',
        timestamp: new Date().toISOString(),
      }
    });
  }

  task.completed = !task.completed;
  await task.save();

  return res.status(200).json({
    data: task,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

async function updateTask(id: string, req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const updates = req.body;
  const task = await DailyTask.findByIdAndUpdate(id, updates, { new: true });
  
  if (!task) {
    return res.status(404).json({
      error: {
        code: 'TASK_NOT_FOUND',
        message: 'Task not found',
        instance: '/api/content?type=tasks',
        timestamp: new Date().toISOString(),
      }
    });
  }

  return res.status(200).json({
    data: task,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

async function deleteTask(id: string, res: NextApiResponse<ApiResponse>) {
  const task = await DailyTask.findByIdAndDelete(id);
  
  if (!task) {
    return res.status(404).json({
      error: {
        code: 'TASK_NOT_FOUND',
        message: 'Task not found',
        instance: '/api/content?type=tasks',
        timestamp: new Date().toISOString(),
      }
    });
  }

  return res.status(204).end();
}

// News Management (simplified placeholders for other content types)
async function handleNews(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { method } = req;

  switch (method) {
    case 'GET':
      const news = await News.find({}).sort({ createdAt: -1 }).lean();
      return res.status(200).json({
        data: news,
        meta: { timestamp: new Date().toISOString(), version: 'v1' }
      });
    case 'POST':
      const newNews = new News(req.body);
      await newNews.save();
      return res.status(201).json({
        data: newNews,
        meta: { timestamp: new Date().toISOString(), version: 'v1' }
      });
    default:
      return res.status(405).json({
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: `Method ${method} not allowed for news`,
          instance: '/api/content?type=news',
          timestamp: new Date().toISOString(),
        }
      });
  }
}

// Placeholder handlers for other content types
async function handleWiki(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  return res.status(200).json({
    data: { message: 'Wiki endpoint placeholder' },
    meta: { timestamp: new Date().toISOString(), version: 'v1' }
  });
}

async function handleTickets(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  return res.status(200).json({
    data: { message: 'Tickets endpoint placeholder' },
    meta: { timestamp: new Date().toISOString(), version: 'v1' }
  });
}

async function handleSurvey(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  return res.status(200).json({
    data: { message: 'Survey endpoint placeholder' },
    meta: { timestamp: new Date().toISOString(), version: 'v1' }
  });
}

async function handleQuickTasks(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  return res.status(200).json({
    data: { message: 'QuickTasks endpoint placeholder' },
    meta: { timestamp: new Date().toISOString(), version: 'v1' }
  });
}
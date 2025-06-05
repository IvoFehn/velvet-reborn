import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Profile from '@/models/Profile';
import Item from '@/models/Item';
import Lootbox from '@/models/Lootbox';
import LevelThresholds from '@/models/LevelThresholds';
import CoinBook from '@/models/CoinBook';
import CoinItem from '@/models/CoinItem';
import Generator from '@/models/Generator';

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
      case 'shop':
        return handleShop(req, res);
      case 'purchase':
        return handlePurchase(req, res);
      case 'coinbook':
        return handleCoinBook(req, res);
      case 'spin':
        return handleSpin(req, res);
      case 'lootbox':
        return handleLootbox(req, res);
      case 'levels':
        return handleLevels(req, res);
      case 'weights':
        return handleWeights(req, res);
      case 'generator':
        return handleGenerator(req, res);
      case 'items':
        return handleItems(req, res);
      default:
        return res.status(400).json({
          error: {
            code: 'INVALID_ACTION',
            message: `Invalid gaming action: ${action}`,
            instance: '/api/gaming',
            timestamp: new Date().toISOString(),
          }
        });
    }
  } catch (error) {
    console.error('Gaming API Error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
        instance: '/api/gaming',
        timestamp: new Date().toISOString(),
      }
    });
  }
}

// Shop Management
async function handleShop(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { method, query } = req;
  const category = query.category as string;

  if (method !== 'GET') {
    return res.status(405).json({
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only GET method allowed for shop',
        instance: '/api/gaming?action=shop',
        timestamp: new Date().toISOString(),
      }
    });
  }

  const filter: any = {};
  if (category) filter.category = category;

  const items = await Item.find(filter).lean();

  return res.status(200).json({
    data: items,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

// Purchase System
async function handlePurchase(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method allowed for purchase',
        instance: '/api/gaming?action=purchase',
        timestamp: new Date().toISOString(),
      }
    });
  }

  const { itemId, quantity = 1 } = req.body;

  if (!itemId) {
    return res.status(400).json({
      error: {
        code: 'MISSING_ITEM_ID',
        message: 'Item ID is required for purchase',
        instance: '/api/gaming?action=purchase',
        timestamp: new Date().toISOString(),
      }
    });
  }

  const [profile, item] = await Promise.all([
    Profile.findOne({}),
    Item.findById(itemId)
  ]);

  if (!profile) {
    return res.status(404).json({
      error: {
        code: 'PROFILE_NOT_FOUND',
        message: 'Profile not found',
        instance: '/api/gaming?action=purchase',
        timestamp: new Date().toISOString(),
      }
    });
  }

  if (!item) {
    return res.status(404).json({
      error: {
        code: 'ITEM_NOT_FOUND',
        message: 'Item not found',
        instance: '/api/gaming?action=purchase',
        timestamp: new Date().toISOString(),
      }
    });
  }

  const totalCost = item.price * quantity;

  if (profile.gold < totalCost) {
    return res.status(400).json({
      error: {
        code: 'INSUFFICIENT_GOLD',
        message: `Not enough gold. Required: ${totalCost}, Available: ${profile.gold}`,
        instance: '/api/gaming?action=purchase',
        timestamp: new Date().toISOString(),
      }
    });
  }

  // Deduct gold and add item to inventory
  profile.gold -= totalCost;
  
  if (!profile.inventory) profile.inventory = [];
  
  const existingItem = profile.inventory.find(invItem => invItem.item.toString() === itemId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    profile.inventory.push({
      item: item._id,
      quantity: quantity,
      acquiredAt: new Date()
    });
  }

  await profile.save();

  return res.status(200).json({
    data: {
      purchased: {
        item: item.name,
        quantity,
        totalCost
      },
      profile: {
        gold: profile.gold,
        inventory: profile.inventory
      }
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

// Coin Book System
async function handleCoinBook(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { method } = req;

  switch (method) {
    case 'GET':
      const coinBook = await CoinBook.findOne({}).populate('items.item').lean();
      return res.status(200).json({
        data: coinBook,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
        }
      });

    case 'POST':
      const { itemId, amount } = req.body;
      
      let coinBook2 = await CoinBook.findOne({});
      if (!coinBook2) {
        coinBook2 = new CoinBook({ items: [] });
      }

      const existingEntry = coinBook2.items.find(entry => entry.item.toString() === itemId);
      if (existingEntry) {
        existingEntry.amount += amount;
      } else {
        coinBook2.items.push({ item: itemId, amount });
      }

      await coinBook2.save();

      return res.status(200).json({
        data: coinBook2,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
        }
      });

    default:
      return res.status(405).json({
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: `Method ${method} not allowed for coinbook`,
          instance: '/api/gaming?action=coinbook',
          timestamp: new Date().toISOString(),
        }
      });
  }
}

// Spin/Lottery System
async function handleSpin(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method allowed for spin',
        instance: '/api/gaming?action=spin',
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
        instance: '/api/gaming?action=spin',
        timestamp: new Date().toISOString(),
      }
    });
  }

  const spinCost = 50; // Cost in gold to spin

  if (profile.gold < spinCost) {
    return res.status(400).json({
      error: {
        code: 'INSUFFICIENT_GOLD',
        message: `Not enough gold to spin. Required: ${spinCost}, Available: ${profile.gold}`,
        instance: '/api/gaming?action=spin',
        timestamp: new Date().toISOString(),
      }
    });
  }

  // Simple spinning logic - random rewards
  const rewards = [
    { type: 'gold', amount: 25 },
    { type: 'gold', amount: 50 },
    { type: 'gold', amount: 100 },
    { type: 'exp', amount: 25 },
    { type: 'exp', amount: 50 },
    { type: 'keys', amount: 1 },
  ];

  const reward = rewards[Math.floor(Math.random() * rewards.length)];

  // Deduct spin cost
  profile.gold -= spinCost;

  // Apply reward
  if (reward.type === 'gold') {
    profile.gold += reward.amount;
  } else if (reward.type === 'exp') {
    profile.exp += reward.amount;
  } else if (reward.type === 'keys') {
    profile.keys += reward.amount;
  }

  await profile.save();

  return res.status(200).json({
    data: {
      reward,
      cost: spinCost,
      profile: {
        gold: profile.gold,
        exp: profile.exp,
        keys: profile.keys,
      }
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

// Lootbox System
async function handleLootbox(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { method, query } = req;
  const lootboxId = query.id as string;

  switch (method) {
    case 'GET':
      const lootboxes = await Lootbox.find({}).lean();
      return res.status(200).json({
        data: lootboxes,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
        }
      });

    case 'POST':
      if (!lootboxId) {
        return res.status(400).json({
          error: {
            code: 'MISSING_LOOTBOX_ID',
            message: 'Lootbox ID is required',
            instance: '/api/gaming?action=lootbox',
            timestamp: new Date().toISOString(),
          }
        });
      }

      const [profile, lootbox] = await Promise.all([
        Profile.findOne({}),
        Lootbox.findById(lootboxId)
      ]);

      if (!profile || !lootbox) {
        return res.status(404).json({
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: 'Profile or lootbox not found',
            instance: '/api/gaming?action=lootbox',
            timestamp: new Date().toISOString(),
          }
        });
      }

      // Simple lootbox opening logic
      const rewards = [
        { type: 'gold', amount: Math.floor(Math.random() * 200) + 50 },
        { type: 'exp', amount: Math.floor(Math.random() * 100) + 25 },
        { type: 'keys', amount: Math.floor(Math.random() * 3) + 1 },
      ];

      const openReward = rewards[Math.floor(Math.random() * rewards.length)];

      // Apply reward
      if (openReward.type === 'gold') {
        profile.gold += openReward.amount;
      } else if (openReward.type === 'exp') {
        profile.exp += openReward.amount;
      } else if (openReward.type === 'keys') {
        profile.keys += openReward.amount;
      }

      await profile.save();

      return res.status(200).json({
        data: {
          reward: openReward,
          lootbox: lootbox.name,
          profile: {
            gold: profile.gold,
            exp: profile.exp,
            keys: profile.keys,
          }
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
        }
      });

    default:
      return res.status(405).json({
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: `Method ${method} not allowed for lootbox`,
          instance: '/api/gaming?action=lootbox',
          timestamp: new Date().toISOString(),
        }
      });
  }
}

// Level System
async function handleLevels(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { method } = req;

  switch (method) {
    case 'GET':
      const thresholds = await LevelThresholds.findOne({}).lean();
      return res.status(200).json({
        data: thresholds,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
        }
      });

    case 'PUT':
      const updates = req.body;
      const updatedThresholds = await LevelThresholds.findOneAndUpdate({}, updates, { 
        new: true, 
        upsert: true 
      });

      return res.status(200).json({
        data: updatedThresholds,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
        }
      });

    default:
      return res.status(405).json({
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: `Method ${method} not allowed for levels`,
          instance: '/api/gaming?action=levels',
          timestamp: new Date().toISOString(),
        }
      });
  }
}

// Gold Weights System
async function handleWeights(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { method } = req;

  // Simple placeholder - in real app would have a GoldWeights model
  const defaultWeights = {
    obedience: 1.0,
    vibeDuringSex: 1.2,
    vibeAfterSex: 1.1,
    orgasmIntensity: 1.3,
    painlessness: 0.8,
    ballsWorshipping: 1.1,
    cumWorshipping: 1.2,
    didEverythingForHisPleasure: 1.5,
  };

  switch (method) {
    case 'GET':
      return res.status(200).json({
        data: defaultWeights,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
        }
      });

    case 'PUT':
      const updatedWeights = { ...defaultWeights, ...req.body };
      return res.status(200).json({
        data: updatedWeights,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
        }
      });

    default:
      return res.status(405).json({
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: `Method ${method} not allowed for weights`,
          instance: '/api/gaming?action=weights',
          timestamp: new Date().toISOString(),
        }
      });
  }
}

// Generator System
async function handleGenerator(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { method, query } = req;
  const subAction = query.subAction as string;

  switch (method) {
    case 'GET':
      const generators = await Generator.find({}).sort({ createdAt: -1 }).lean();
      return res.status(200).json({
        data: generators,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
        }
      });

    case 'POST':
      if (subAction === 'accept') {
        const { id } = req.body;
        const generator = await Generator.findByIdAndUpdate(id, { status: 'ACCEPTED' }, { new: true });
        
        if (!generator) {
          return res.status(404).json({
            error: {
              code: 'GENERATOR_NOT_FOUND',
              message: 'Generator not found',
              instance: '/api/gaming?action=generator',
              timestamp: new Date().toISOString(),
            }
          });
        }

        return res.status(200).json({
          data: generator,
          meta: {
            timestamp: new Date().toISOString(),
            version: 'v1',
          }
        });
      } else if (subAction === 'reset') {
        await Generator.updateMany({}, { status: 'NEW' });
        return res.status(200).json({
          data: { message: 'All generators reset' },
          meta: {
            timestamp: new Date().toISOString(),
            version: 'v1',
          }
        });
      } else {
        const generatorData = req.body;
        const generator = new Generator(generatorData);
        await generator.save();

        return res.status(201).json({
          data: generator,
          meta: {
            timestamp: new Date().toISOString(),
            version: 'v1',
          }
        });
      }

    default:
      return res.status(405).json({
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: `Method ${method} not allowed for generator`,
          instance: '/api/gaming?action=generator',
          timestamp: new Date().toISOString(),
        }
      });
  }
}

// Items Management
async function handleItems(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { method } = req;

  switch (method) {
    case 'GET':
      const items = await Item.find({}).lean();
      return res.status(200).json({
        data: items,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
        }
      });

    case 'POST':
      const itemData = req.body;
      const item = new Item(itemData);
      await item.save();

      return res.status(201).json({
        data: item,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
        }
      });

    default:
      return res.status(405).json({
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: `Method ${method} not allowed for items`,
          instance: '/api/gaming?action=items',
          timestamp: new Date().toISOString(),
        }
      });
  }
}
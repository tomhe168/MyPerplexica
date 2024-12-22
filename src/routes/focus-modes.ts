import express from 'express';
import logger from '../utils/logger';
import db from '../db/index';
import { eq } from 'drizzle-orm';
import { focusModes } from '../db/schema';

const router = express.Router();

// 模拟数据（临时使用，后续可以迁移到数据库）
let mockFocusModes = [
  {
    id: '1',
    name: '深度工作模式',
    description: '屏蔽所有社交媒体通知',
    apiEndpoint: 'http://api.example.com/focus1',

  },
  {
    id: '2',
    name: '学习模式',
    description: '只保留学习相关应用',
    apiEndpoint: 'http://api.example.com/focus2',
   
  }
];

// 获取所有 focus modes
router.get('/', async (_, res) => {
  try {
    // 确保返回的是数组格式
    const modes = mockFocusModes;  // 或从数据库查询
    return res.status(200).json({ modes: modes });  // 注意这里包装在 modes 字段中
  } catch (err) {
    res.status(500).json({ message: 'An error has occurred.' });
    logger.error(`Error in getting focus modes: ${err.message}`);
  }
});

// 获取单个 focus mode
router.get('/:id', async (req, res) => {
  try {
    // 使用模拟数据
    const mode = mockFocusModes.find(m => m.id === req.params.id);
    
    if (!mode) {
      return res.status(404).json({ message: 'Focus mode not found' });
    }

    return res.status(200).json({ mode });
  } catch (err) {
    res.status(500).json({ message: 'An error has occurred.' });
    logger.error(`Error in getting focus mode: ${err.message}`);
  }
});

// 创建新的 focus mode
router.post('/', async (req, res) => {
  try {
    logger.info('Received create request:', req.body);
    const { name, description, apiEndpoint } = req.body;
    
    // 创建新模式
    const newMode = {
      id: Date.now().toString(),
      name,
      description,
      apiEndpoint,
      isActive: false
    };
    
    logger.info('Created new mode:', newMode);
    mockFocusModes.push(newMode);
    return res.status(201).json({ mode: newMode });
  } catch (err) {
    logger.error('Error creating focus mode:', err);
    res.status(500).json({ message: 'An error has occurred.' });
    logger.error(`Error in creating focus mode: ${err.message}`);
  }
});

// 更新 focus mode
router.put('/:id', async (req, res) => {
  try {
    const { name, description, apiEndpoint } = req.body;
    const index = mockFocusModes.findIndex(m => m.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Focus mode not found' });
    }
    
    mockFocusModes[index] = {
      ...mockFocusModes[index],
      name: name || mockFocusModes[index].name,
      description: description || mockFocusModes[index].description,
      apiEndpoint: apiEndpoint || mockFocusModes[index].apiEndpoint
    };

    return res.status(200).json({ mode: mockFocusModes[index] });
  } catch (err) {
    res.status(500).json({ message: 'An error has occurred.' });
    logger.error(`Error in updating focus mode: ${err.message}`);
  }
});

// 删除 focus mode
router.delete('/:id', async (req, res) => {
  try {
    const index = mockFocusModes.findIndex(m => m.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Focus mode not found' });
    }
    
    mockFocusModes = mockFocusModes.filter(m => m.id !== req.params.id);
    return res.status(200).json({ message: 'Focus mode deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'An error has occurred.' });
    logger.error(`Error in deleting focus mode: ${err.message}`);
  }
});

// 切换 focus mode 状态
router.post('/:id/toggle', async (req, res) => {
  try {
    const index = mockFocusModes.findIndex(m => m.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Focus mode not found' });
    }
    
    mockFocusModes[index] = {
      ...mockFocusModes[index],
   
    };

    return res.status(200).json({ mode: mockFocusModes[index] });
  } catch (err) {
    res.status(500).json({ message: 'An error has occurred.' });
    logger.error(`Error in toggling focus mode: ${err.message}`);
  }
});

export default router; 
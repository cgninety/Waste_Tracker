import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';

const router = Router();

// POST /api/waste-entries - Add new waste entry
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, weight, notes } = req.body;
    
    if (!category || !weight) {
      res.status(400).json({
        success: false,
        error: 'Category and weight are required'
      });
      return;
    }

    // In production, this would save to database
    const wasteEntry = {
      id: Date.now().toString(),
      category,
      weight: parseFloat(weight),
      notes: notes || '',
      timestamp: new Date(),
      isRecyclable: category !== 'non-recyclable'
    };

    logger.info('Waste entry added:', wasteEntry);

    res.status(201).json({
      success: true,
      data: wasteEntry
    });
    
  } catch (error) {
    logger.error('Error adding waste entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add waste entry'
    });
  }
});

// GET /api/waste-entries - Get waste entries with pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const category = req.query.category as string;

    // Mock data for development
    const categories = ['pet', 'hdpe', 'ldpe', 'pp', 'ps', 'cardboard', 'glass', 'metals', 'non-recyclable'];
    const mockEntries = Array.from({ length: limit }, (_, i) => ({
      id: (Date.now() + i).toString(),
      category: category || categories[i % categories.length],
      weight: Math.random() * 5 + 0.1,
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      notes: Math.random() > 0.7 ? 'Sample note' : '',
      isRecyclable: Math.random() > 0.2
    }));

    res.json({
      success: true,
      data: {
        entries: mockEntries,
        pagination: {
          page,
          limit,
          total: 500,
          pages: Math.ceil(500 / limit)
        }
      }
    });
    
  } catch (error) {
    logger.error('Error fetching waste entries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch waste entries'
    });
  }
});

export default router;
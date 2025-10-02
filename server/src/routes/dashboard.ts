import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';

const router = Router();

// Mock dashboard data for development
const getMockDashboardData = () => {
  const now = new Date();
  
  return {
    realTimeMetrics: {
      todayRecycled: Math.random() * 20 + 10,
      todayWaste: Math.random() * 8 + 2,
      currentRate: Math.random() * 30 + 70, // 70-100%
      trend: Math.random() > 0.5 ? 'up' : 'down'
    },
    categoryTotals: {
      plastics: Math.random() * 10 + 5,
      cardboard: Math.random() * 8 + 3,
      glass: Math.random() * 5 + 1,
      metals: Math.random() * 3 + 0.5,
      'non-recyclable': Math.random() * 6 + 2
    },
    historicalData: Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (29 - i));
      
      return {
        date: date.toISOString().split('T')[0],
        recycled: Math.random() * 20 + 10,
        waste: Math.random() * 8 + 2
      };
    }),
    alerts: [
      {
        id: '1',
        type: 'success',
        message: 'Great job! You\'ve reached your daily recycling goal',
        timestamp: now,
        category: undefined
      },
      {
        id: '2',
        type: 'info',
        message: 'Glass container is 80% full - consider emptying soon',
        timestamp: new Date(now.getTime() - 30 * 60 * 1000),
        category: 'glass'
      }
    ]
  };
};

// GET /api/dashboard - Get dashboard data
router.get('/', async (req: Request, res: Response) => {
  try {
    logger.info('Dashboard data requested');
    
    // In production, this would fetch from database
    const dashboardData = getMockDashboardData();
    
    res.json({
      success: true,
      data: dashboardData
    });
    
  } catch (error) {
    logger.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data'
    });
  }
});

// GET /api/dashboard/stats - Get user statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = {
      totalRecycled: 245.6,
      totalWaste: 68.2,
      recyclingRate: 78.2,
      level: 7,
      points: 1250,
      achievements: [
        {
          id: '1',
          name: 'Recycling Champion',
          description: 'Recycled 100kg of materials',
          icon: '🏆',
          unlockedAt: new Date(),
          progress: 100,
          target: 100,
          category: 'weight'
        }
      ]
    };

    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    logger.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user statistics'
    });
  }
});

export default router;
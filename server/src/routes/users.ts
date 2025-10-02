import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';

const router = Router();

// GET /api/users/profile - Get user profile
router.get('/profile', async (req: Request, res: Response) => {
  try {
    // Mock user data
    const user = {
      id: '1',
      username: 'EcoWarrior',
      email: 'user@recyclingtracker.com',
      createdAt: new Date('2024-01-15'),
      preferences: {
        units: 'kg',
        notifications: true,
        theme: 'light'
      },
      stats: {
        totalRecycled: 245.6,
        totalWaste: 68.2,
        recyclingRate: 78.2,
        level: 7,
        points: 1250,
        rank: 23
      }
    };

    res.json({
      success: true,
      data: user
    });
    
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile'
    });
  }
});

// PUT /api/users/preferences - Update user preferences
router.put('/preferences', async (req: Request, res: Response) => {
  try {
    const { units, notifications, theme } = req.body;
    
    // In production, this would update the database
    const updatedPreferences = {
      units: units || 'kg',
      notifications: notifications !== undefined ? notifications : true,
      theme: theme || 'light'
    };

    logger.info('User preferences updated:', updatedPreferences);

    res.json({
      success: true,
      data: updatedPreferences
    });
    
  } catch (error) {
    logger.error('Error updating user preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences'
    });
  }
});

// GET /api/users/leaderboard - Get leaderboard
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Mock leaderboard data
    const leaderboard = Array.from({ length: limit }, (_, i) => ({
      userId: (i + 1).toString(),
      username: `User${i + 1}`,
      recyclingRate: Math.random() * 30 + 70,
      totalRecycled: Math.random() * 200 + 50,
      points: Math.random() * 2000 + 500,
      rank: i + 1,
      trend: Math.random() > 0.33 ? 'up' : Math.random() > 0.5 ? 'down' : 'same'
    }));

    res.json({
      success: true,
      data: leaderboard
    });
    
  } catch (error) {
    logger.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard'
    });
  }
});

export default router;
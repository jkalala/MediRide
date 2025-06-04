import { Router } from 'express';
import { signup, login, logout } from '../controllers/auth.controller';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Documentation endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Authentication API Documentation',
    endpoints: {
      signup: {
        method: 'POST',
        path: '/api/auth/signup',
        description: 'Create a new user account',
        body: {
          email: 'string',
          password: 'string',
          name: 'string',
          phone: 'string'
        }
      },
      login: {
        method: 'POST',
        path: '/api/auth/login',
        description: 'Login to existing account',
        body: {
          email: 'string',
          password: 'string'
        }
      },
      logout: {
        method: 'POST',
        path: '/api/auth/logout',
        description: 'Logout from current session',
        headers: {
          'Authorization': 'Bearer <token>'
        }
      }
    }
  });
});

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.post('/logout', authenticateUser, logout);

export default router; 
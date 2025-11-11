import { Router } from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/authController';
import { UserRole } from '../models/User';

const router = Router();

// Register route
router.post(
  '/register',
  [
    body('email')
      .isEmail().withMessage('Invalid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required'),
    body('role')
      .optional()
      .isIn([UserRole.STUDENT, UserRole.ADMIN])
      .withMessage('Invalid role'),
    // Optional extra fields (future-proofing)
    body('phoneNumber').optional().trim(),
    body('bio').optional().trim(),
    body('profileImageUrl').optional().trim(),
    body('profileFileUrl').optional().trim(),
    body('institution').optional().trim(),
    body('department').optional().trim()
  ],
  register
);

// Login route
router.post(
  '/login',
  [
    body('email')
      .isEmail().withMessage('Invalid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required')
  ],
  login
);

export default router;

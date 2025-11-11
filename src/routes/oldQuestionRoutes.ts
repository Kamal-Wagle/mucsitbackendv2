import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  getAllOldQuestions,
  getOldQuestionById,
  createOldQuestion,
  updateOldQuestion,
  deleteOldQuestion
} from '../controllers/oldQuestionController';

const router = Router();

// Get all old questions (public)
router.get('/', getAllOldQuestions);

// Get old question by ID (authenticated)
router.get(
  '/:id',
  authenticate,
  param('id').isMongoId().withMessage('Invalid old question ID'),
  getOldQuestionById
);

// Create old question (authenticated & admin)
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('question').trim().notEmpty().withMessage('Question is required'),
    body('answer').trim().notEmpty().withMessage('Answer is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('semester').optional().trim(),
    body('faculty').optional().trim(),
    body('year').optional().isNumeric(),
    body('description').optional().trim(),
    body('fileUrl').notEmpty().withMessage('File URL is required'),
    body('imageUrl').optional().trim(),
    body('seoKeywords').optional().isArray(),
    body('seoDescription').optional().trim(),
    body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
    body('isPublished').optional().isBoolean()
  ],
  createOldQuestion
);

// Update old question (authenticated & admin)
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    param('id').isMongoId().withMessage('Invalid old question ID'),
    body('title').optional().trim().notEmpty(),
    body('question').optional().trim().notEmpty(),
    body('answer').optional().trim().notEmpty(),
    body('subject').optional().trim().notEmpty(),
    body('semester').optional().trim(),
    body('faculty').optional().trim(),
    body('year').optional().isNumeric(),
    body('description').optional().trim(),
    body('fileUrl').optional().trim(),
    body('imageUrl').optional().trim(),
    body('seoKeywords').optional().isArray(),
    body('seoDescription').optional().trim(),
    body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
    body('isPublished').optional().isBoolean()
  ],
  updateOldQuestion
);

// Delete old question (authenticated & admin)
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  param('id').isMongoId().withMessage('Invalid old question ID'),
  deleteOldQuestion
);

export default router;

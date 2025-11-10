import { Router } from 'express';
import { body } from 'express-validator';
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

router.get('/', authenticate, getAllOldQuestions);

router.get('/:id', authenticate, getOldQuestionById);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('question').trim().notEmpty().withMessage('Question is required'),
    body('answer').trim().notEmpty().withMessage('Answer is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required')
  ],
  createOldQuestion
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    body('title').optional().trim().notEmpty(),
    body('question').optional().trim().notEmpty(),
    body('answer').optional().trim().notEmpty(),
    body('subject').optional().trim().notEmpty()
  ],
  updateOldQuestion
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  deleteOldQuestion
);

export default router;

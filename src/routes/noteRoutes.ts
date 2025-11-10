import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote
} from '../controllers/noteController';

const router = Router();

router.get('/', authenticate, getAllNotes);

router.get('/:id', authenticate, getNoteById);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required')
  ],
  createNote
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    body('title').optional().trim().notEmpty(),
    body('content').optional().trim().notEmpty()
  ],
  updateNote
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  deleteNote
);

export default router;

import { Router } from 'express';
import { body, param } from 'express-validator';
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

// Get all notes (public)
router.get('/', getAllNotes);

// Get note by ID (authenticated)
router.get(
  '/:id',
  authenticate,
  param('id').isMongoId().withMessage('Invalid note ID'),
  getNoteById
);

// Create note (authenticated & admin)
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('description').optional().trim(),
    body('subject').optional().trim(),
    body('semester').optional().trim(),
    body('faculty').optional().trim(),
    body('year').optional().isNumeric(),
    body('fileUrl').notEmpty().withMessage('File URL is required'),
    body('imageUrl').optional().trim(),
    body('seoKeywords').optional().isArray(),
    body('seoDescription').optional().trim(),
    body('isPublished').optional().isBoolean()
  ],
  createNote
);

// Update note (authenticated & admin)
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    param('id').isMongoId().withMessage('Invalid note ID'),
    body('title').optional().trim().notEmpty(),
    body('content').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('subject').optional().trim(),
    body('semester').optional().trim(),
    body('faculty').optional().trim(),
    body('year').optional().isNumeric(),
    body('fileUrl').optional().trim(),
    body('imageUrl').optional().trim(),
    body('seoKeywords').optional().isArray(),
    body('seoDescription').optional().trim(),
    body('isPublished').optional().isBoolean()
  ],
  updateNote
);

// Delete note (authenticated & admin)
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  param('id').isMongoId().withMessage('Invalid note ID'),
  deleteNote
);

export default router;

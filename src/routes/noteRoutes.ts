import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  getAllNotesPaginated,
  searchAndFilterNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote
} from '../controllers/noteController';

const router = Router();

// 1️⃣ Get all notes with pagination (public)
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer')
  ],
  getAllNotesPaginated
);

// 2️⃣ Search & filter notes with sorting & pagination (public)
router.get(
  '/search',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    query('sortBy').optional().isString(),
    query('order').optional().isIn(['asc', 'desc'])
  ],
  searchAndFilterNotes
);

// Get note by ID (authenticated)
router.get(
  '/:id',
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

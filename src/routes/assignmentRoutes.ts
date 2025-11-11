import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  getAllAssignmentsPaginated,
  searchAndFilterAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment
} from '../controllers/assignmentController';

const router = Router();

// Get all assignments with pagination (public)
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer')
  ],
  getAllAssignmentsPaginated
);

// Search & filter assignments (public)
router.get(
  '/search',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1 }),
    query('sortBy').optional().isIn(['date', 'due']),
    query('order').optional().isIn(['asc', 'desc'])
  ],
  searchAndFilterAssignments
);

// Get assignment by ID (authenticated)
router.get(
  '/:id',
  param('id').isMongoId().withMessage('Invalid assignment ID'),
  getAssignmentById
);

// Create assignment (authenticated & admin)
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('fileUrl').trim().notEmpty().withMessage('File URL is required'),
    body('dueDate').notEmpty().withMessage('Due date is required')
  ],
  createAssignment
);

// Update assignment (authenticated & admin)
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    param('id').isMongoId().withMessage('Invalid assignment ID'),
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    body('fileUrl').optional().trim(),
    body('dueDate').optional()
  ],
  updateAssignment
);

// Delete assignment (authenticated & admin)
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  param('id').isMongoId().withMessage('Invalid assignment ID'),
  deleteAssignment
);

export default router;

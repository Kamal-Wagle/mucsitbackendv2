import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  getAllAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment
} from '../controllers/assignmentController';

const router = Router();

// Get all assignments (public)
router.get('/', getAllAssignments);

// Get assignment by ID (authenticated)
router.get(
  '/:id',
  authenticate,
  param('id').isMongoId().withMessage('Invalid assignment ID'),
  getAssignmentById
);

// Create a new assignment (authenticated)
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    body('title').notEmpty().withMessage('Title is required').trim(),
    body('description').notEmpty().withMessage('Description is required').trim(),
    body('fileUrl').notEmpty().withMessage('File URL is required').trim(),
    body('dueDate').notEmpty().withMessage('Due date is required').isISO8601().toDate()
  ],
  createAssignment
);

// Update an assignment (authenticated & admin)
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    param('id').isMongoId().withMessage('Invalid assignment ID'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
    body('fileUrl').optional().trim(),
    body('dueDate').optional().isISO8601().toDate().withMessage('Invalid due date')
  ],
  updateAssignment
);

// Delete an assignment (authenticated & admin)
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  param('id').isMongoId().withMessage('Invalid assignment ID'),
  deleteAssignment
);

export default router;

import { Router } from 'express';
import { body } from 'express-validator';
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

router.get('/', authenticate, getAllAssignments);

router.get('/:id', authenticate, getAssignmentById);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('dueDate').isISO8601().withMessage('Valid due date is required')
  ],
  createAssignment
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    body('dueDate').optional().isISO8601()
  ],
  updateAssignment
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  deleteAssignment
);

export default router;

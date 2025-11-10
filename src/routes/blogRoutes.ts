import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog
} from '../controllers/blogController';

const router = Router();

router.get('/', authenticate, getAllBlogs);

router.get('/:id', authenticate, getBlogById);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required')
  ],
  createBlog
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    body('title').optional().trim().notEmpty(),
    body('content').optional().trim().notEmpty()
  ],
  updateBlog
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  deleteBlog
);

export default router;

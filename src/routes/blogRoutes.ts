import { Router } from 'express';
import { body, param } from 'express-validator';
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

// Get all blogs (public)
router.get('/', getAllBlogs);

// Get blog by ID (authenticated)
router.get(
  '/:id',
  authenticate,
  param('id').isMongoId().withMessage('Invalid blog ID'),
  getBlogById
);

// Create blog (authenticated & admin)
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('sections').isArray().withMessage('Sections must be an array'),
    body('sections.*.text').optional().isString(),
    body('sections.*.imageUrl').optional().isString(),
    body('excerpt').optional().trim(),
    body('category').optional().trim(),
    body('description').optional().trim(),
    body('fileUrl').notEmpty().withMessage('File URL is required'),
    body('imageUrl').optional().trim(),
    body('seoKeywords').optional().isArray(),
    body('seoDescription').optional().trim(),
    body('isPublished').optional().isBoolean(),
    body('isFeatured').optional().isBoolean(),
    body('readTimeMinutes').optional().isNumeric()
  ],
  createBlog
);

// Update blog (authenticated & admin)
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    param('id').isMongoId().withMessage('Invalid blog ID'),
    body('title').optional().trim().notEmpty(),
    body('sections').optional().isArray(),
    body('sections.*.text').optional().isString(),
    body('sections.*.imageUrl').optional().isString(),
    body('excerpt').optional().trim(),
    body('category').optional().trim(),
    body('description').optional().trim(),
    body('fileUrl').optional().trim(),
    body('imageUrl').optional().trim(),
    body('seoKeywords').optional().isArray(),
    body('seoDescription').optional().trim(),
    body('isPublished').optional().isBoolean(),
    body('isFeatured').optional().isBoolean(),
    body('readTimeMinutes').optional().isNumeric()
  ],
  updateBlog
);

// Delete blog (authenticated & admin)
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  param('id').isMongoId().withMessage('Invalid blog ID'),
  deleteBlog
);

export default router;

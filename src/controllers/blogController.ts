import { Response } from 'express';
import { Blog } from '../models/Blog';
import { AuthRequest } from '../middleware/auth';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Search & Filter Blogs
export const searchAndFilterBlogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      search,
      category,
      isPublished,
      isFeatured,
      sortBy,
      order,
      page = 1,
      limit = 10
    } = req.query;

    const query: any = {};

    // Text search in title, excerpt, or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) query.category = category;
    if (isPublished !== undefined) query.isPublished = isPublished === 'true';
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const sortOrder: any = {};
    if (sortBy) {
      sortOrder[sortBy as string] = order === 'asc' ? 1 : -1;
    } else {
      sortOrder.createdAt = -1;
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name email')
      .sort(sortOrder)
      .skip(skip)
      .limit(Number(limit));

    const total = await Blog.countDocuments(query);

    res.json({
      count: blogs.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      blogs
    });
  } catch (error) {
    console.error('Search & Filter blogs error:', error);
    res.status(500).json({ error: 'Server error while searching blogs' });
  }
};

// Get all blogs with pagination
export const getAllBlogsPaginated = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const blogs = await Blog.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Blog.countDocuments();

    res.json({
      count: blogs.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      blogs
    });
  } catch (error) {
    console.error('Get all blogs paginated error:', error);
    res.status(500).json({ error: 'Server error while fetching blogs' });
  }
};

// Get blog by ID
export const getBlogById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid blog ID' });
      return;
    }

    const blog = await Blog.findById(id).populate('author', 'name email');

    if (!blog) {
      res.status(404).json({ error: 'Blog not found' });
      return;
    }

    res.json(blog);
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ error: 'Server error while fetching blog' });
  }
};

// Create blog (admin)
export const createBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const {
      title,
      sections,
      excerpt,
      category,
      description,
      fileUrl,
      seoKeywords,
      seoDescription,
      isPublished,
      isFeatured,
      readTimeMinutes
    } = req.body;

    if (!fileUrl) {
      res.status(400).json({ error: 'File URL is required' });
      return;
    }

    const blog = new Blog({
      title,
      sections,
      excerpt,
      category,
      description,
      fileUrl,
      seoKeywords,
      seoDescription,
      isPublished: isPublished ?? true,
      isFeatured: isFeatured ?? false,
      readTimeMinutes,
      author: req.user!.userId
    });

    await blog.save();
    await blog.populate('author', 'name email');

    res.status(201).json({
      message: 'Blog created successfully',
      blog
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ error: 'Server error while creating blog' });
  }
};

// Update blog (admin)
export const updateBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid blog ID' });
      return;
    }

    const updateData: Partial<typeof req.body> = req.body;

    const blog = await Blog.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('author', 'name email');

    if (!blog) {
      res.status(404).json({ error: 'Blog not found' });
      return;
    }

    res.json({
      message: 'Blog updated successfully',
      blog
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ error: 'Server error while updating blog' });
  }
};

// Delete blog (admin)
export const deleteBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid blog ID' });
      return;
    }

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      res.status(404).json({ error: 'Blog not found' });
      return;
    }

    res.json({
      message: 'Blog deleted successfully',
      blogId: id
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ error: 'Server error while deleting blog' });
  }
};

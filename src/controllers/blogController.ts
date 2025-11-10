import { Response } from 'express';
import { Blog } from '../models/Blog';
import { AuthRequest } from '../middleware/auth';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

export const getAllBlogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const blogs = await Blog.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      count: blogs.length,
      blogs
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ error: 'Server error while fetching blogs' });
  }
};

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

export const createBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
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

export const updateBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const { title, content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid blog ID' });
      return;
    }

    const blog = await Blog.findByIdAndUpdate(
      id,
      { title, content },
      { new: true, runValidators: true }
    ).populate('author', 'name email');

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

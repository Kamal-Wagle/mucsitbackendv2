import { Response } from 'express';
import { Assignment } from '../models/Assignment';
import { AuthRequest } from '../middleware/auth';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Search & Filter Assignments
export const searchAndFilterAssignments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      search,
      subject,
      semester,
      faculty,
      difficulty,
      isPublished,
      sortBy,
      order,
      page = 1,
      limit = 10
    } = req.query;

    const query: any = {};

    // Text search in title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (subject) query.subject = subject;
    if (semester) query.semester = semester;
    if (faculty) query.faculty = faculty;
    if (difficulty) query.difficulty = difficulty;
    if (isPublished !== undefined) query.isPublished = isPublished === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const sortOrder: any = {};
    if (sortBy) {
      if (sortBy === 'due') sortOrder.dueDate = order === 'asc' ? 1 : -1;
      else sortOrder.createdAt = order === 'asc' ? 1 : -1;
    } else {
      sortOrder.createdAt = -1;
    }

    const assignments = await Assignment.find(query)
      .populate('author', 'name email')
      .sort(sortOrder)
      .skip(skip)
      .limit(Number(limit));

    const total = await Assignment.countDocuments(query);

    res.json({
      count: assignments.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      assignments
    });
  } catch (error) {
    console.error('Search & Filter assignments error:', error);
    res.status(500).json({ error: 'Server error while searching assignments' });
  }
};

// Get all assignments with pagination
export const getAllAssignmentsPaginated = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const assignments = await Assignment.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Assignment.countDocuments();

    res.json({
      count: assignments.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      assignments
    });
  } catch (error) {
    console.error('Get all assignments paginated error:', error);
    res.status(500).json({ error: 'Server error while fetching assignments' });
  }
};

// Get assignment by ID
export const getAssignmentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid assignment ID' });
      return;
    }

    const assignment = await Assignment.findById(id).populate('author', 'name email');
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    res.json(assignment);
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ error: 'Server error while fetching assignment' });
  }
};

// Create assignment (admin)
export const createAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const {
      title,
      description,
      instructions,
      subject,
      semester,
      faculty,
      year,
      dueDate,
      fileUrl,
      imageUrl,
      seoKeywords,
      seoDescription,
      totalMarks,
      difficulty,
      isPublished
    } = req.body;

    if (!fileUrl) {
      res.status(400).json({ error: 'File URL is required' });
      return;
    }

    const assignment = new Assignment({
      title,
      description,
      instructions,
      subject,
      semester,
      faculty,
      year,
      dueDate,
      fileUrl,
      imageUrl,
      seoKeywords,
      seoDescription,
      totalMarks,
      difficulty,
      isPublished: isPublished ?? true,
      author: req.user!.userId
    });

    await assignment.save();
    await assignment.populate('author', 'name email');

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ error: 'Server error while creating assignment' });
  }
};

// Update assignment (admin)
export const updateAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid assignment ID' });
      return;
    }

    const updateData: Partial<typeof req.body> = req.body;

    const assignment = await Assignment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name email');

    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    res.json({
      message: 'Assignment updated successfully',
      assignment
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ error: 'Server error while updating assignment' });
  }
};

// Delete assignment (admin)
export const deleteAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid assignment ID' });
      return;
    }

    const assignment = await Assignment.findByIdAndDelete(id);

    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    res.json({
      message: 'Assignment deleted successfully',
      assignmentId: id
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ error: 'Server error while deleting assignment' });
  }
};

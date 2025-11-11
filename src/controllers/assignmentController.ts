// controllers/assignmentController.ts
import { Response } from 'express';
import { Assignment } from '../models/Assignment';
import { AuthRequest } from '../middleware/auth';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

// ✅ Get All Assignments (with future filtering/sorting support)
export const getAllAssignments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { semester, subject, faculty, difficulty, sortBy } = req.query;

    const filters: any = {};
    if (semester) filters.semester = semester;
    if (subject) filters.subject = subject;
    if (faculty) filters.faculty = faculty;
    if (difficulty) filters.difficulty = difficulty;

    const sortOptions: any = {};
    if (sortBy === 'date') sortOptions.createdAt = -1;
    if (sortBy === 'due') sortOptions.dueDate = 1;

    const assignments = await Assignment.find(filters)
      .populate('author', 'name email')
      .sort(sortOptions || { createdAt: -1 });

    res.json({
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Server error while fetching assignments' });
  }
};

// ✅ Get Assignment by ID
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

// ✅ Create Assignment
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
      isPublished,
    } = req.body;

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
      isPublished,
      author: req.user!.userId,
    });

    await assignment.save();
    await assignment.populate('author', 'name email');

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment,
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ error: 'Server error while creating assignment' });
  }
};

// ✅ Update Assignment
export const updateAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid assignment ID' });
      return;
    }

    const updates = req.body;

    const assignment = await Assignment.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('author', 'name email');

    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    res.json({
      message: 'Assignment updated successfully',
      assignment,
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ error: 'Server error while updating assignment' });
  }
};

// ✅ Delete Assignment
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
      assignmentId: id,
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ error: 'Server error while deleting assignment' });
  }
};

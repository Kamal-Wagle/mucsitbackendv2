import { Response } from 'express';
import { Assignment } from '../models/Assignment';
import { AuthRequest } from '../middleware/auth';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

export const getAllAssignments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignments = await Assignment.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      count: assignments.length,
      assignments
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Server error while fetching assignments' });
  }
};

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

export const createAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { title, description, dueDate } = req.body;

    const assignment = new Assignment({
      title,
      description,
      dueDate,
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

export const updateAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const { title, description, dueDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid assignment ID' });
      return;
    }

    const assignment = await Assignment.findByIdAndUpdate(
      id,
      { title, description, dueDate },
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

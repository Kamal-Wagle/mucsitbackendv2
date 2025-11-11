import { Response } from 'express';
import { OldQuestion } from '../models/OldQuestion';
import { AuthRequest } from '../middleware/auth';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Get all old questions
export const getAllOldQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const oldQuestions = await OldQuestion.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      count: oldQuestions.length,
      oldQuestions
    });
  } catch (error) {
    console.error('Get old questions error:', error);
    res.status(500).json({ error: 'Server error while fetching old questions' });
  }
};

// Get old question by ID
export const getOldQuestionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid old question ID' });
      return;
    }

    const oldQuestion = await OldQuestion.findById(id).populate('author', 'name email');

    if (!oldQuestion) {
      res.status(404).json({ error: 'Old question not found' });
      return;
    }

    res.json(oldQuestion);
  } catch (error) {
    console.error('Get old question error:', error);
    res.status(500).json({ error: 'Server error while fetching old question' });
  }
};

// Create a new old question
export const createOldQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const {
      title,
      question,
      answer,
      subject,
      semester,
      faculty,
      year,
      description,
      fileUrl,
      imageUrl,
      seoKeywords,
      seoDescription,
      difficulty,
      isPublished
    } = req.body;

    if (!fileUrl) {
      res.status(400).json({ error: 'File URL is required' });
      return;
    }

    const oldQuestion = new OldQuestion({
      title,
      question,
      answer,
      subject,
      semester,
      faculty,
      year,
      description,
      fileUrl,
      imageUrl,
      seoKeywords,
      seoDescription,
      difficulty,
      isPublished: isPublished ?? true,
      author: req.user!.userId
    });

    await oldQuestion.save();
    await oldQuestion.populate('author', 'name email');

    res.status(201).json({
      message: 'Old question created successfully',
      oldQuestion
    });
  } catch (error) {
    console.error('Create old question error:', error);
    res.status(500).json({ error: 'Server error while creating old question' });
  }
};

// Update an old question
export const updateOldQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid old question ID' });
      return;
    }

    const updateData: Partial<typeof req.body> = req.body;

    const oldQuestion = await OldQuestion.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name email');

    if (!oldQuestion) {
      res.status(404).json({ error: 'Old question not found' });
      return;
    }

    res.json({
      message: 'Old question updated successfully',
      oldQuestion
    });
  } catch (error) {
    console.error('Update old question error:', error);
    res.status(500).json({ error: 'Server error while updating old question' });
  }
};

// Delete an old question
export const deleteOldQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid old question ID' });
      return;
    }

    const oldQuestion = await OldQuestion.findByIdAndDelete(id);

    if (!oldQuestion) {
      res.status(404).json({ error: 'Old question not found' });
      return;
    }

    res.json({
      message: 'Old question deleted successfully',
      oldQuestionId: id
    });
  } catch (error) {
    console.error('Delete old question error:', error);
    res.status(500).json({ error: 'Server error while deleting old question' });
  }
};

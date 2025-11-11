import { Response } from 'express';
import { OldQuestion } from '../models/OldQuestion';
import { AuthRequest } from '../middleware/auth';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Search & Filter Old Questions
export const searchAndFilterOldQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      search,
      subject,
      semester,
      faculty,
      difficulty,
      sortBy,
      order,
      page = 1,
      limit = 10
    } = req.query;

    const query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (subject) query.subject = subject;
    if (semester) query.semester = semester;
    if (faculty) query.faculty = faculty;
    if (difficulty) query.difficulty = difficulty;

    const skip = (Number(page) - 1) * Number(limit);

    const sortOrder: any = {};
    if (sortBy) {
      sortOrder[sortBy as string] = order === 'asc' ? 1 : -1;
    } else {
      sortOrder.createdAt = -1;
    }

    const oldQuestions = await OldQuestion.find(query)
      .populate('author', 'name email')
      .sort(sortOrder)
      .skip(skip)
      .limit(Number(limit));

    const total = await OldQuestion.countDocuments(query);

    res.json({
      count: oldQuestions.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      oldQuestions
    });
  } catch (error) {
    console.error('Search & Filter old questions error:', error);
    res.status(500).json({ error: 'Server error while searching old questions' });
  }
};

// Get all old questions with pagination
export const getAllOldQuestionsPaginated = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const oldQuestions = await OldQuestion.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await OldQuestion.countDocuments();

    res.json({
      count: oldQuestions.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      oldQuestions
    });
  } catch (error) {
    console.error('Get all old questions paginated error:', error);
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

// Create old question (admin)
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

// Update old question (admin)
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

// Delete old question (admin)
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

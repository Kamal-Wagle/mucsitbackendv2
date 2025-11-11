import { Response } from 'express';
import { Note } from '../models/Note';
import { AuthRequest } from '../middleware/auth';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Search & Filter notes
export const searchAndFilterNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      search,
      subject,
      semester,
      faculty,
      year,
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
    if (year) query.year = Number(year);
    if (isPublished !== undefined) query.isPublished = isPublished === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const sortOrder: any = {};
    if (sortBy) {
      sortOrder[sortBy as string] = order === 'asc' ? 1 : -1;
    } else {
      sortOrder.createdAt = -1; // default sort by newest
    }

    const notes = await Note.find(query)
      .populate('author', 'name email')
      .sort(sortOrder)
      .skip(skip)
      .limit(Number(limit));

    const total = await Note.countDocuments(query);

    res.json({
      count: notes.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      notes
    });
  } catch (error) {
    console.error('Search & Filter notes error:', error);
    res.status(500).json({ error: 'Server error while searching notes' });
  }
};

// Get all notes with pagination
export const getAllNotesPaginated = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const notes = await Note.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(Number(limit));

    const total = await Note.countDocuments();

    res.json({
      count: notes.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      notes
    });
  } catch (error) {
    console.error('Get all notes paginated error:', error);
    res.status(500).json({ error: 'Server error while fetching notes' });
  }
};


// Get note by ID
export const getNoteById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid note ID' });
      return;
    }

    const note = await Note.findById(id).populate('author', 'name email');

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    res.json(note);
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ error: 'Server error while fetching note' });
  }
};

// Create a new note
export const createNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const {
      title,
      content,
      description,
      subject,
      semester,
      faculty,
      year,
      fileUrl,
      imageUrl,
      seoKeywords,
      seoDescription,
      isPublished
    } = req.body;

    if (!fileUrl) {
      res.status(400).json({ error: 'File URL is required' });
      return;
    }

    const note = new Note({
      title,
      content,
      description,
      subject,
      semester,
      faculty,
      year,
      fileUrl,
      imageUrl,
      seoKeywords,
      seoDescription,
      isPublished: isPublished ?? true,
      author: req.user!.userId
    });

    await note.save();
    await note.populate('author', 'name email');

    res.status(201).json({
      message: 'Note created successfully',
      note
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Server error while creating note' });
  }
};

// Update an existing note
export const updateNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid note ID' });
      return;
    }

    const updateData: Partial<typeof req.body> = req.body;

    const note = await Note.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name email');

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    res.json({
      message: 'Note updated successfully',
      note
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Server error while updating note' });
  }
};

// Delete a note
export const deleteNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid note ID' });
      return;
    }

    const note = await Note.findByIdAndDelete(id);

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    res.json({
      message: 'Note deleted successfully',
      noteId: id
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Server error while deleting note' });
  }
};

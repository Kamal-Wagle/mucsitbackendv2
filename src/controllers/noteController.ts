import { Response } from 'express';
import { Note } from '../models/Note';
import { AuthRequest } from '../middleware/auth';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

export const getAllNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notes = await Note.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      count: notes.length,
      notes
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Server error while fetching notes' });
  }
};

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

export const createNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { title, content } = req.body;

    const note = new Note({
      title,
      content,
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

export const updateNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const { title, content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid note ID' });
      return;
    }

    const note = await Note.findByIdAndUpdate(
      id,
      { title, content },
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

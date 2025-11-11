// models/Assignment.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IAssignment extends Document {
  title: string;
  description: string;
  instructions?: string;
  subject?: string;
  semester?: string;
  faculty?: string;
  year?: number;
  dueDate: Date;
  fileUrl: string;
  imageUrl?: string;
  seoKeywords?: string[];
  seoDescription?: string;
  author: mongoose.Types.ObjectId;
  totalMarks?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    instructions: { type: String, trim: true },
    subject: { type: String, trim: true },
    semester: { type: String, trim: true },
    faculty: { type: String, trim: true },
    year: { type: Number },
    dueDate: { type: Date, required: true },
    fileUrl: { type: String, required: true },
    imageUrl: { type: String },
    seoKeywords: { type: [String], default: [] },
    seoDescription: { type: String, trim: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    totalMarks: { type: Number },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

assignmentSchema.index({ author: 1 });
assignmentSchema.index({ createdAt: -1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ subject: 1 });
assignmentSchema.index({ seoKeywords: 1 });

export const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema);

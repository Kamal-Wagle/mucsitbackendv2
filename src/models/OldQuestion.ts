import mongoose, { Document, Schema } from 'mongoose';

export interface IOldQuestion extends Document {
  title: string;
  question: string;
  answer: string;
  subject: string;
  semester?: string;
  faculty?: string;
  year?: number;
  description?: string;
  fileUrl: string;
  imageUrl?: string;
  seoKeywords?: string[];
  seoDescription?: string;
  author: mongoose.Types.ObjectId;
  difficulty?: 'easy' | 'medium' | 'hard';
  views: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const oldQuestionSchema = new Schema<IOldQuestion>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    semester: {
      type: String,
      trim: true,
    },
    faculty: {
      type: String,
      trim: true,
    },
    year: {
      type: Number,
    },
    description: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    seoKeywords: {
      type: [String],
      default: [],
    },
    seoDescription: {
      type: String,
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster querying
oldQuestionSchema.index({ author: 1 });
oldQuestionSchema.index({ subject: 1 });
oldQuestionSchema.index({ semester: 1 });
oldQuestionSchema.index({ faculty: 1 });
oldQuestionSchema.index({ year: -1 });
oldQuestionSchema.index({ createdAt: -1 });
oldQuestionSchema.index({ seoKeywords: 1 });

export const OldQuestion = mongoose.model<IOldQuestion>('OldQuestion', oldQuestionSchema);

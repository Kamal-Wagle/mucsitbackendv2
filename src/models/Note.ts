import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
  title: string;
  content: string;
  description?: string;
  subject?: string;
  semester?: string;
  faculty?: string;
  year?: number;
  fileUrl: string;
  imageUrl?: string;
  seoKeywords?: string[];
  seoDescription?: string;
  author: mongoose.Types.ObjectId;
  views: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
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

// Indexes for faster queries
noteSchema.index({ author: 1 });
noteSchema.index({ createdAt: -1 });
noteSchema.index({ subject: 1 });
noteSchema.index({ seoKeywords: 1 });

export const Note = mongoose.model<INote>('Note', noteSchema);

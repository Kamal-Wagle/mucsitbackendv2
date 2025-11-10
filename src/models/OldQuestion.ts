import mongoose, { Document, Schema } from 'mongoose';

export interface IOldQuestion extends Document {
  title: string;
  question: string;
  answer: string;
  subject: string;
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const oldQuestionSchema = new Schema<IOldQuestion>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

oldQuestionSchema.index({ author: 1 });
oldQuestionSchema.index({ subject: 1 });
oldQuestionSchema.index({ createdAt: -1 });

export const OldQuestion = mongoose.model<IOldQuestion>('OldQuestion', oldQuestionSchema);

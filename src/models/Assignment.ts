import mongoose, { Document, Schema } from 'mongoose';

export interface IAssignment extends Document {
  title: string;
  description: string;
  dueDate: Date;
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

assignmentSchema.index({ author: 1 });
assignmentSchema.index({ createdAt: -1 });
assignmentSchema.index({ dueDate: 1 });

export const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema);

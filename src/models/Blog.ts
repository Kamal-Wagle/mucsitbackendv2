import mongoose, { Document, Schema } from 'mongoose';

// Each blog section can have optional text and/or image
export interface BlogSection {
  text?: string;
  imageUrl?: string;
}

export interface IBlog extends Document {
  title: string;
  sections: BlogSection[];
  excerpt?: string;
  category?: string;
  description?: string;
  fileUrl: string;
  seoKeywords?: string[];
  seoDescription?: string;
  author: mongoose.Types.ObjectId;
  views: number;
  likes: number;
  isPublished: boolean;
  isFeatured: boolean;
  readTimeMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Subdocument schema for sections
const sectionSchema = new Schema<BlogSection>({
  text: { type: String, trim: true },
  imageUrl: { type: String }
});

const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    sections: { type: [sectionSchema], required: true, default: [] },
    excerpt: { type: String, trim: true },
    category: { type: String, trim: true },
    description: { type: String, trim: true },
    fileUrl: { type: String, required: true },
    seoKeywords: { type: [String], default: [] },
    seoDescription: { type: String, trim: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    readTimeMinutes: { type: Number }
  },
  { timestamps: true }
);

// Indexes for faster querying
blogSchema.index({ author: 1 });
blogSchema.index({ createdAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ seoKeywords: 1 });
blogSchema.index({ isFeatured: 1 });

export const Blog = mongoose.model<IBlog>('Blog', blogSchema);

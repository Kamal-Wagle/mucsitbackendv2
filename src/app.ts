import express, { Application } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import noteRoutes from './routes/noteRoutes';
import assignmentRoutes from './routes/assignmentRoutes';
import oldQuestionRoutes from './routes/oldQuestionRoutes';
import blogRoutes from './routes/blogRoutes';
import { errorHandler } from './middleware/errorHandler';

const createApp = (): Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  

  app.use('/api/auth', authRoutes);
  app.use('/api/notes', noteRoutes);
  app.use('/api/assignments', assignmentRoutes);
  app.use('/api/old-questions', oldQuestionRoutes);
  app.use('/api/blogs', blogRoutes);

  app.use(errorHandler);

  return app;
};

export default createApp;

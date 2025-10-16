import express, { Request, Response, NextFunction } from 'express';
import workflowRoutes from './routes/workflows.js';
import executionRoutes from './routes/executions.js';

export function createServer() {
  const app = express();

  app.use(express.json());

  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });

  app.use('/api/workflows', workflowRoutes);
  app.use('/api/executions', executionRoutes);

  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}

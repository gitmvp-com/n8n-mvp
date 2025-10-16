import { Router, Request, Response } from 'express';
import { database } from '../database.js';
import { WorkflowExecutor } from '../workflow/executor.js';

const router = Router();
const executor = new WorkflowExecutor();

router.post('/workflows/:workflowId/execute', async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;
    const { data } = req.body;

    const workflow = await database.getWorkflow(workflowId);
    if (!workflow) {
      res.status(404).json({ error: 'Workflow not found' });
      return;
    }

    const execution = await executor.execute(workflow, data || {});
    res.json(execution);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { workflowId, limit } = req.query;

    if (workflowId) {
      const executions = await database.getExecutionsByWorkflow(
        workflowId as string,
        limit ? parseInt(limit as string) : 50
      );
      res.json(executions);
    } else {
      res.status(400).json({ error: 'workflowId query parameter required' });
    }
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/:executionId', async (req: Request, res: Response) => {
  try {
    const execution = await database.getExecution(req.params.executionId);
    if (!execution) {
      res.status(404).json({ error: 'Execution not found' });
      return;
    }
    res.json(execution);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
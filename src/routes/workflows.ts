import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { database } from '../database.js';
import type { Workflow } from '../types.js';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, nodes, connections } = req.body;

    if (!name || !nodes) {
      res.status(400).json({ error: 'Missing required fields: name, nodes' });
      return;
    }

    const workflow: Workflow = {
      id: uuidv4(),
      name,
      description,
      nodes,
      connections: connections || [],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await database.createWorkflow(workflow);
    res.status(201).json(workflow);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const workflows = await database.getAllWorkflows();
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const workflow = await database.getWorkflow(req.params.id);
    if (!workflow) {
      res.status(404).json({ error: 'Workflow not found' });
      return;
    }
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const workflow = await database.getWorkflow(req.params.id);
    if (!workflow) {
      res.status(404).json({ error: 'Workflow not found' });
      return;
    }

    const updates = {
      name: req.body.name || workflow.name,
      description: req.body.description !== undefined ? req.body.description : workflow.description,
      nodes: req.body.nodes || workflow.nodes,
      connections: req.body.connections !== undefined ? req.body.connections : workflow.connections,
      updatedAt: new Date(),
    };

    await database.updateWorkflow(req.params.id, updates);
    const updated = await database.getWorkflow(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const workflow = await database.getWorkflow(req.params.id);
    if (!workflow) {
      res.status(404).json({ error: 'Workflow not found' });
      return;
    }

    await database.deleteWorkflow(req.params.id);
    res.json({ success: true, message: 'Workflow deleted' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
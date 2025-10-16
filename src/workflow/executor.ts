import { v4 as uuidv4 } from 'uuid';
import { getNodeExecutor } from '../nodes/index.js';
import { database } from '../database.js';
import type { Workflow, Execution, ExecutionResult } from '../types.js';

export class WorkflowExecutor {
  async execute(workflow: Workflow, input: any = {}): Promise<Execution> {
    const executionId = uuidv4();
    const execution: Execution = {
      id: executionId,
      workflowId: workflow.id,
      status: 'running',
      results: [],
      input,
      createdAt: new Date(),
    };

    await database.createExecution(execution);

    try {
      const results: ExecutionResult[] = [];
      const nodeOutputs: Record<string, any> = {};

      for (const node of workflow.nodes) {
        const startTime = Date.now();
        try {
          const executor = getNodeExecutor(node.type);
          const nodeInput = nodeOutputs[node.id] || input;
          const output = await executor.execute(node.config, nodeInput);
          nodeOutputs[node.id] = output;

          results.push({
            nodeId: node.id,
            status: 'success',
            output,
            duration: Date.now() - startTime,
          });
        } catch (error) {
          results.push({
            nodeId: node.id,
            status: 'error',
            error: error instanceof Error ? error.message : String(error),
            duration: Date.now() - startTime,
          });
          throw error;
        }
      }

      execution.status = 'success';
      execution.results = results;
      execution.completedAt = new Date();
    } catch (error) {
      execution.status = 'error';
      execution.completedAt = new Date();
    }

    await database.updateExecution(executionId, {
      status: execution.status,
      results: execution.results,
      completedAt: execution.completedAt,
    });

    return execution;
  }
}
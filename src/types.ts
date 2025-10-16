// Workflow and execution types

export interface NodeConfig {
  [key: string]: any;
}

export interface WorkflowNode {
  id: string;
  type: string;
  config: NodeConfig;
  position?: { x: number; y: number };
}

export interface WorkflowConnection {
  source: string;
  target: string;
  sourceOutput?: string;
  targetInput?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExecutionResult {
  nodeId: string;
  status: 'success' | 'error' | 'pending';
  output?: any;
  error?: string;
  duration: number;
}

export interface Execution {
  id: string;
  workflowId: string;
  status: 'success' | 'error' | 'running';
  results: ExecutionResult[];
  input: any;
  createdAt: Date;
  completedAt?: Date;
}

export interface NodeExecutor {
  execute(config: NodeConfig, input: any): Promise<any>;
}
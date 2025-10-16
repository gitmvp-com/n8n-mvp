import type { NodeExecutor, NodeConfig } from '../types.js';
import { HttpNode } from './http.js';

const nodeRegistry: Record<string, new () => NodeExecutor> = {
  http: HttpNode,
};

export function getNodeExecutor(nodeType: string): NodeExecutor {
  const NodeClass = nodeRegistry[nodeType];
  if (!NodeClass) {
    throw new Error(`Unknown node type: ${nodeType}`);
  }
  return new NodeClass();
}

export function registerNode(nodeType: string, nodeClass: new () => NodeExecutor): void {
  nodeRegistry[nodeType] = nodeClass;
}

export function getAvailableNodes(): string[] {
  return Object.keys(nodeRegistry);
}
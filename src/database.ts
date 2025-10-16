import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Workflow, Execution } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(process.cwd(), 'n8n.db');

class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Database connection error:', err);
      } else {
        console.log('Connected to SQLite database');
      }
    });
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(
          `CREATE TABLE IF NOT EXISTS workflows (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            definition TEXT NOT NULL,
            active INTEGER DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          )`,
          (err) => {
            if (err && !err.message.includes('already exists')) reject(err);
          }
        );

        this.db.run(
          `CREATE TABLE IF NOT EXISTS executions (
            id TEXT PRIMARY KEY,
            workflow_id TEXT NOT NULL,
            status TEXT NOT NULL,
            results TEXT NOT NULL,
            input TEXT,
            created_at TEXT NOT NULL,
            completed_at TEXT,
            FOREIGN KEY (workflow_id) REFERENCES workflows(id)
          )`,
          (err) => {
            if (err && !err.message.includes('already exists')) reject(err);
          }
        );

        this.db.run('CREATE INDEX IF NOT EXISTS idx_executions_workflow_id ON executions(workflow_id)', () => {
          resolve();
        });
      });
    });
  }

  async createWorkflow(workflow: Workflow): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO workflows (id, name, description, definition, active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          workflow.id,
          workflow.name,
          workflow.description,
          JSON.stringify({ nodes: workflow.nodes, connections: workflow.connections }),
          workflow.active ? 1 : 0,
          workflow.createdAt.toISOString(),
          workflow.updatedAt.toISOString(),
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getWorkflow(id: string): Promise<Workflow | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM workflows WHERE id = ?',
        [id],
        (err, row: any) => {
          if (err) reject(err);
          else if (!row) resolve(null);
          else {
            const definition = JSON.parse(row.definition);
            resolve({
              id: row.id,
              name: row.name,
              description: row.description,
              nodes: definition.nodes,
              connections: definition.connections,
              active: row.active === 1,
              createdAt: new Date(row.created_at),
              updatedAt: new Date(row.updated_at),
            });
          }
        }
      );
    });
  }

  async getAllWorkflows(): Promise<Workflow[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM workflows ORDER BY created_at DESC', (err, rows: any[]) => {
        if (err) reject(err);
        else {
          resolve(
            rows.map((row) => {
              const definition = JSON.parse(row.definition);
              return {
                id: row.id,
                name: row.name,
                description: row.description,
                nodes: definition.nodes,
                connections: definition.connections,
                active: row.active === 1,
                createdAt: new Date(row.created_at),
                updatedAt: new Date(row.updated_at),
              };
            })
          );
        }
      });
    });
  }

  async updateWorkflow(id: string, workflow: Partial<Workflow>): Promise<void> {
    return new Promise((resolve, reject) => {
      const definition = JSON.stringify({
        nodes: workflow.nodes,
        connections: workflow.connections,
      });
      this.db.run(
        `UPDATE workflows SET name = ?, description = ?, definition = ?, updated_at = ? WHERE id = ?`,
        [workflow.name, workflow.description, definition, new Date().toISOString(), id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async deleteWorkflow(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM workflows WHERE id = ?', [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async createExecution(execution: Execution): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO executions (id, workflow_id, status, results, input, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          execution.id,
          execution.workflowId,
          execution.status,
          JSON.stringify(execution.results),
          JSON.stringify(execution.input),
          execution.createdAt.toISOString(),
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async updateExecution(id: string, execution: Partial<Execution>): Promise<void> {
    return new Promise((resolve, reject) => {
      const updates: string[] = [];
      const values: any[] = [];

      if (execution.status) {
        updates.push('status = ?');
        values.push(execution.status);
      }
      if (execution.results) {
        updates.push('results = ?');
        values.push(JSON.stringify(execution.results));
      }
      if (execution.completedAt) {
        updates.push('completed_at = ?');
        values.push(execution.completedAt.toISOString());
      }

      values.push(id);
      this.db.run(`UPDATE executions SET ${updates.join(', ')} WHERE id = ?`, values, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async getExecution(id: string): Promise<Execution | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM executions WHERE id = ?', [id], (err, row: any) => {
        if (err) reject(err);
        else if (!row) resolve(null);
        else {
          resolve({
            id: row.id,
            workflowId: row.workflow_id,
            status: row.status,
            results: JSON.parse(row.results),
            input: JSON.parse(row.input || '{}'),
            createdAt: new Date(row.created_at),
            completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
          });
        }
      });
    });
  }

  async getExecutionsByWorkflow(workflowId: string, limit: number = 50): Promise<Execution[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM executions WHERE workflow_id = ? ORDER BY created_at DESC LIMIT ?',
        [workflowId, limit],
        (err, rows: any[]) => {
          if (err) reject(err);
          else {
            resolve(
              rows.map((row) => ({
                id: row.id,
                workflowId: row.workflow_id,
                status: row.status,
                results: JSON.parse(row.results),
                input: JSON.parse(row.input || '{}'),
                createdAt: new Date(row.created_at),
                completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
              }))
            );
          }
        }
      );
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export const database = new Database();
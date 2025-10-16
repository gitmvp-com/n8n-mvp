import type { NodeExecutor, NodeConfig } from '../types.js';

interface HttpConfig extends NodeConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export class HttpNode implements NodeExecutor {
  async execute(config: HttpConfig, input: any): Promise<any> {
    const url = config.url;
    const method = config.method || 'GET';
    const headers = config.headers || {};
    const timeout = config.timeout || 30000;

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal: AbortSignal.timeout(timeout),
    };

    if (method !== 'GET' && method !== 'HEAD' && config.body) {
      fetchOptions.body = typeof config.body === 'string' ? config.body : JSON.stringify(config.body);
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  }
}
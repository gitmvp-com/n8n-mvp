# n8n MVP - Minimal Workflow Automation Engine

A simplified version of n8n focusing on core workflow execution capabilities. This MVP demonstrates the fundamental concept of workflow automation with a REST API.

## Features

- **Workflow Management**: Create, read, update, and delete workflows
- **Workflow Execution**: Execute workflows with input data
- **Simple Node System**: HTTP Request node to demonstrate extensibility
- **SQLite Database**: Lightweight, file-based persistence
- **REST API**: Simple HTTP API for all operations
- **Execution History**: Track workflow executions

## Quick Start

### Prerequisites
- Node.js >= 22.16
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Workflows

**Create Workflow**
```bash
POST /api/workflows
Content-Type: application/json

{
  "name": "My Workflow",
  "description": "A sample workflow",
  "nodes": [
    {
      "id": "node1",
      "type": "http",
      "config": {
        "url": "https://api.example.com/data",
        "method": "GET"
      }
    }
  ],
  "connections": []
}
```

**Get All Workflows**
```bash
GET /api/workflows
```

**Get Workflow by ID**
```bash
GET /api/workflows/:id
```

**Update Workflow**
```bash
PUT /api/workflows/:id
Content-Type: application/json

{ ...workflow data... }
```

**Delete Workflow**
```bash
DELETE /api/workflows/:id
```

### Execution

**Execute Workflow**
```bash
POST /api/workflows/:id/execute
Content-Type: application/json

{
  "data": { /* input data */ }
}
```

**Get Execution History**
```bash
GET /api/executions?workflowId=:id
```

**Get Execution Details**
```bash
GET /api/executions/:executionId
```

## Project Structure

```
src/
├── index.ts              # Main entry point
├── server.ts             # Express server setup
├── database.ts           # Database initialization and queries
├── workflow/
│   ├── executor.ts       # Workflow execution engine
│   └── types.ts          # Workflow type definitions
├── nodes/
│   ├── index.ts          # Node registry
│   └── http.ts           # HTTP request node
└── routes/
    ├── workflows.ts      # Workflow routes
    └── executions.ts     # Execution routes
```

## Example Workflow

```json
{
  "name": "Fetch and Log",
  "description": "Fetch data from API and log it",
  "nodes": [
    {
      "id": "http1",
      "type": "http",
      "config": {
        "url": "https://jsonplaceholder.typicode.com/posts/1",
        "method": "GET"
      }
    }
  ],
  "connections": []
}
```

## Architecture

### Workflow Execution Flow

1. **Receive Request**: API receives workflow execution request
2. **Load Workflow**: Retrieve workflow definition from database
3. **Execute Nodes**: Execute each node in the workflow graph
4. **Collect Results**: Gather outputs from each node
5. **Save Execution**: Store execution record with results
6. **Return Response**: Return execution result to caller

### Database Schema

- **workflows**: Stores workflow definitions
- **executions**: Stores execution history and results

## Key Design Decisions for MVP

1. **SQLite**: Simple, file-based database requiring no external services
2. **Single Node Type**: HTTP node demonstrates the extensibility pattern
3. **Sequential Execution**: Simple linear workflow execution
4. **No Authentication**: MVP focuses on core functionality
5. **In-Memory Execution**: Fast execution without distributed processing

## Future Enhancements

- Multiple node types (Database, File, Email, etc.)
- Conditional flows and branching
- Error handling and retry logic
- Scheduled executions
- WebSocket support for real-time updates
- Web UI editor
- Authentication and authorization
- Distributed execution with workers

## License

MIT
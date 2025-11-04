# 🌍 Country Intelligence Agent (Mastra Integration)

This project demonstrates how to build an AI-powered Country Intelligence Agent using [Mastra](https://mastra.ai), capable of fetching real-time country data and responding in a conversational manner via JSON-RPC API.

---

## 🧠 Overview

The Country Intelligence Agent is designed to:

- Retrieve real-time country information (population, capital, region, currency, etc.).
- Estimate GDP based on population.
- Respond conversationally to users through a JSON-RPC route.
- Integrate with the Mastra AI orchestration framework for agents, workflows, and tools.

---

## ⚙️ Project Structure

```
src/
│
├── tools/
│   └── countryTool.ts           # Custom Mastra tool for fetching country data
│
├── agents/
│   └── countryAgent.ts          # Agent configured with model, memory, and tools
│
├── routes/
│   └── agentRoutes.ts           # JSON-RPC route handler for agent communication
│
├── index.ts                    # Mastra setup and configuration
└── ...
```

---

## Components

### 1. `countryTool.ts`

A Mastra Tool that fetches country data from the [REST Countries API](https://restcountries.com/).

Features:

- Fetches live data for all countries.
- Extracts name, population, capital, region, and currency.
- Generates a conversational summary.
- Produces a random GDP estimate based on population.

API Used:

```
https://restcountries.com/v3.1/all?fields=name,population,currencies,capital,region,subregion
```

Example Usage (inside an Agent):

```ts
const result = await countryTool.execute({ context: { country: "Nigeria" } });
console.log(result.response);
```

---

### 🧑‍🚀 2. `countryAgent.ts`

A Mastra Agent that uses the `countryTool` to intelligently respond to user queries.

Capabilities:

- Fetches real-world data using `countryTool`.
- Estimates GDP.
- Formats data for readability.
- Responds with a concise and structured explanation.

Configuration:

```ts
export const countryAgent = new Agent({
  name: "Country Intelligence Agent",
  model: "google/gemini-2.5-flash",
  tools: { countryTool },
  instructions: `You are a helpful and performance-driven agent specialized in providing information about countries.`,
  memory: new Memory({
    storage: new LibSQLStore({ url: ":memory:" }),
  }),
});
```

---

### 🌐 3. `a2aAgentRoute.ts`

A Mastra API Route registered via `registerApiRoute` to handle JSON-RPC 2.0 requests to agents.

Endpoint:

```
POST /a2a/agent/:agentId
```

Expected Request Format:

```json
{
  "jsonrpc": "2.0",
  "id": "request-001",
  "method": "message/send",
  "params": {
    "message": {
      "kind": "message",
      "role": "user",
      "parts": [{ "kind": "text", "text": "Tell me about Japan" }],
      "messageId": "msg-001",
      "taskId": "task-001"
    },
    "configuration": {
      "blocking": true
    }
  }
}
```

Response Example:

```json
{
  "jsonrpc": "2.0",
  "id": "request-001",
  "result": {
    "id": "generated-task-id",
    "status": {
      "state": "completed",
      "timestamp": "2025-11-04T12:00:00.000Z",
      "message": {
        "role": "agent",
        "parts": [
          { "kind": "text", "text": "Here's what I discovered about Japan..." }
        ]
      }
    },
    "kind": "task"
  }
}
```

---

### ⚡ 4. `mastra.ts`

Initializes Mastra with:

- Agents: `countryAgent`, `weatherAgent`
- Workflows: `weatherWorkflow`
- Scorers: `toolCallAppropriatenessScorer`, `completenessScorer`, `translationScorer`
- API Routes: `a2aAgentRoute`
-

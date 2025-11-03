import { registerApiRoute } from "@mastra/core/server";
import { randomUUID } from "crypto";

export const a2aAgentRoute = registerApiRoute("/a2a/agent/:agentId", {
  method: "POST",
  handler: async (c) => {
    try {
      const mastra = c.get("mastra");
      const agentId = c.req.param("agentId");
      const body = await c.req.json();
      const { jsonrpc, id: requestId, method, params } = body;

      if (jsonrpc !== "2.0" || !requestId) {
        return c.json(
          {
            jsonrpc: "2.0",
            id: requestId || null,
            error: {
              code: -32600,
              message:
                'Invalid Request: "jsonrpc" must be "2.0" and "id" is required.',
            },
          },
          400
        );
      }

      const agent = mastra.getAgent(agentId);
      if (!agent) {
        return c.json(
          {
            jsonrpc: "2.0",
            id: requestId,
            error: {
              code: -32602,
              message: `Agent '${agentId}' not found.`,
            },
          },
          404
        );
      }

      const { messages } = params || {};
      if (!Array.isArray(messages) || messages.length === 0) {
        return c.json(
          {
            jsonrpc: "2.0",
            id: requestId,
            error: {
              code: -32602,
              message: "Missing or invalid 'messages' parameter.",
            },
          },
          400
        );
      }

      const formattedMessages = messages.map((msg) => ({
        role: msg.role,
        content:
          msg.parts
            ?.map((part: any) =>
              part.kind === "text" ? part.text : JSON.stringify(part.data)
            )
            .join("\n") || "",
      }));

      const response = await agent.generate(formattedMessages);
      const agentText = response.text || "";

      const artifacts = [
        {
          artifactId: randomUUID(),
          name: `${agentId}Response`,
          parts: [{ kind: "text", text: agentText }],
        },
      ];

      return c.json({
        jsonrpc: "2.0",
        id: requestId,
        result: {
          id: randomUUID(),
          status: {
            state: "completed",
            timestamp: new Date().toISOString(),
            message: {
              messageId: randomUUID(),
              role: "agent",
              parts: [{ kind: "text", text: agentText }],
            },
          },
          artifacts,
          kind: "task",
        },
      });
    } catch (err: any) {
      return c.json(
        {
          jsonrpc: "2.0",
          id: null,
          error: {
            code: -32603,
            message: "Internal error",
            data: { details: err.message },
          },
        },
        500
      );
    }
  },
});

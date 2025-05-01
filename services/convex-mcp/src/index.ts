#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { ConvexClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { Id } from "../convex/_generated/dataModel.js";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import schema from "convex/schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: path.resolve(__dirname, "../.env") });

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}

const client = new ConvexClient(convexUrl);

const server = new Server(
  {
    name: "convex-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// Liste des ressources (notes et conversations)
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  // Récupérer les conversations
  const conversations = await client.query(api.conversations.list, {});

  // Récupérer les notes
  const notes = await client.query(api.notes.list, {});

  return {
    resources: [
      // Ajouter les conversations
      ...conversations.map(
        (conversation: { _id: Id<"conversations">; title: string }) => ({
          uri: `conversation:///${conversation._id}`,
          mimeType: "application/json",
          name: conversation.title,
          description: `Chat conversation: ${conversation.title}`,
        })
      ),
      // Ajouter les notes
      ...notes.map(
        (note: { _id: Id<"notes">; title: string; content: string }) => ({
          uri: `note:///${note._id}`,
          mimeType: "text/plain",
          name: note.title,
          description: `A text note: ${note.title}`,
        })
      ),
    ],
  };
});

// Lire une ressource spécifique (note ou conversation)
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const url = new URL(request.params.uri);
  const resourceType = url.protocol.replace(":", "");
  const resourceId = url.pathname.replace(/^\//, "");

  if (resourceType === "conversation") {
    try {
      const conversation = await client.query(api.conversations.get, {
        id: resourceId as Id<"conversations">,
      });

      if (!conversation) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          `Conversation ${resourceId} not found`
        );
      }

      const messages = await client.query(api.conversations.getMessages, {
        conversationId: resourceId as Id<"conversations">,
      });

      return {
        contents: [
          {
            uri: request.params.uri,
            mimeType: "application/json",
            text: JSON.stringify({ conversation, messages }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Invalid conversation ID: ${resourceId}`
      );
    }
  } else if (resourceType === "note") {
    try {
      const note = await client.query(api.notes.get, {
        id: resourceId as Id<"notes">,
      });

      if (!note) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          `Note ${resourceId} not found`
        );
      }

      return {
        contents: [
          {
            uri: request.params.uri,
            mimeType: "text/plain",
            text: note.content,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Invalid note ID: ${resourceId}`
      );
    }
  } else {
    throw new McpError(
      ErrorCode.InvalidRequest,
      `Invalid resource type: ${resourceType}`
    );
  }
});

// Liste des outils disponibles
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // Outil pour créer une note
      {
        name: "create_note",
        description: "Create a new note",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Title of the note",
            },
            content: {
              type: "string",
              description: "Text content of the note",
            },
          },
          required: ["title", "content"],
        },
      },
      // Outil pour créer une conversation
      {
        name: "create_conversation",
        description: "Create a new chat conversation",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Title of the conversation",
            },
            userId: {
              type: "string",
              description: "User ID (optional)",
            },
          },
          required: ["title"],
        },
      },
      // Outil pour ajouter un message
      {
        name: "add_message",
        description: "Add a message to a conversation",
        inputSchema: {
          type: "object",
          properties: {
            conversationId: {
              type: "string",
              description: "ID of the conversation",
            },
            content: {
              type: "string",
              description: "Message content",
            },
            isUser: {
              type: "boolean",
              description:
                "True if the message is from the user, false if from the AI",
            },
            metadata: {
              type: "object",
              description: "Additional metadata (optional)",
            },
          },
          required: ["conversationId", "content", "isUser"],
        },
      },
      // Ajouter l'outil d'analyse de wallet
      {
        name: "analyze_wallet",
        description: "Analyze Solana wallet performance",
        inputSchema: {
          type: "object",
          properties: {
            conversationId: {
              type: "string",
              description: "ID of the conversation",
            },
            walletAddress: {
              type: "string",
              description: "Solana wallet address to analyze",
            },
            question: {
              type: "string",
              description: "User's question about the wallet",
            },
          },
          required: ["conversationId", "walletAddress", "question"],
        },
      },
    ],
  };
});

// Gestion des appels d'outils
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "create_note": {
      const title = String(request.params.arguments?.title);
      const content = String(request.params.arguments?.content);

      if (!title || !content) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "Title and content are required"
        );
      }

      const id = await client.mutation(api.notes.create, { title, content });

      return {
        content: [
          {
            type: "text",
            text: `Created note ${id}: ${title}`,
          },
        ],
      };
    }

    case "create_conversation": {
      const title = String(request.params.arguments?.title);
      const userId = request.params.arguments?.userId as string | undefined;

      if (!title) {
        throw new McpError(ErrorCode.InvalidParams, "Title is required");
      }

      const id = await client.mutation(api.conversations.create, {
        title,
        userId,
      });

      return {
        content: [
          {
            type: "text",
            text: `Created conversation ${id}: ${title}`,
          },
        ],
      };
    }

    case "add_message": {
      const conversationId = String(request.params.arguments?.conversationId);
      const content = String(request.params.arguments?.content);
      const isUser = Boolean(request.params.arguments?.isUser);
      const metadata = request.params.arguments?.metadata;

      if (!conversationId || !content) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "Conversation ID and content are required"
        );
      }

      const id = await client.mutation(api.conversations.addMessage, {
        conversationId: conversationId as Id<"conversations">,
        content,
        isUser,
        metadata,
      });

      return {
        content: [
          {
            type: "text",
            text: `Added message ${id} to conversation ${conversationId}`,
          },
        ],
      };
    }
    
    case "analyze_wallet": {
      const conversationId = String(request.params.arguments?.conversationId);
      const walletAddress = String(request.params.arguments?.walletAddress);
      const question = String(request.params.arguments?.question);
    
      if (!conversationId || !walletAddress) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "Conversation ID and wallet address are required"
        );
      }
    
      const analysis = await client.mutation(api.walletAnalysis.analyzeWallet, {
        conversationId: conversationId as Id<"conversations">,
        walletAddress,
        userQuestion: question,
      });
    
      return {
        content: [
          {
            type: "text",
            text: analysis.analysis.textResponse,
          },
        ],
      };
    }

    default:
      throw new McpError(ErrorCode.MethodNotFound, "Unknown tool");
  }
});

// Démarrage du serveur
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Convex MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});

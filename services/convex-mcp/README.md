# Convex MCP Server

The Convex MCP Server serves as an interface between Claude and our Convex database. It allows Claude to interact with user data, store conversations, and perform wallet analyses via the Solana AI Agent.

## Features

### Resources
- List and access notes via `note://` URIs and conversations via `conversation://` URIs
- Each note has a title, content, and metadata
- Plain text mime type for notes, JSON for conversations
- Conversations contain messages with user-submitted content and AI responses

### Tools
- `create_note` - Create new text notes with title and content
- `create_conversation` - Start a new conversation thread
- `add_message` - Add user or AI messages to a conversation
- `analyze_wallet` - Analyze Solana wallet performance and store results

## Architecture

The server works as a bridge between Claude's MCP protocol and Convex's database services:

```
┌─────────┐     ┌───────────────┐     ┌────────────┐     ┌───────────────┐
│  Claude │<--->│ Convex MCP    │<--->│  Convex    │<--->│ Solana AI     │
│ Desktop │     │ Server        │     │ Database   │     │ Agent (WIP)   │
└─────────┘     └───────────────┘     └────────────┘     └───────────────┘
```

## Data Flow
1. The user asks a question to Claude via web or mobile interface
2. Claude uses the MCP protocol to communicate with our server
3. The MCP server translates requests into Convex API calls
4. For wallet analyses, the MCP server calls the Solana AI Agent
5. Results are stored in Convex and returned to Claude

## Development Setup

### Prerequisites
- Node.js v16 or higher
- npm or yarn
- A Convex account and project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/convex-mcp-server.git
cd convex-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your Convex credentials:
```
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
```

4. Build the server:
```bash
npm run build
```

### Running Convex Development Server

```bash
npx convex dev
```

### Running the MCP Server

```bash
npm start
```

## Integration with Claude Desktop

On MacOS: Edit `~/Library/Application Support/Claude/claude_desktop_config.json`  
On Windows: Edit `%APPDATA%/Claude/claude_desktop_config.json`

Add the following configuration:
```json
{
  "mcpServers": {
    "convex-mcp-server": {
      "command": "/path/to/convex-mcp-server/build/index.js"
    }
  }
}
```

### Debugging

For debugging MCP communication, use the MCP Inspector:
```bash
npm run inspector
```

## Current Limitations

- The wallet analysis feature is currently implemented as a simulation
- Integration with the Solana AI Agent is still in progress
- The server is in active development and APIs may change

## Example Prompts for Testing

### Creating a Note
```
Claude, please create a note titled "Project Ideas" with content: "1. Implement wallet analytics dashboard, 2. Add token swap feature, 3. Improve mobile UI"
```

### Creating a Conversation
```
Claude, create a new conversation called "Solana Development" and add a message about starting our DeFi project planning.
```

### Analyzing a Wallet (Simulation)
```
Can you analyze the performance of this Solana wallet: ATgo6tTtunfrZWQ4Wo9iKYaDTYi1PBXeKKsVEFLofYKc
```

## Next Steps

- Complete integration with Solana AI Agent for real-time wallet analytics
- Add support for NFT analysis and portfolio recommendations
- Implement user authentication for wallet ownership verification
- Create a dashboard to visualize conversation and analysis history

---

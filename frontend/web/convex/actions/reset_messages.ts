"use node"; // Add this directive for Node.js environment

import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";

// Define the return type explicitly
interface ResetResult {
  deleted: number;
}

// Add proper type annotations to avoid self-reference error
export const resetAllMessages = action({
  args: {},
  handler: async (ctx: any): Promise<ResetResult> => {
    // Get all messages
    const messages = await ctx.runQuery(api.messages.getAllMessages);
    
    // Delete each message
    for (const message of messages) {
      await ctx.runMutation(api.messages.deleteMessage, { id: message._id });
    }
    
    return { deleted: messages.length };
  },
});
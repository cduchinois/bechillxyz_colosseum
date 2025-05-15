// messages.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Add a timestamp to track when messages were created
export const sendMessage = mutation({
  args: {
    role: v.union(v.literal("user"), v.literal("assistant")),
    text: v.string(),
    time: v.string(),
    profile: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      ...args,
      createdAt: Date.now(), // Add timestamp
    });
  },
});

// First step: keep the existing query to maintain compatibility
export const getMessages = query({
  args: { profile: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("profile"), args.profile))
      .collect();
  },
});

// Add a new query that accepts sessionId
export const getSessionMessages = query({
  args: { 
    profile: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .filter((q) => 
        q.and(
          q.eq(q.field("profile"), args.profile),
          q.eq(q.field("sessionId"), args.sessionId)
        )
      )
      .collect();
  },
});

// Optional: Add a mutation to clear messages if needed
export const clearMessages = mutation({
  args: { profile: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("profile"), args.profile))
      .collect();
    
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
  },
});

// Get all messages (for admin/reset purposes)
export const getAllMessages = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("messages").collect();
  },
});

// Delete a specific message
export const deleteMessage = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
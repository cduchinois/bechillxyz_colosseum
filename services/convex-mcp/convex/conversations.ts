// conversations.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Créer une nouvelle conversation
export const create = mutation({
  args: {
    title: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return ctx.db.insert("conversations", {
      title: args.title,
      createdAt: now,
      updatedAt: now,
      userId: args.userId,
    });
  },
});

// Lister toutes les conversations
export const list = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("conversations").order("desc");
    
    if (args.userId) {
      query = query.filter(q => q.eq(q.field("userId"), args.userId));
    }
    
    return query.collect();
  },
});

// Obtenir une conversation par ID
export const get = query({
  args: {
    id: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id);
  },
});

// Ajouter un message à une conversation
export const addMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    isUser: v.boolean(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Mettre à jour l'horodatage de la conversation
    await ctx.db.patch(args.conversationId, {
      updatedAt: Date.now(),
    });
    
    // Ajouter le message
    return ctx.db.insert("messages", {
      conversationId: args.conversationId,
      content: args.content,
      isUser: args.isUser,
      timestamp: Date.now(),
      metadata: args.metadata,
    });
  },
});

// Récupérer tous les messages d'une conversation
export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("messages")
      .filter(q => q.eq(q.field("conversationId"), args.conversationId))
      .order("asc")
      .collect();
  },
});
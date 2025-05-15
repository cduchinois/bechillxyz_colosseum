import { mutation, query } from "../convex/_generated/server";
import { v } from "convex/values";

// Enregistrement d’un message
export const sendMessage = mutation({
  args: {
    role: v.union(v.literal("user"), v.literal("assistant")),
    text: v.string(),
    time: v.string(),
    profile: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", args);
  },
});

// Récupération de l’historique d’un profil
export const getMessages = query({
  args: { profile: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("profile"), args.profile))
      .collect();
  },
});

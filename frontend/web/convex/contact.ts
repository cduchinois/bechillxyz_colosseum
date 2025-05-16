// /convex/contact.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const addContact = mutation({
  args: {
    email: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("contacts", {
      email: args.email,
      message: args.message ?? "",
      createdAt: Date.now(),
    });
  },
});

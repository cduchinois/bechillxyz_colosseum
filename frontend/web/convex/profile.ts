import { mutation } from "../convex/_generated/server";
import { v } from "convex/values";

// Upsert pour le profil utilisateur
export const upsertProfile = mutation({
  args: {
    profileName: v.string(),
    userData: v.any(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .filter((q) => q.eq(q.field("profileName"), args.profileName))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { userData: args.userData });
    } else {
      await ctx.db.insert("profiles", args);
    }
  },
});

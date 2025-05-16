// schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  contacts: defineTable({
    email: v.string(),
    message: v.string(),
    createdAt: v.number(),
  }),
  messages: defineTable({
    role: v.union(v.literal("user"), v.literal("assistant")),
    text: v.string(),
    time: v.string(),
    profile: v.string(),
    // Make new fields optional for backward compatibility
    sessionId: v.optional(v.string()),
    createdAt: v.optional(v.number()),
  }),
  profiles: defineTable({
    profileName: v.string(),
    userData: v.any(),
  }),
});
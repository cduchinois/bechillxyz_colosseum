// schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export default defineSchema({
    // Conserver vos tables existantes
    notes: defineTable({
        title: v.string(),
        content: v.string(),
    }),
    // Table pour les conversations
    conversations: defineTable({
        title: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
        userId: v.optional(v.string()),
        walletAddress: v.optional(v.string()), // Ajout pour Solana
        conversationType: v.optional(v.string()), // ex: "wallet_analysis"
    }),
    // Table pour les messages, avec des champs pertinents pour l'analyse
    messages: defineTable({
        conversationId: v.id("conversations"),
        content: v.string(),
        isUser: v.boolean(),
        timestamp: v.number(),
        metadata: v.optional(v.any()), // Pour stocker des analyses ou données spécifiques
        walletData: v.optional(v.any()), // Pour stocker des données de performance
        agentResponse: v.optional(v.any()), // Pour stocker la réponse de votre agent
    })
});

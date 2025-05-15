// src/app/api/chat/route.ts

import { NextRequest, NextResponse } from "next/server";
import { handleSolanaCommand } from "@/chat/solanaCommands";

// Main function to handle chat requests
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userInput, profileName } = body;

    if (!userInput || typeof userInput !== "string") {
      return NextResponse.json(
        { error: "'userInput' parameter is required and must be a string" },
        { status: 400 }
      );
    }

    // Check if it's a Solana command
    const solanaResult = await handleSolanaCommand(userInput);

    if (solanaResult) {
      // Directly return the result for Solana commands
      return NextResponse.json({ 
        reply: solanaResult.content,
        type: solanaResult.type,
        metadata: solanaResult.metadata
      });
    }

    // If it's not a Solana command, treat it as a regular message
    // Call your usual LLM processing here
    const reply = await generateAIResponse(userInput, profileName);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Simulated function to generate an AI response
// Replace with your actual API call
async function generateAIResponse(userInput: string, profileName: string): Promise<string> {
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3", // ou le nom exact de ton modèle
        prompt: `You are CHILL, a helpful crypto portfolio assistant. A user named ${profileName} asked:\n\n${userInput}\n\nGive a clear and concise answer.`,
        stream: false
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Ollama error: ${response.status} ${text}`);
    }

    const data = await response.json();
    return data.response.trim();
  } catch (error) {
    console.error("Ollama LLM error:", error);
    return "I'm having trouble accessing my brain right now. Try again in a bit.";
  }
}


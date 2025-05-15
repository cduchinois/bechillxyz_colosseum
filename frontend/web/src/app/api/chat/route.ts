import { runChatFlow } from "@/lib/ollamaChatRunner";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userInput, profileName } = await req.json();

  try {
    const reply = await runChatFlow(userInput, profileName);
    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json({ error: "Chat error", details: String(err) }, { status: 500 });
  }
}

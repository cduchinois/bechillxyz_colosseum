import fs from "fs/promises";
import path from "path";
import { chatLoop, UserProfile } from "@/chat/chatLoop";

/**
 * Fonction principale appelée par l’API route.
 * Elle charge le profil utilisateur et lance la boucle de chat.
 * 
 * @param userInput - Le message de l’utilisateur
 * @param profileName - Nom du fichier dans le dossier user_profiles (ex: "jack.json")
 * @returns La réponse du chatbot (string)
 */
export async function runChatFlow(userInput: string, profileName: string): Promise<string> {
  try {
    const profilePath = path.resolve("user_profiles", profileName);
    const profileRaw = await fs.readFile(profilePath, "utf-8");
    const userProfile: UserProfile = JSON.parse(profileRaw);

    const reply = await chatLoop(userInput, userProfile);
    return reply;
  } catch (err) {
    console.error("🔥 Error in runChatFlow:", err); // Log this to see the root cause
    throw new Error("Impossible de générer une réponse depuis le moteur LLM.");
  }
}



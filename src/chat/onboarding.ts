import { ChatSession } from './chatLoop';
import readline from 'readline';

async function askText(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

async function askChoice(rl: readline.Interface, question: string, options: string[]): Promise<string> {
  console.log(question);
  options.forEach((opt, i) => console.log(`  [${i + 1}] ${opt}`));
  while (true) {
    const answer = await askText(rl, 'Choose a number: ');
    const idx = parseInt(answer, 10) - 1;
    if (idx >= 0 && idx < options.length) return options[idx];
    console.log('Please enter a valid number.');
  }
}

export async function runOnboarding(session: ChatSession) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  // Intro
  console.log("\nhey there 👋 i'm chill.\nyour personal crypto coach — here to help you grow your bag with clarity and calm.\n100% support, 0 judgment.\ni'll guide you through a quick 2-min setup to personalize your chill experience.\nafter that, you'll get full access to the app.\n");
  await askChoice(rl, "ready to start?", ["[ let's do this 🤝 ]"]);

  // Q1 — name & user type
  session.user.name = await askText(rl, "first thing first, what's your name? ");
  console.log(`\nnice to meet you, ${session.user.name}.`);
  session.user.type = await askChoice(rl, "how do you see yourself in crypto?", [
    "just starting out",
    "investor, here for the long run",
    "full degen 💥",
  ]);
  session.user.ref = await askChoice(rl, "and how'd you hear about chill?", [
    "twitter / x",
    "telegram",
    "superteam",
    "jade",
    "other",
  ]);

  // Q2 — your goal
  session.user.goalVibe = await askChoice(rl, "what's your vibe right now?", [
    "i don't really have a plan, justexplore and grow my bag",
    "i've already built a solid bag, now i want to secure it",
    "i'm here for big gains — which means big risks too sometimes",
  ]);

  // Q3 — wallet connect
  const walletChoice = await askChoice(rl, "to give you better insights, we'll take a quick look at your wallet.\nwe don't store anything — just use it to help you stay aligned with your goals.", [
    "connect wallet",
    "paste address",
    "skip",
  ]);

  if (walletChoice === "skip") {
    console.log("\nno worries. here's a wallet from someone aiming for \"steady growth\"...\n");
    await new Promise((res) => setTimeout(res, 1000));
    console.log("but they've got 88% in altcoins — high risk, no hedge.\nnot exactly chill.\n");
    console.log("what about you? let's get you set up with your own chill space — built around your goals.\n");
    console.log("[ enter my chill space ]\n");
    await new Promise((res) => setTimeout(res, 1200));
  } else {
    console.log("\nscanning your wallet...\nchecking alignment with your vibe, asset mix, and risk profile...\n");
    await new Promise((res) => setTimeout(res, 5000 + Math.random() * 2000));
    // Simulate chill score
    const chillScore = Math.floor(40 + Math.random() * 61); // 40-100
    console.log(`your chill score is ${chillScore} / 100\n`);
    if (chillScore >= 80) {
      console.log("you're in sync. your bag matches your goals.\nenter the chill space to keep momentum and explore more ways to stay balanced and just chill.\n");
    } else if (chillScore >= 60) {
      console.log("solid foundation, but there's room to sharpen things.\nchill can help you fine-tune it inside your chill space.\n");
    } else {
      console.log("your vibe and your wallet are clashing...but no worries, chill will help you fix that — chill space has suggestions ready for you.\n");
    }
    console.log("[ enter chill space ]\n");
    await new Promise((res) => setTimeout(res, 1200));
  }
  rl.close();
} 
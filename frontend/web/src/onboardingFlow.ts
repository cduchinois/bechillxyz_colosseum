// CHILL Onboarding Conversation Flow as TypeScript structure

export interface OnboardingStep {
  id: string;
  speaker: 'chill' | 'user';
  text: string;
  type: 'info' | 'input' | 'button' | 'llm';
  storeKey?: string;
  options?: { label: string; value: string; nextStep: string }[];
  nextStep?: string;
  callAnalytics?: boolean;
  callOnChainStub?: boolean;
  useRAG?: boolean;
  useLLM?: boolean;
  delayMs?: number;
}

export const onboardingFlow: OnboardingStep[] = [
  {
    id: 'start',
    speaker: 'chill',
    text: 'chill helps you get control over your crypto — and stay calm doing it.',
    type: 'info',
    nextStep: 'getStarted',
  },
  {
    id: 'getStarted',
    speaker: 'chill',
    text: '[ get started ]',
    type: 'button',
    options: [
      { label: 'get started', value: 'start', nextStep: 'greetName' },
    ],
  },
  {
    id: 'greetName',
    speaker: 'chill',
    text: 'hey. i\'m chill — your crypto peace coach.\nwhat should i call you?',
    type: 'input',
    storeKey: 'user.name',
    nextStep: 'pickGoal',
  },
  {
    id: 'pickGoal',
    speaker: 'chill',
    text: 'nice to meet you, [name].\nwhat\'s your main goal with crypto?',
    type: 'button',
    options: [
      { label: 'secure my wealth', value: 'secure', nextStep: 'getWallet' },
      { label: 'grow it steadily', value: 'grow', nextStep: 'getWallet' },
      { label: 'take big risks', value: 'risk', nextStep: 'getWallet' },
    ],
    storeKey: 'user.goal',
  },
  {
    id: 'getWallet',
    speaker: 'chill',
    text: 'got it. to help you stay on track, i need to look at your portfolio.\ni don\'t track or store anything — just analyze and give insights.\nthis is all local, all yours.',
    type: 'button',
    options: [
      { label: 'connect wallet', value: 'connect', nextStep: 'analyzeReal' },
      { label: 'paste address', value: 'paste', nextStep: 'analyzeReal' },
      { label: 'skip', value: 'skip', nextStep: 'skipped' },
    ],
    storeKey: 'user.walletSource',
  },
  {
    id: 'skipped',
    speaker: 'chill',
    text: 'ok, no stress. i\'ll show you an example with a public wallet.\nthis one belongs to a trader who wanted to grow steadily...',
    type: 'info',
    delayMs: 1000,
    nextStep: 'skipped2',
  },
  {
    id: 'skipped2',
    speaker: 'chill',
    text: '...but they\'ve got 88% in altcoins. high volatility, no backup.\nnot really what you\'d call "steady growth", right?',
    type: 'info',
    nextStep: 'analyzeSample',
  },
  {
    id: 'analyzeReal',
    speaker: 'chill',
    text: 'scanning your assets...\nchecking for concentration, risk, and behavior...',
    type: 'llm',
    callAnalytics: true,
    useRAG: true,
    useLLM: true,
    delayMs: 6000,
    nextStep: 'analysisResult',
  },
  {
    id: 'analyzeSample',
    speaker: 'chill',
    text: 'scanning sample assets...\nchecking for concentration, risk, and behavior...',
    type: 'llm',
    callAnalytics: true,
    useRAG: true,
    useLLM: true,
    delayMs: 6000,
    nextStep: 'analysisResult',
  },
  {
    id: 'analysisResult',
    speaker: 'chill',
    text: '(give analysis: e.g., "You have 60% in ETH, 30% in stablecoins, 10% in altcoins. Your portfolio is moderately diversified, but could be more balanced for your goal.")',
    type: 'llm',
    useLLM: true,
    nextStep: 'advice',
  },
  {
    id: 'advice',
    speaker: 'chill',
    text: '(give advice: e.g., "Suggestion: move 10% of [token] to a stablecoin — same potential, lower chaos. Want me to remind you later too?")',
    type: 'button',
    options: [
      { label: 'do it', value: 'do', nextStep: 'onChain' },
      { label: 'save suggestion', value: 'save', nextStep: 'chillScore' },
    ],
  },
  {
    id: 'onChain',
    speaker: 'chill',
    text: 'Executing on-chain action (stub)...',
    type: 'info',
    callOnChainStub: true,
    nextStep: 'chillScore',
  },
  {
    id: 'chillScore',
    speaker: 'chill',
    text: 'based on what I saw, your current chill score is xx\na bit chaotic — but now you know. / or it\'s already quite chill\nlet\'s work on raising it together.\n\n→ [ enter chill club ]',
    type: 'info',
    nextStep: 'end',
  },
  {
    id: 'end',
    speaker: 'chill',
    text: 'Onboarding complete! Welcome to the main chat.',
    type: 'info',
  },
]; 
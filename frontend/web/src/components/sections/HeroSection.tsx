import Image from "next/image";

type HeroSectionProps = {
  userWallet: string | null;
  onLogin: () => void;
  onLogout: () => void;
  walletReviewed: boolean;
};

export default function HeroSection({
  userWallet,
  onLogin,
  onLogout,
  walletReviewed,
}: HeroSectionProps) {
  return (
    <section className="container mx-auto px-4 py-16 min-h-10 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center text-center w-full max-w-3xl">
        <div className="flex justify-center mb-6 items-center">
          <div className="relative w-28 h-28 rounded-full flex items-center justify-center mr-3">
            <Image
              src="/img/bechill-head1.png"
              alt="BeChill Logo"
              fill
              className="object-contain p-1"
              priority
            />
          </div>
          <span className="text-4xl font-bold text-purple-900">beChill</span>
        </div>

        <h1 className="md:text-6xl text-4xl font-bold mb-8 text-purple-900 font-serif">
          <span className="block">Chill,</span>
          <span className="block">your personal asset manager</span>
          <span className="block">powered by Solana</span>
        </h1>

        <p className="text-xl mb-10 text-purple-900 max-w-lg font-serif">
          Take control of your digital assets with our AI-powered manager.
          Track, analyze, and optimize your portfolio with just a few clicks
        </p>

        {!userWallet ? (
          <button
            onClick={onLogin}
            className="px-10 py-4 bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold rounded-full shadow-lg transform transition hover:scale-105"
          >
            CONNECT WALLET
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-lg inline-block shadow-sm">
              <p className="text-lg text-purple-900">
                ✅ Connected: {userWallet.slice(0, 6)}...{userWallet.slice(-4)}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white text-lg font-bold rounded-full shadow-lg transform transition hover:scale-105"
            >
              DISCONNECT
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

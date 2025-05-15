import EmojiLogo from "@/components/common/EmojiLogo";
import WalletStatus from "@/components/common/WalletStatus";

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
}: HeroSectionProps) {
  return (
    <section className="container mx-auto px-4 py-16 min-h-10 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center text-center w-full max-w-3xl">
        <div className="flex justify-center mb-6 items-center">
          <div className="relative mr-3">
            <EmojiLogo size="md" trackMouse={true} />
          </div>
        </div>

        <h1 className="md:text-6xl text-4xl mb-8 text-lavender-400 font-serif font-normal">
          <span className="block">Talk to your wallet</span>
          <span>not a spreadsheet</span>
        </h1>

        <p className="text-4xl mb-10 text-lavender-400 font-sans font-light">
          Real insights. Smart moves. Chill vibes only.
        </p>

        <WalletStatus userWallet={userWallet} onLogin={onLogin} onLogout={onLogout} />
      </div>
    </section>
  );
}

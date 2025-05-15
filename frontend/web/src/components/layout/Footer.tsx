import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-transparent mt-20">
      <div className="container mx-auto px-4 py-10 text-center text-purple-900/80 text-sm space-y-4">
        <p>© 2025 BeChill. All rights reserved. Powered by Solana.</p>

        <div className="flex justify-center gap-4 text-xs text-purple-800/70">
          <Link href="/legal-notice" className="hover:underline">
            Legal Notice
          </Link>
          <span>|</span>
          <Link href="/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
          <span>|</span>
          <Link href="/terms" className="hover:underline">
            Terms of Use
          </Link>
        </div>
      </div>
    </footer>
  );
}

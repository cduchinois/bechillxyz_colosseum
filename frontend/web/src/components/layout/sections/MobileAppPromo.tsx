"use client";

import Image from "next/image";

export default function MobileAppPromo() {
  return (
    <section className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-3xl font-bold mb-8 font-serif">📱 Coming soon</h2>

      {/* Responsive layout: vertical on mobile, overlapping horizontal on desktop */}
      <div className="flex flex-col md:flex-row items-center justify-center md:space-x-6 space-y-6 md:space-y-0">
        <div className="w-48 sm:w-56 md:w-60">
          <Image
            src="/img/mobile1.png"
            alt="Chill app screen 1"
            width={250}
            height={500}
            className="w-full h-auto"
          />
        </div>
        <div className="w-48 sm:w-56 md:w-60">
          <Image
            src="/img/mobile2.png"
            alt="Chill app screen 2"
            width={250}
            height={500}
            className="w-full h-auto"
          />
        </div>
        <div className="w-48 sm:w-56 md:w-60">
          <Image
            src="/img/mobile3.png"
            alt="Chill app screen 3"
            width={250}
            height={500}
            className="w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
}

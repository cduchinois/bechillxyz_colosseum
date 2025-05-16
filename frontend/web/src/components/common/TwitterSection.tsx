
    function XIcon({ className = "w-8 h-8" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 32 32"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="16" fill="#540CCC" />
      <path
        d="M19.643 9.143h2.571l-5.243 5.952 6.19 7.762h-4.866l-3.814-4.858-4.366 4.858h-2.577l5.58-6.202-6.002-7.512h4.864l3.627 4.737 4.236-4.737zm-1.024 11.426h1.424l-4.007-5.155-1.436 1.613 4.019 5.155z"
        fill="#fff"
      />
    </svg>
  );
}

  

export default function FollowUsOnTwitter() {
  return (
    <section className="max-w-md mx-auto mt-8 flex flex-col items-center gap-4">
      <h3 className="flex items-center gap-1 text-4xl font-semibold font-serif">
        Follow us on
        <span className="inline-flex items-center">
          <XIcon className="w-10 h-10 ml-2" />
        </span>
      </h3>

      <a
        href="https://twitter.com/bechillxyz"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-5 py-2 rounded-full bg-lavender-400 text-white font-bold shadow hover:bg-blue-700 transition"
        style={{ backgroundColor: "#540CCC", color: "#FFFF4F" }} // Couleur personnalisée
      >
        @bechillxyz
      </a>
      <p className="text-gray-600 text-xl text-center font-sans text-lavender-400">
        Stay tuned for the latest updates!
      </p>
    </section>
  );
}
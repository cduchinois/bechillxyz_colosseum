"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";

export default function ContactForm() {
  const addContact = useMutation(api.contact.addContact);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await addContact({ email });
      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <section className="max-w-md mx-4 md:mx-auto my-20 p-8 rounded-2xl shadow-lg bg-white">
      <h2 className="text-4xl font-bold mb-2 text-center font-serif">BeChill Mobile</h2>
      <h2 className="text-4xl font-bold mb-4 text-center font-serif">Launch 🚀</h2>
      <p className="mb-6 text-center text-gray-600 font-sans text-xl">Enter your email to be notified when our mobile app launches!</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          id="email"
          type="email"
          required
          className="border rounded p-3 focus:outline-none font-sans"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@email.com"
        />
        <button
          type="submit"
          className=" text-white py-2 rounded-lg font-monument font-bold transition"
          style={{ backgroundColor: "#540CCC" }}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Sending..." : "Notify me"}
        </button>
        {status === "success" && (
          <p className="text-lavender-400 text-center font-sans">Thank you! We'll notify you when BeChill mobile launches</p>
        )}
        {status === "error" && (
          <p className="text-red-600 text-center font-sans">Error. Please try again later.</p>
        )}
      </form>
    </section>
  );
}

"use client";
import React, { useState, useEffect } from "react";

interface StoryPage {
  id: string;
  title: string;
  description: string;
  value: string;
  backgroundColor: string;
  icon?: string;
}

interface WalletStoryProps {
  onClose: () => void;
  onComplete: () => void;
}

export default function WalletStoryWeb({ onClose, onComplete }: WalletStoryProps) {
  const storyPages: StoryPage[] = [
    {
      id: "1",
      title: "Your Monthly Return",
      description: "Overall performance",
      value: "+5.8%",
      backgroundColor: "#7B4EFF",
      icon: "📈",
    },
    {
      id: "2",
      title: "Portfolio Value",
      description: "Growth over 30 days",
      value: "$9,420 → $9,966",
      backgroundColor: "#FF6B6B",
      icon: "💰",
    },
    {
      id: "3",
      title: "Top Performer",
      description: "$JUP token pumped",
      value: "+24.4%",
      backgroundColor: "#4CAF50",
      icon: "🚀",
    },
    {
      id: "4",
      title: "Steady Anchor",
      description: "Your $SOL holdings",
      value: "+7.8%",
      backgroundColor: "#1E88E5",
      icon: "⚓",
    },
    {
      id: "5",
      title: "Investment Strategy",
      description: "Your approach is working",
      value: "CHILL & GROW",
      backgroundColor: "#9C27B0",
      icon: "🌱",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < storyPages.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // dernière page
      onComplete();
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const currentPage = storyPages[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div
        className="relative w-full max-w-md h-[600px] rounded-lg overflow-hidden shadow-2xl flex flex-col items-center justify-center text-center px-6"
        style={{ backgroundColor: currentPage.backgroundColor }}
      >
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-black bg-opacity-30 rounded-full"
        >
          <span className="text-white">✕</span>
        </button>

        {/* Contenu de la page */}
        <div className="flex flex-col items-center justify-center flex-1 space-y-4">
          {/* Icône */}
          <div className="text-6xl">{currentPage.icon}</div>

          {/* Titre */}
          <h2 className="text-white text-3xl font-bold">{currentPage.title}</h2>

          {/* Description */}
          <p className="text-white text-opacity-80 text-lg">{currentPage.description}</p>

          {/* Valeur */}
          <div className="text-white text-5xl font-bold">{currentPage.value}</div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between w-full px-6 pb-6">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="text-white text-sm disabled:opacity-30"
          >
            Prev
          </button>
          <button
            onClick={handleNext}
            className="text-white text-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

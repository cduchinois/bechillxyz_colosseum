"use client";
import React, { useEffect, useState } from "react";

interface CloudProps {
  id: number;
  currentPosition: number;
  yPosition: number;
  size: number;
  speed: number;
  direction: "ltr" | "rtl";
  zIndex: number;
}

export default function AnimatedClouds() {
  const [clouds, setClouds] = useState<CloudProps[]>([]);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);

      const newClouds: CloudProps[] = [
        {
          id: 1,
          currentPosition: 50,
          yPosition: 100,
          size: 0.9,
          speed: 0.2,
          direction: "ltr",
          zIndex: -10,
        },
        {
          id: 2,
          currentPosition: window.innerWidth + 100,
          yPosition: 300,
          size: 1.2,
          speed: 0.30,
          direction: "rtl",
          zIndex: -9,
        },
        {
          id: 3,
          currentPosition: 100,
          yPosition: 500,
          size: 0.6,
          speed: 0.25,
          direction: "ltr",
          zIndex: -10,
        },
        {
          id: 4,
          currentPosition: window.innerWidth + 50,
          yPosition: 150,
          size: 1.0,
          speed: 0.50,
          direction: "rtl",
          zIndex: -9,
        },
        {
          id: 5,
          currentPosition: 200,
          yPosition: 400,
          size: 0.7,
          speed: 0.22,
          direction: "ltr",
          zIndex: -10,
        },
      ];

      setClouds(newClouds);

      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    if (windowWidth === 0) return;

    const cloudWidth = 200;

    const interval = setInterval(() => {
      setClouds((prev) =>
        prev.map((cloud) => {
          let next = cloud.currentPosition;

          if (cloud.direction === "ltr") {
            next += cloud.speed;
            if (next > windowWidth + cloudWidth * cloud.size) {
              next = -cloudWidth * cloud.size;
            }
          } else {
            next -= cloud.speed;
            if (next < -cloudWidth * cloud.size) {
              next = windowWidth + cloudWidth * cloud.size;
            }
          }

          return { ...cloud, currentPosition: next };
        })
      );
    }, 16); // 60 fps

    return () => clearInterval(interval);
  }, [windowWidth]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {clouds.map((cloud) => (
        <div
          key={cloud.id}
          style={{
            position: "absolute",
            left: cloud.currentPosition,
            top: cloud.yPosition,
            transform: `scale(${cloud.size})`,
            opacity: 0.6,
            zIndex: cloud.zIndex,
            transition: "transform 0.5s ease",
          }}
        >
          <img src="/img/Vector.svg" alt="Cloud" width={200} height="auto" />
        </div>
      ))}
    </div>
  );
}

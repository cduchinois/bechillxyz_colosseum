import React, { useEffect, useState } from 'react';

interface CloudProps {
  id: number;
  startPosition: number;
  yPosition: number;
  size: number;
  speed: number;
  direction: 'ltr' | 'rtl'; // left-to-right or right-to-left
  zIndex: number;
}

export default function AnimatedClouds() {
  const [clouds, setClouds] = useState<CloudProps[]>([]);
  const [windowWidth, setWindowWidth] = useState(0);

  // Initialize clouds
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      
      // Create 5 cloud objects with different properties
      const newClouds: CloudProps[] = [
        {
          id: 1,
          startPosition: -100,
          yPosition: 100,
          size: 0.8,
          speed: 0.2,
          direction: 'ltr',
          zIndex: -10
        },
        {
          id: 2,
          startPosition: window.innerWidth + 100,
          yPosition: 300,
          size: 1.2,
          speed: 0.15,
          direction: 'rtl',
          zIndex: -9
        },
        {
          id: 3,
          startPosition: -150,
          yPosition: 500,
          size: 0.6,
          speed: 0.25,
          direction: 'ltr',
          zIndex: -10
        },
        {
          id: 4,
          startPosition: window.innerWidth + 50,
          yPosition: 150,
          size: 1.0,
          speed: 0.18,
          direction: 'rtl',
          zIndex: -9
        },
        {
          id: 5,
          startPosition: -200,
          yPosition: 400,
          size: 0.7,
          speed: 0.22,
          direction: 'ltr',
          zIndex: -10
        }
      ];
      
      setClouds(newClouds);
      
      // Update window width if it changes
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };
      
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  // Animate clouds
  useEffect(() => {
    if (windowWidth === 0) return;
    
    const cloudWidth = 200; // Approximate width of cloud SVG
    const animateInterval = setInterval(() => {
      setClouds(prevClouds => 
        prevClouds.map(cloud => {
          let newPosition;
          
          if (cloud.direction === 'ltr') {
            // Moving left to right
            newPosition = cloud.startPosition + cloud.speed;
            
            // Reset position when cloud goes off screen
            if (newPosition > windowWidth + cloudWidth * cloud.size) {
              newPosition = -cloudWidth * cloud.size;
            }
          } else {
            // Moving right to left
            newPosition = cloud.startPosition - cloud.speed;
            
            // Reset position when cloud goes off screen
            if (newPosition < -cloudWidth * cloud.size) {
              newPosition = windowWidth + cloudWidth * cloud.size;
            }
          }
          
          return { ...cloud, startPosition: newPosition };
        })
      );
    }, 16); // ~60fps
    
    return () => clearInterval(animateInterval);
  }, [windowWidth]);

  // Render cloud SVG component
  const Cloud = ({ cloud }: { cloud: CloudProps }) => {
    return (
      <div
        style={{
          position: 'absolute',
          left: `${cloud.startPosition}px`,
          top: `${cloud.yPosition}px`,
          transform: `scale(${cloud.size})`,
          opacity: 0.6,
          zIndex: cloud.zIndex,
          transition: 'transform 0.5s ease'
        }}
      >
        <img 
          src="/img/Vector.svg" 
          alt="Cloud" 
          style={{ 
            width: '200px',
            height: 'auto',
          }} 
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -20 }}>
      {clouds.map(cloud => (
        <Cloud key={cloud.id} cloud={cloud} />
      ))}
    </div>
  );
}
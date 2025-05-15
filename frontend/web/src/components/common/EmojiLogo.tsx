
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/utils';

interface EmojiLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  trackMouse?: boolean;
}

interface ElementPosition {
  x: number;
  y: number;
  rotation: number;
}

const EmojiLogo: React.FC<EmojiLogoProps> = ({ 
  className, 
  size = 'md', 
  animated = true,
  trackMouse = false
}) => {
  const sizeClasses = {
    'sm': 'w-16 h-16',
    'md': 'w-24 h-24',
    'lg': 'w-40 h-40', 
    'xl': 'w-60 h-60'
  };
  
  const logoRef = useRef<HTMLDivElement>(null);
  const [sunglassesPosition, setSunglassesPosition] = useState<ElementPosition>({ x: 0, y: 0, rotation: 0 });
  const [mouthPosition, setMouthPosition] = useState<ElementPosition>({ x: 0, y: 0, rotation: 0 });
  const [targetSunglassesPosition, setTargetSunglassesPosition] = useState<ElementPosition>({ x: 0, y: 0, rotation: 0 });
  const [targetMouthPosition, setTargetMouthPosition] = useState<ElementPosition>({ x: 0, y: 0, rotation: 0 });
  const [isMouseNearLogo, setIsMouseNearLogo] = useState(false);
  
  // Animation frame reference for smooth interpolation
  const animationRef = useRef<number | null>(null);
  
  // Constants for movement - Adjusted for quick/sharp movements
  const SUNGLASSES_FACTOR = 2.2;  // Increased for sharper movement
  const MOUTH_FACTOR = 1.5;       // Increased for sharper movement
  const MAX_TRANSLATION = 35;     // Slightly increased max translation
  const MAX_SUNGLASSES_ROTATION = 18; // Increased max rotation
  const MAX_MOUTH_ROTATION = 22;      // Increased max rotation
  const INTERPOLATION_SPEED = 0.25;   // Increased for quicker movement
  const RESET_INTERPOLATION_SPEED = 0.15; // Speed when resetting position
  
  // Detection area around the logo (multiplier of logo dimensions)
  const DETECTION_AREA = 1.5; // Mouse is detected within 1.5x the logo's dimensions
  
  // Handle mouse movement to calculate target positions
  useEffect(() => {
    if (!trackMouse) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!logoRef.current) return;
      
      const rect = logoRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate distance from center as a ratio to logo size
      const detectionRadiusX = rect.width * DETECTION_AREA / 2;
      const detectionRadiusY = rect.height * DETECTION_AREA / 2;
      
      const distanceX = Math.abs(e.clientX - centerX);
      const distanceY = Math.abs(e.clientY - centerY);
      
      const isNear = distanceX <= detectionRadiusX && distanceY <= detectionRadiusY;
      setIsMouseNearLogo(isNear);
      
      if (isNear) {
        // Normalized cursor position (-1 to 1), more sensitive
        const dx = (e.clientX - centerX) / (rect.width / 2); 
        const dy = (e.clientY - centerY) / (rect.height / 2);
        
        // Update target positions with translation and rotation
        setTargetSunglassesPosition({
          x: dx * MAX_TRANSLATION * SUNGLASSES_FACTOR,
          y: dy * MAX_TRANSLATION * SUNGLASSES_FACTOR,
          rotation: dx * MAX_SUNGLASSES_ROTATION * SUNGLASSES_FACTOR
        });
        
        setTargetMouthPosition({
          x: dx * MAX_TRANSLATION * MOUTH_FACTOR,
          y: dy * MAX_TRANSLATION * MOUTH_FACTOR,
          rotation: dx * MAX_MOUTH_ROTATION * MOUTH_FACTOR
        });
      } else {
        // Reset position when mouse is outside detection area
        setTargetSunglassesPosition({ x: 0, y: 0, rotation: 0 });
        setTargetMouthPosition({ x: 0, y: 0, rotation: 0 });
      }
    };
    
    const handleMouseLeave = () => {
      setIsMouseNearLogo(false);
      setTargetSunglassesPosition({ x: 0, y: 0, rotation: 0 });
      setTargetMouthPosition({ x: 0, y: 0, rotation: 0 });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [trackMouse]);
  
  // Smooth interpolation animation
  useEffect(() => {
    if (!trackMouse) return;
    
    const animate = () => {
      // Use faster interpolation when mouse is near, slower when resetting
      const speed = isMouseNearLogo ? INTERPOLATION_SPEED : RESET_INTERPOLATION_SPEED;
      
      setSunglassesPosition(prev => ({
        x: prev.x + (targetSunglassesPosition.x - prev.x) * speed,
        y: prev.y + (targetSunglassesPosition.y - prev.y) * speed,
        rotation: prev.rotation + (targetSunglassesPosition.rotation - prev.rotation) * speed
      }));
      
      setMouthPosition(prev => ({
        x: prev.x + (targetMouthPosition.x - prev.x) * speed,
        y: prev.y + (targetMouthPosition.y - prev.y) * speed,
        rotation: prev.rotation + (targetMouthPosition.rotation - prev.rotation) * speed
      }));
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [trackMouse, targetSunglassesPosition, targetMouthPosition, isMouseNearLogo]);

  return (
    <div 
      ref={logoRef}
      className={cn('relative', sizeClasses[size], className)}
    >
      {/* Face */}
      <div
  className={cn(
    'w-full h-full rounded-full absolute',
    animated && !trackMouse && 'animate-face-bounce'
  )}
  style={{ backgroundColor: '#FFFF4F' }} // Jaune emoji
/>

      
      {/* Custom Sunglasses */}
      <div 
        className={cn(
          'absolute w-[90%] h-[35%] top-[20%] left-[5%] transition-transform duration-200',
          animated && !trackMouse && 'animate-sunglasses-rotate'
        )}
        style={
          trackMouse 
            ? { 
                transform: `translate(${sunglassesPosition.x}px, ${sunglassesPosition.y}px) rotate(${sunglassesPosition.rotation}deg)`,
                transition: 'transform 0.15s cubic-bezier(0.33, 1, 0.68, 1)' // Faster transition
              } 
            : {}
        }
      >
        <img 
          src="/lovable-uploads/71494e35-0c22-4429-b5bc-6989525f3286.png" 
          alt="Sunglasses" 
          className="w-full h-full object-contain"
        />
      </div>
      
      {/* Custom Mouth */}
      <div 
        className="absolute w-[40%] h-[30%] top-[65%] left-[30%]"
        style={
          trackMouse 
            ? { 
                transform: `translate(${mouthPosition.x}px, ${mouthPosition.y}px) rotate(${mouthPosition.rotation}deg)`,
                transition: 'transform 0.15s cubic-bezier(0.33, 1, 0.68, 1)' // Faster transition
              } 
            : {}
        }
      >
        <img 
          src="/lovable-uploads/d9cb7662-f8bc-4039-85e8-fe0c994726be.png" 
          alt="Mouth" 
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

export default EmojiLogo;
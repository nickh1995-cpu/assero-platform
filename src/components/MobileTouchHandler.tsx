"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./MobileTouchHandler.module.css";

interface TouchGesture {
  type: 'swipe-left' | 'swipe-right' | 'swipe-up' | 'swipe-down' | 'pinch' | 'tap' | 'long-press';
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
  duration?: number;
  scale?: number;
}

interface MobileTouchHandlerProps {
  onGesture?: (gesture: TouchGesture) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onTap?: () => void;
  onLongPress?: () => void;
  swipeThreshold?: number;
  longPressDelay?: number;
  children: React.ReactNode;
  className?: string;
}

export function MobileTouchHandler({
  onGesture,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onTap,
  onLongPress,
  swipeThreshold = 50,
  longPressDelay = 500,
  children,
  className
}: MobileTouchHandlerProps) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number; time: number } | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastPinchDistance, setLastPinchDistance] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startPos = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    setTouchStart(startPos);
    setTouchEnd(null);

    // Start long press timer
    const timer = setTimeout(() => {
      setIsLongPressing(true);
      onLongPress?.();
      onGesture?.({ type: 'long-press', duration: longPressDelay });
    }, longPressDelay);
    setLongPressTimer(timer);

    // Handle pinch gesture
    if (e.touches.length === 2) {
      const distance = getDistance(e.touches[0], e.touches[1]);
      setLastPinchDistance(distance);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const currentPos = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    setTouchEnd(currentPos);

    // Cancel long press if moved
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    // Handle pinch gesture
    if (e.touches.length === 2 && lastPinchDistance !== null) {
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / lastPinchDistance;
      onPinch?.(scale);
      onGesture?.({ type: 'pinch', scale });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    if (!touchStart || !touchEnd) return;

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const deltaTime = touchEnd.time - touchStart.time;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Determine gesture type
    if (distance < 10 && deltaTime < 300) {
      // Tap gesture
      onTap?.();
      onGesture?.({ type: 'tap', duration: deltaTime });
    } else if (distance > swipeThreshold) {
      // Swipe gesture
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight?.();
          onGesture?.({ type: 'swipe-right', direction: 'right', distance, duration: deltaTime });
        } else {
          onSwipeLeft?.();
          onGesture?.({ type: 'swipe-left', direction: 'left', distance, duration: deltaTime });
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipeDown?.();
          onGesture?.({ type: 'swipe-down', direction: 'down', distance, duration: deltaTime });
        } else {
          onSwipeUp?.();
          onGesture?.({ type: 'swipe-up', direction: 'up', distance, duration: deltaTime });
        }
      }
    }

    // Reset touch state
    setTouchStart(null);
    setTouchEnd(null);
    setIsLongPressing(false);
    setLastPinchDistance(null);
  };

  const getDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

  return (
    <div
      ref={containerRef}
      className={`${styles.touchHandler} ${className || ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
      
      {/* Visual feedback for long press */}
      {isLongPressing && (
        <div className={styles.longPressIndicator}>
          <div className={styles.longPressRipple}></div>
        </div>
      )}
    </div>
  );
}

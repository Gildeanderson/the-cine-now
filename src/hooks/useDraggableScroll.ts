import { useRef, useState, useCallback, useEffect } from 'react';

export function useDraggableScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [lastX, setLastX] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);
  const requestRef = useRef<number | null>(null);

  const momentumScroll = useCallback(() => {
    if (!ref.current || isDragging) return;
    
    if (Math.abs(velocity) > 0.5) {
      ref.current.scrollLeft -= velocity;
      setVelocity(v => v * 0.92); // Slightly higher friction for better control
      requestRef.current = requestAnimationFrame(momentumScroll);
    } else {
      setVelocity(0);
    }
  }, [isDragging, velocity]);

  useEffect(() => {
    if (!isDragging && Math.abs(velocity) > 0.5) {
      requestRef.current = requestAnimationFrame(momentumScroll);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isDragging, velocity, momentumScroll]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
    setLastX(e.pageX);
    setVelocity(0);
    
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    
    ref.current.style.cursor = 'grabbing';
    ref.current.style.userSelect = 'none';
    ref.current.style.scrollBehavior = 'auto';
  }, []);

  const onMouseLeave = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    if (ref.current) {
      ref.current.style.cursor = 'grab';
      ref.current.style.removeProperty('user-select');
      ref.current.style.scrollBehavior = 'smooth';
    }
  }, [isDragging]);

  const onMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (ref.current) {
      ref.current.style.cursor = 'grab';
      ref.current.style.removeProperty('user-select');
      ref.current.style.scrollBehavior = 'smooth';
    }

    // If we moved significantly, prevent the click event
    if (hasMoved) {
      const handleClick = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        window.removeEventListener('click', handleClick, true);
      };
      window.addEventListener('click', handleClick, true);
    }
  }, [isDragging, hasMoved]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !ref.current) return;
    
    const x = e.pageX - ref.current.offsetLeft;
    const distance = x - startX;
    
    if (Math.abs(e.pageX - lastX) > 2) {
      setHasMoved(true);
    }

    const currentVelocity = e.pageX - lastX;
    setVelocity(currentVelocity);
    setLastX(e.pageX);

    ref.current.scrollLeft = scrollLeft - distance;
  }, [isDragging, startX, scrollLeft, lastX]);

  return {
    ref,
    onMouseDown,
    onMouseLeave,
    onMouseUp,
    onMouseMove,
    style: { cursor: 'grab', scrollBehavior: 'smooth' as const }
  };
}

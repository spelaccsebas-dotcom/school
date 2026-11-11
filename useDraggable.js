import { useState, useEffect, useRef, useCallback } from 'react';

export default function useDraggable(storageKey, defaultPos) {
  const getDefault = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultPos;
  };

  const [pos, setPos] = useState(getDefault);
  const dragging = useRef(false);
  const startMouse = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const onDragStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragging.current = true;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const rect = containerRef.current.getBoundingClientRect();
    startMouse.current = { x: clientX, y: clientY };
    startPos.current = { x: rect.left, y: rect.top };
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const dx = clientX - startMouse.current.x;
      const dy = clientY - startMouse.current.y;

      const newX = Math.max(0, Math.min(startPos.current.x + dx, window.innerWidth - 60));
      const newY = Math.max(0, Math.min(startPos.current.y + dy, window.innerHeight - 60));

      setPos({ x: newX, y: newY });
    };

    const onEnd = () => { dragging.current = false; };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, []);

  useEffect(() => {
    if (pos) localStorage.setItem(storageKey, JSON.stringify(pos));
  }, [pos, storageKey]);

  const containerStyle = {
    position: 'fixed',
    left: pos.x,
    top: pos.y,
    zIndex: 50,
    userSelect: 'none',
  };

  return { containerRef, containerStyle, onDragStart };
}
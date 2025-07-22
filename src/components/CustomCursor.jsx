import React, { useEffect } from 'react';

export default function CustomCursor() {
  useEffect(() => {
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');

    const moveCursor = (e) => {
      if (cursor && follower) {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
        setTimeout(() => {
          follower.style.left = `${e.clientX}px`;
          follower.style.top = `${e.clientY}px`;
        }, 100);
      }
    };

    document.addEventListener('mousemove', moveCursor);
    return () => {
      document.removeEventListener('mousemove', moveCursor);
    };
  }, []);

  return (
    <>
      <div className="cursor pointer-events-none w-5 h-5 border-2 border-orange-500 rounded-full fixed z-50 mix-blend-difference" />
      <div className="cursor-follower pointer-events-none w-10 h-10 bg-orange-500/30 rounded-full fixed z-40 blur-sm" />
    </>
  );
}

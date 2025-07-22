 yka9y8-codex/enhance-website-with-3d-effects
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
=======
import { useEffect } from 'react';

export default function CustomCursor() {
  useEffect(() => {
    const cursor = document.createElement('div');
 qxqyuq-codex/enhance-website-with-3d-effects
    const follower = document.createElement('div');
    cursor.className = 'blaize-cursor';
    follower.className = 'blaize-cursor-follower';
    document.body.appendChild(cursor);
    document.body.appendChild(follower);
    const moveCursor = (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      setTimeout(() => {
        follower.style.left = `${e.clientX}px`;
        follower.style.top = `${e.clientY}px`;
      }, 100);
    };
    document.addEventListener('mousemove', moveCursor);
    document.body.classList.add('blaize-hide-cursor');
    return () => {
      document.removeEventListener('mousemove', moveCursor);
      document.body.classList.remove('blaize-hide-cursor');
=======
    cursor.className = 'custom-cursor';
    const follower = document.createElement('div');
    follower.className = 'cursor-follower';
    document.body.appendChild(cursor);
    document.body.appendChild(follower);

    const move = (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      follower.style.left = `${e.clientX}px`;
      follower.style.top = `${e.clientY}px`;
    };

    document.addEventListener('mousemove', move);
    return () => {
      document.removeEventListener('mousemove', move);
 main
      cursor.remove();
      follower.remove();
    };
  }, []);
 qxqyuq-codex/enhance-website-with-3d-effects
=======

 main
  return null;
 main
}

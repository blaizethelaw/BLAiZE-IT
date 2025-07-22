import { useEffect } from 'react';

export default function CustomCursor() {
  useEffect(() => {
    const cursor = document.createElement('div');
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
      cursor.remove();
      follower.remove();
    };
  }, []);
  return null;
}

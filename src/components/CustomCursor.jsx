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
}

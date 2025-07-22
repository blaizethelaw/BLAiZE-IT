import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      aria-label="Scroll to top"
      onClick={handleClick}
      className={`fixed bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-r from-blaize-green via-blaize-yellow to-blaize-orange text-black shadow-lg flex items-center justify-center transition-opacity duration-300 ${visible ? 'opacity-90' : 'opacity-0 pointer-events-none'}`}
      type="button"
    >
      <ArrowUp size={20} />
    </button>
  );
}

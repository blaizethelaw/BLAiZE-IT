import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function DarkModeToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (enabled) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [enabled]);

  return (
    <button
      aria-label="Toggle dark mode"
      onClick={() => setEnabled(!enabled)}
      className="text-white dark:text-yellow-300 p-2"
      type="button"
    >
      {enabled ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

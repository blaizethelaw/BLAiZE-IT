export function initLogoInteractive() {
  const container = document.getElementById('logo-container');
  if (!container) {
    return () => {};
  }

  // Create custom cursor dot
  const cursor = document.createElement('div');
  cursor.className = 'cursor-dot';
  document.body.appendChild(cursor);

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let currentScale = 1;
  let targetScale = 1;
  let rafId;

  function update() {
    currentX += (targetX - currentX) * 0.1;
    currentY += (targetY - currentY) * 0.1;
    currentScale += (targetScale - currentScale) * 0.1;
    container.style.transform = `rotateX(${currentY}deg) rotateY(${currentX}deg) scale(${currentScale})`;
    rafId = requestAnimationFrame(update);
  }

  function onMouseMove(e) {
    const rect = container.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    targetX = relX * 30; // rotateY
    targetY = -relY * 30; // rotateX
    cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  }

  function onMouseEnter() {
    targetScale = 1.1;
    cursor.classList.add('visible');
    cursor.classList.add('hover');
    update();
  }

  function onMouseLeave() {
    targetScale = 1;
    cursor.classList.remove('hover');
    cursor.classList.remove('visible');
    cancelAnimationFrame(rafId);
    rafId = null;
    currentX = currentY = targetX = targetY = 0;
    currentScale = 1;
    container.style.transform = '';
  }

  container.addEventListener('mousemove', onMouseMove);
  container.addEventListener('mouseenter', onMouseEnter);
  container.addEventListener('mouseleave', onMouseLeave);

  return function teardown() {
    container.removeEventListener('mousemove', onMouseMove);
    container.removeEventListener('mouseenter', onMouseEnter);
    container.removeEventListener('mouseleave', onMouseLeave);
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    container.style.transform = '';
    cursor.remove();
  };
}

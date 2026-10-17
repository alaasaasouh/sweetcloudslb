'use strict';
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const motionToggle = document.querySelector('.motion-toggle');
  let paused = false;
  const canAnimate = () => !paused && !reduced.matches;
  motionToggle.addEventListener('click', () => {
    paused = !paused;
    document.documentElement.classList.toggle('motion-paused', paused);
    motionToggle.setAttribute('aria-pressed', String(paused));
    motionToggle.textContent = paused ? 'Play animations' : 'Pause animations';
    document.getAnimations().forEach(animation => paused ? animation.pause() : animation.play());
  });
  const mobileOrder = document.querySelector('.mobile-order');
  const count = document.querySelector('.bag [data-count]');
  const syncOrder = () => {
    const hasItems = Number(count.textContent) > 0;
    mobileOrder.hidden = !hasItems;
    document.body.classList.toggle('has-order', hasItems);
  };
  new MutationObserver(syncOrder).observe(count, { childList: true, characterData: true, subtree: true });
  syncOrder();
  document.addEventListener('click', event => {
    if (!event.target.closest('#navigation,.nav-toggle')) {
      document.querySelector('#navigation').classList.remove('open');
      document.querySelector('.nav-toggle').setAttribute('aria-expanded', 'false');
    }
    const target = event.target.closest('[data-flavor],.choose');
    if (!target || !canAnimate()) return;
    const box = target.getBoundingClientRect();
    for (let i = 0; i < 7; i++) {
      const particle = document.createElement('span');
      particle.className = 'sweet-particle'; particle.textContent = i % 2 ? '✦' : '♡';
      particle.setAttribute('aria-hidden', 'true');
      const angle = (i / 7) * Math.PI * 2;
      particle.style.cssText = `--x:${box.left + box.width / 2}px;--y:${box.top + box.height / 2}px;--dx:${Math.cos(angle) * 65}px;--dy:${Math.sin(angle) * 55 - 35}px;--spin:${i * 35}deg;--particle:${['#bd7b84','#98aa8c','#c49a58'][i % 3]}`;
      document.body.append(particle); setTimeout(() => particle.remove(), 850);
    }
  });
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  document.querySelectorAll('.product').forEach(card => {
    card.addEventListener('pointermove', event => {
      if (!canAnimate() || !fine.matches) return;
      const box = card.getBoundingClientRect();
      card.style.setProperty('--tilt-x', `${((event.clientY - box.top) / box.height - .5) * -3}deg`);
      card.style.setProperty('--tilt-y', `${((event.clientX - box.left) / box.width - .5) * 3}deg`);
    });
    card.addEventListener('pointerleave', () => { card.style.removeProperty('--tilt-x'); card.style.removeProperty('--tilt-y'); });
  });
})();

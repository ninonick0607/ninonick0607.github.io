// Footer year + smooth in-page anchor scroll
document.addEventListener('DOMContentLoaded', () => {
  const y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Generic slider initializer (supports multiple sliders)
  const initSlider = (root) => {
    const track = root.querySelector('.slider__track');
    const slides = Array.from(root.querySelectorAll('.slider__slide'));
    const prev = root.querySelector('.slider__btn--prev');
    const next = root.querySelector('.slider__btn--next');
    const loop = root.dataset.loop === 'true';
    let index = 0;

    const update = () => {
      const offset = -index * 100;
      track.style.transform = `translateX(${offset}%)`;
      if (!loop){
        const max = Math.max(0, slides.length - 1);
        if (prev) prev.style.display = index <= 0 ? 'none' : 'inline-flex';
        if (next) next.style.display = index >= max ? 'none' : 'inline-flex';
      } else {
        if (prev) prev.style.display = 'inline-flex';
        if (next) next.style.display = 'inline-flex';
      }
    };
    const go = (dir) => {
      if (loop){
        const n = slides.length;
        index = (index + dir + n) % n;
      } else {
        const max = Math.max(0, slides.length - 1);
        index = Math.min(max, Math.max(0, index + dir));
      }
      update();
    };
    prev?.addEventListener('click', () => go(-1));
    next?.addEventListener('click', () => go(1));

    // Keyboard support when focused
    root.setAttribute('tabindex', '0');
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    });

    update();
  };

  document.querySelectorAll('.slider').forEach(initSlider);
});

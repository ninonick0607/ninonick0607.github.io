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

  // QuadSim API control-level explorer
  document.querySelectorAll('[data-api-explorer]').forEach(explorer => {
    const tabs = Array.from(explorer.querySelectorAll('.api-tab'));
    const title = explorer.querySelector('[data-api-output-title]');
    const copy = explorer.querySelector('[data-api-output-copy]');
    const boundary = explorer.querySelector('[data-api-boundary]');
    const stages = Array.from(explorer.querySelectorAll('[data-stage]'));

    const selectTab = (tab, moveFocus = false) => {
      if (!tab) return;
      const activePath = new Set((tab.dataset.apiPath || '').split(',').filter(Boolean));

      tabs.forEach(item => {
        const isActive = item === tab;
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-selected', String(isActive));
        item.tabIndex = isActive ? 0 : -1;
      });

      stages.forEach(stage => {
        stage.classList.toggle('is-active', activePath.has(stage.dataset.stage));
      });

      if (title) title.textContent = tab.dataset.apiTitle || '';
      if (copy) copy.textContent = tab.dataset.apiOutput || '';
      if (boundary) boundary.textContent = tab.dataset.apiBoundary || '';
      if (moveFocus) tab.focus();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectTab(tab));
      tab.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = tabs.length - 1;
        else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
        else nextIndex = (index - 1 + tabs.length) % tabs.length;
        selectTab(tabs[nextIndex], true);
      });
    });

    selectTab(tabs.find(tab => tab.classList.contains('is-active')) || tabs[0]);
  });

  // Lightbox for slider images
  const createLightbox = () => {
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = `
      <div class="lightbox__content" role="dialog" aria-modal="true" aria-label="Expanded media">
        <button class="lightbox__close" aria-label="Close">\u2715</button>
        <img class="lightbox__img" alt="Expanded image" />
        <div class="lightbox__caption"></div>
      </div>
    `;
    document.body.appendChild(lb);
    return lb;
  };

  const lightbox = createLightbox();
  const lbImg = lightbox.querySelector('.lightbox__img');
  const lbCap = lightbox.querySelector('.lightbox__caption');
  const lbClose = lightbox.querySelector('.lightbox__close');

  const openLightbox = (src, alt, caption) => {
    lbImg.src = src;
    lbImg.alt = alt || '';
    lbCap.textContent = caption || alt || '';
    lightbox.classList.add('is-open');
    document.body.classList.add('modal-open');
  };
  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    // Clean up src to stop any loading
    lbImg.src = '';
  };

  // Close handlers: button, Escape, backdrop click
  lbClose.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
  });
  lightbox.addEventListener('click', (e) => {
    // Close when clicking outside content
    if (e.target === lightbox) closeLightbox();
  });

  // Delegate clicks: only images inside sliders
  document.body.addEventListener('click', (e) => {
    const img = e.target.closest('.slider .slider__slide img');
    if (!img) return;
    // Ignore clicks on videos etc. Only images match the selector
    // Attempt to pull caption from adjacent figcaption if present
    const fig = img.closest('figure');
    const captionText = fig?.querySelector('figcaption')?.textContent?.trim();
    // Use natural size if available; srcset may be present later — using current src
    openLightbox(img.currentSrc || img.src, img.alt, captionText);
  });
});

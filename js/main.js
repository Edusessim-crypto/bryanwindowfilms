/* ============================================================
   BRYAN WINDOW FILMS — main.js
   ============================================================ */

/* ── Header: scroll state ── */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── Hamburger menu ── */
const hamburger = document.getElementById('hamburger');
const mobileNav  = document.getElementById('mobileNav');

hamburger.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close on nav link click
mobileNav.querySelectorAll('.mobile-nav__link, .mobile-nav__cta').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

/* ── Smooth scroll for all anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const headerH = header.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── Fade-in on scroll (Intersection Observer) ── */
const fadeEls = document.querySelectorAll('.fade-in');

const observer = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (!entry.isIntersecting) return;
    // Stagger siblings in same parent
    const siblings = Array.from(entry.target.parentElement.querySelectorAll('.fade-in:not(.visible)'));
    const delay = siblings.indexOf(entry.target) * 80;
    setTimeout(() => entry.target.classList.add('visible'), delay);
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 });

fadeEls.forEach(el => observer.observe(el));

/* ── Modal system ── */
const backdrop = document.getElementById('modalBackdrop');
let currentModal = null;

function openModal(id) {
  if (currentModal) closeModal(false);
  const modal = document.getElementById('modal-' + id);
  if (!modal) return;
  currentModal = modal;
  backdrop.classList.add('open');
  modal.classList.add('open');
  document.body.classList.add('modal-open');
  // Focus close button for accessibility
  modal.querySelector('.modal__close')?.focus();
}

function closeModal(restoreFocus = true) {
  if (!currentModal) return;
  backdrop.classList.remove('open');
  currentModal.classList.remove('open');
  document.body.classList.remove('modal-open');
  currentModal = null;
}

// ESC key closes modal
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// Expose globally for onclick attributes in HTML
window.openModal  = openModal;
window.closeModal = closeModal;

/* ── Lazy loading fallback for older browsers ── */
if ('loading' in HTMLImageElement.prototype === false) {
  const lazyImgs = document.querySelectorAll('img[loading="lazy"]');
  const lazyObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        lazyObs.unobserve(img);
      }
    });
  });
  lazyImgs.forEach(img => lazyObs.observe(img));
}

/* ── Carrossel de serviços ── */
(function () {
  const track = document.getElementById('carouselTrack');
  const dotsWrap = document.getElementById('carouselDots');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  if (!track || !dotsWrap) return;

  const slides = Array.from(track.children);

  // Cria os dots
  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => {
      slides[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    });
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function updateActiveDot() {
    const trackRect = track.getBoundingClientRect();
    let closestIdx = 0;
    let closestDist = Infinity;
    slides.forEach((slide, i) => {
      const dist = Math.abs(slide.getBoundingClientRect().left - trackRect.left);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === closestIdx));
  }

  let scrollTimeout;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateActiveDot, 100);
  }, { passive: true });

  function scrollByCard(direction) {
    const card = slides[0];
    const cardWidth = card.getBoundingClientRect().width + 16; // gap
    track.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
  }

  prevBtn?.addEventListener('click', () => scrollByCard(-1));
  nextBtn?.addEventListener('click', () => scrollByCard(1));
})();

/* ── Galeria de projeto (popup) ── */
(function () {
  // Placeholders: o cliente irá subir as fotos reais de cada projeto.
  // Cada entrada aceita múltiplas imagens — basta adicionar mais URLs ao array.
  const projects = {
    'auto': {
      title: 'Película Automotiva',
      images: [
        'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=80',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
      ],
    },
    'ppf': {
      title: 'PPF — Proteção Total',
      images: [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80',
        'https://images.unsplash.com/photo-1542362567-b07e54358753?w=1200&q=80',
      ],
    },
    'envelopamento': {
      title: 'Envelopamento Premium',
      images: [
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&q=80',
        'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=1200&q=80',
      ],
    },
    'vitrificacao': {
      title: 'Vitrificação de Pintura',
      images: [
        'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&q=80',
        'https://images.unsplash.com/photo-1520031441872-265e4ff70366?w=1200&q=80',
      ],
    },
    'arquitetonica': {
      title: 'Película Arquitetônica',
      images: [
        'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80',
      ],
    },
    'envelopamento-esportivo': {
      title: 'Envelopamento Esportivo',
      images: [
        'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=1200&q=80',
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&q=80',
      ],
    },
  };

  const backdrop  = document.getElementById('galleryBackdrop');
  const modal     = document.getElementById('galleryModal');
  const stage     = document.getElementById('galleryStage');
  const imgEl     = document.getElementById('galleryImg');
  const titleEl   = document.getElementById('galleryModalTitle');
  const counterEl = document.getElementById('galleryCounter');
  const thumbsEl  = document.getElementById('galleryThumbs');

  if (!backdrop || !modal) return;

  let currentImages = [];
  let currentIndex = 0;

  function render() {
    const total = currentImages.length;
    imgEl.src = currentImages[currentIndex];
    counterEl.textContent = (currentIndex + 1) + ' / ' + total;
    Array.from(thumbsEl.children).forEach((thumb, i) => {
      thumb.classList.toggle('active', i === currentIndex);
    });
  }

  function openGallery(projectId) {
    const project = projects[projectId];
    if (!project) return;

    currentImages = project.images;
    currentIndex = 0;
    titleEl.textContent = project.title;

    thumbsEl.innerHTML = '';
    currentImages.forEach((src, i) => {
      const thumb = document.createElement('img');
      thumb.src = src;
      thumb.loading = 'lazy';
      thumb.alt = project.title + ' — foto ' + (i + 1);
      thumb.className = 'gallery-modal__thumb';
      thumb.addEventListener('click', () => { currentIndex = i; render(); });
      thumbsEl.appendChild(thumb);
    });

    render();
    backdrop.classList.add('open');
    modal.classList.add('open');
    document.body.classList.add('modal-open');
  }

  function closeGallery() {
    backdrop.classList.remove('open');
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
  }

  function galleryNext() {
    if (!currentImages.length) return;
    currentIndex = (currentIndex + 1) % currentImages.length;
    render();
  }

  function galleryPrev() {
    if (!currentImages.length) return;
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    render();
  }

  // Clique/teclado nos itens do portfólio
  document.querySelectorAll('.portfolio__item[data-project]').forEach(item => {
    item.addEventListener('click', () => openGallery(item.dataset.project));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openGallery(item.dataset.project);
      }
    });
  });

  // Teclado: ESC fecha, setas navegam
  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeGallery();
    if (e.key === 'ArrowRight') galleryNext();
    if (e.key === 'ArrowLeft') galleryPrev();
  });

  // Swipe no mobile
  let touchStartX = 0;
  stage.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  stage.addEventListener('touchend', e => {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) < 40) return;
    if (deltaX < 0) galleryNext(); else galleryPrev();
  }, { passive: true });

  window.openGallery  = openGallery;
  window.closeGallery = closeGallery;
  window.galleryNext  = galleryNext;
  window.galleryPrev  = galleryPrev;
})();

/* ── Active nav link on scroll ── */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.header__nav-link');

const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === '#' + entry.target.id
          ? '#fff'
          : '';
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => navObserver.observe(s));

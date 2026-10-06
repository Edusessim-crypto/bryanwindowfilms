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

/* ── Projetos: cards + galeria (popup) ── */
(function () {
  // Uma categoria por pasta em assets/projetos/<id>/ — a ordem aqui é a ordem na página.
  // Arquivos de cada pasta: capa.jpg (card, 800px) · <id>-NN.jpg (galeria, 1600px)
  // · thumb/<id>-NN.jpg (miniaturas, 320px). A foto 01 é sempre a mesma da capa.
  // coverPosition (opcional): enquadramento da capa no card (object-position).
  const PROJECTS_DIR = 'assets/projetos/';
  const PROJECTS = [
    { id: 'arquitetura',             title: 'Arquitetura',             photos: 17 },
    { id: 'envelopamento',           title: 'Envelopamento',           photos: 3 },
    { id: 'pelicula-antitrinco',     title: 'Película Antitrinco',     photos: 2 },
    { id: 'pelicula-antivandalismo', title: 'Película Antivandalismo', photos: 3 },
    { id: 'pelicula-automotiva',     title: 'Película Automotiva',     photos: 4 },
    { id: 'ppf',                     title: 'PPF',                     photos: 3 },
    { id: 'vitrificacao',            title: 'Vitrificação',            photos: 3, coverPosition: 'center 68%' },
  ];

  const projects = {};
  PROJECTS.forEach(p => {
    const dir = PROJECTS_DIR + p.id + '/';
    projects[p.id] = {
      title: p.title,
      cover: dir + 'capa.jpg',
      coverPosition: p.coverPosition,
      images: Array.from({ length: p.photos }, (_, i) => {
        const file = p.id + '-' + String(i + 1).padStart(2, '0') + '.jpg';
        return { src: dir + file, thumb: dir + 'thumb/' + file };
      }),
    };
  });

  const grid      = document.getElementById('portfolioGrid');
  const backdrop  = document.getElementById('galleryBackdrop');
  const modal     = document.getElementById('galleryModal');
  const stage     = document.getElementById('galleryStage');
  const imgEl     = document.getElementById('galleryImg');
  const titleEl   = document.getElementById('galleryModalTitle');
  const counterEl = document.getElementById('galleryCounter');
  const thumbsEl  = document.getElementById('galleryThumbs');
  const closeBtn  = modal && modal.querySelector('.gallery-modal__close');

  if (!grid || !backdrop || !modal) return;

  // Cards da seção (mesma marcação/classes de antes, agora gerada dos dados)
  PROJECTS.forEach(p => {
    const project = projects[p.id];
    const item = document.createElement('div');
    item.className = 'portfolio__item fade-in';
    item.dataset.project = p.id;
    item.setAttribute('role', 'button');
    item.tabIndex = 0;
    item.setAttribute('aria-label', 'Ver galeria — ' + project.title);

    const img = document.createElement('img');
    img.src = project.cover;
    img.alt = project.title;
    img.loading = 'lazy';
    img.decoding = 'async';
    if (project.coverPosition) img.style.objectPosition = project.coverPosition;
    img.addEventListener('error', () => item.classList.add('is-broken'));

    const overlay = document.createElement('div');
    overlay.className = 'portfolio__item-overlay';
    const label = document.createElement('span');
    label.textContent = project.title;
    overlay.appendChild(label);

    item.append(img, overlay);
    item.addEventListener('click', () => openGallery(p.id, item));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openGallery(p.id, item);
      }
    });
    grid.appendChild(item);
    observer.observe(item);
  });

  let current = null;   // projeto aberto
  let currentIndex = 0;
  let lastFocus = null;

  imgEl.addEventListener('load', () => imgEl.classList.remove('is-loading', 'is-broken'));
  imgEl.addEventListener('error', () => {
    imgEl.classList.remove('is-loading');
    imgEl.classList.add('is-broken');
  });

  function preload(i) {
    const img = new Image();
    img.src = current.images[i].src;
  }

  function scrollThumbIntoView(smooth) {
    const thumb = thumbsEl.children[currentIndex];
    if (!thumb) return;
    const left = thumb.offsetLeft - (thumbsEl.clientWidth - thumb.offsetWidth) / 2;
    thumbsEl.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' });
  }

  function render(smooth = true) {
    const total = current.images.length;
    const image = current.images[currentIndex];

    imgEl.alt = current.title + ' — foto ' + (currentIndex + 1) + ' de ' + total;
    if (imgEl.getAttribute('src') !== image.src) {
      imgEl.classList.add('is-loading');
      imgEl.src = image.src;
    }
    counterEl.textContent = (currentIndex + 1) + ' / ' + total;
    Array.from(thumbsEl.children).forEach((thumb, i) => {
      const active = i === currentIndex;
      thumb.classList.toggle('active', active);
      if (active) thumb.setAttribute('aria-current', 'true');
      else thumb.removeAttribute('aria-current');
    });
    scrollThumbIntoView(smooth);

    // Pré-carrega só a próxima e a anterior
    if (total > 1) {
      preload((currentIndex + 1) % total);
      preload((currentIndex - 1 + total) % total);
    }
  }

  function openGallery(projectId, trigger) {
    const project = projects[projectId];
    if (!project) return;

    current = project;
    currentIndex = 0;
    lastFocus = trigger || document.activeElement;
    titleEl.textContent = project.title;
    modal.classList.toggle('is-single', project.images.length < 2);

    thumbsEl.innerHTML = '';
    project.images.forEach((image, i) => {
      const thumb = document.createElement('button');
      thumb.type = 'button';
      thumb.className = 'gallery-modal__thumb';
      thumb.setAttribute('aria-label', 'Ver foto ' + (i + 1));
      const img = document.createElement('img');
      img.src = image.thumb;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.addEventListener('error', () => thumb.classList.add('is-broken'));
      thumb.appendChild(img);
      thumb.addEventListener('click', () => { currentIndex = i; render(); });
      thumbsEl.appendChild(thumb);
    });

    backdrop.classList.add('open');
    modal.classList.add('open');
    document.body.classList.add('modal-open');
    render(false);
    closeBtn?.focus({ preventScroll: true });
  }

  function closeGallery() {
    if (!modal.classList.contains('open')) return;
    backdrop.classList.remove('open');
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
    current = null;
    lastFocus?.focus({ preventScroll: true });
    lastFocus = null;
  }

  function galleryNext() {
    if (!current || current.images.length < 2) return;
    currentIndex = (currentIndex + 1) % current.images.length;
    render();
  }

  function galleryPrev() {
    if (!current || current.images.length < 2) return;
    currentIndex = (currentIndex - 1 + current.images.length) % current.images.length;
    render();
  }

  // Teclado: ESC fecha, setas navegam
  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeGallery();
    if (e.key === 'ArrowRight') galleryNext();
    if (e.key === 'ArrowLeft') galleryPrev();
  });

  // Swipe no mobile (ignora gestos mais verticais que horizontais)
  let touchStartX = 0;
  let touchStartY = 0;
  stage.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  stage.addEventListener('touchend', e => {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) return;
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

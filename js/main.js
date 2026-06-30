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

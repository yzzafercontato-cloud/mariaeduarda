import gsap from 'https://esm.sh/gsap@3.12.5';
import ScrollTrigger from 'https://esm.sh/gsap@3.12.5/ScrollTrigger';
import Lenis from 'https://esm.sh/lenis@1.1.18';
import { initOrchid3D } from './orchid-3d.js';

gsap.registerPlugin(ScrollTrigger);

// --- 1. Lenis Smooth Scroll + GSAP Sync ---
const lenis = new Lenis({
  duration: 1.25,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// Back to top button
document.getElementById('back-to-top')?.addEventListener('click', () => {
  lenis.scrollTo(0, { duration: 1.4 });
});

// Smooth anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const id = anchor.getAttribute('href');
    if (id && id.length > 1) {
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -20 });
      }
    }
  });
});

// --- 2. Init 3D Orchid Element ---
initOrchid3D(gsap, ScrollTrigger);

// Top & right-side scroll progress bars (ADDICT reference)
gsap.to('#scroll-progress', {
  width: '100%',
  ease: 'none',
  scrollTrigger: {
    trigger: '#smooth-content',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.2
  }
});

gsap.to('#progress-fill', {
  height: '100%',
  ease: 'none',
  scrollTrigger: {
    trigger: '#smooth-content',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.2
  }
});

const progressIndex = document.getElementById('progress-index');
document.querySelectorAll('section[data-section]').forEach((sec) => {
  ScrollTrigger.create({
    trigger: sec,
    start: 'top 55%',
    end: 'bottom 55%',
    onEnter: () => {
      if (progressIndex) progressIndex.textContent = sec.getAttribute('data-section') || '01';
    },
    onEnterBack: () => {
      if (progressIndex) progressIndex.textContent = sec.getAttribute('data-section') || '01';
    }
  });
});

// --- 3. Editorial Preloader & Hero Entrance ---
const preloader = document.getElementById('preloader');
const preloaderBar = document.getElementById('preloader-bar');
const preloaderPercent = document.getElementById('preloader-percent');

const counter = { val: 0 };
gsap.to(counter, {
  val: 100,
  duration: 1.15,
  ease: 'power2.out',
  onUpdate: () => {
    const v = Math.round(counter.val);
    if (preloaderBar) preloaderBar.style.width = `${v}%`;
    if (preloaderPercent) preloaderPercent.textContent = `${String(v).padStart(2, '0')}%`;
  },
  onComplete: () => {
    const tl = gsap.timeline();
    tl.to(preloader, {
      yPercent: -100,
      duration: 0.85,
      ease: 'power4.inOut',
      onComplete: () => {
        if (preloader) preloader.style.display = 'none';
        // Recalculate all ScrollTrigger positions after preloader slides away
        ScrollTrigger.refresh();
      }
    }).from('.hero-anim', {
      y: 36,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: 'power3.out'
    }, '-=0.35');
  }
});

// --- 4. Header Scroll State ---
const header = document.getElementById('site-header');
ScrollTrigger.create({
  start: 'top -80',
  onUpdate: (self) => {
    if (!header) return;
    header.classList.toggle('is-scrolled', self.scroll() > 80);
  }
});

// --- 5. ADDICT-style Staggered Scroll Reveals ---
document.querySelectorAll('.reveal-up').forEach((el) => {
  gsap.from(el, {
    y: 44,
    opacity: 0,
    duration: 0.95,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 86%',
      once: true
    }
  });
});

// Split kinetic parallax on hero center video & lateral text columns
gsap.to('.hero__video-frame', {
  scale: 1.07,
  yPercent: 8,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true
  }
});

gsap.to('.hero__left', {
  yPercent: -12,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true
  }
});

gsap.to('.hero__right', {
  yPercent: 10,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true
  }
});

// Dynamic scroll-driven card & photo parallax (ADDICT & Klimt Wine style)
document.querySelectorAll('.scroll-card, .evaluation-card').forEach((card, idx) => {
  gsap.from(card, {
    y: 52,
    scale: 0.95,
    opacity: 0,
    duration: 0.9,
    delay: (idx % 2) * 0.08,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: card,
      start: 'top 88%',
      once: true
    }
  });

  if (card.classList.contains('treatment-card')) {
    gsap.to(card, {
      y: idx % 2 === 0 ? -24 : 24,
      ease: 'none',
      scrollTrigger: {
        trigger: '.treatments-grid',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  // Interactive 3D tilt on every card
  card.addEventListener('pointermove', (e) => {
    const rect = card.getBoundingClientRect();
    const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -5;
    const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 5;
    gsap.to(card, {
      rotateX: rx,
      rotateY: ry,
      transformPerspective: 900,
      duration: 0.35,
      ease: 'power2.out'
    });
  });
  card.addEventListener('pointerleave', () => {
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: 'power3.out'
    });
  });
});

// Scroll-linked parallax inside all photo cards & editorial images
document.querySelectorAll('.treatment-card__media img, .photo-feature-card__media img, .klimt-photo-strip img, .editorial-photo img, .portrait-arch img').forEach((img) => {
  gsap.to(img, {
    yPercent: -10,
    ease: 'none',
    scrollTrigger: {
      trigger: img.closest('section') || img.parentElement,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });
});

// --- 6. Custom Magnetic Cursor & Buttons ---
const cursor = document.getElementById('custom-cursor');
const cursorLabel = document.getElementById('cursor-label');

if (cursor && window.matchMedia('(hover: hover)').matches) {
  window.addEventListener('pointermove', (e) => {
    gsap.to(cursor, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.18,
      ease: 'power2.out'
    });
  }, { passive: true });

  document.querySelectorAll('[data-cursor]').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      if (cursorLabel) cursorLabel.textContent = el.getAttribute('data-cursor') || 'VER';
      cursor.classList.add('is-active');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-active');
    });
  });
}

document.querySelectorAll('.magnetic').forEach((btn) => {
  btn.addEventListener('pointermove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.22;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.22;
    gsap.to(btn, { x, y, duration: 0.3, ease: 'power2.out' });
  });
  btn.addEventListener('pointerleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.45, ease: 'elastic.out(1, 0.5)' });
  });
});

// --- 7. Mobile Drawer ---
const menuToggle = document.getElementById('menu-toggle');
const menuClose = document.getElementById('menu-close');
const mobileDrawer = document.getElementById('mobile-drawer');

function closeDrawer() {
  mobileDrawer?.classList.remove('is-open');
}
menuToggle?.addEventListener('click', () => mobileDrawer?.classList.add('is-open'));
menuClose?.addEventListener('click', closeDrawer);
document.querySelectorAll('.drawer-link').forEach((link) => {
  link.addEventListener('click', closeDrawer);
});

// --- 8. Interactive Modal (Matchmaker + WhatsApp) ---
const modalBackdrop = document.getElementById('modal-backdrop');
const modalClose = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const chips = document.querySelectorAll('#modal-chips .option-chip');
const whatsappLink = document.getElementById('modal-whatsapp-link');

function updateWhatsappUrl(selectedTopic) {
  const msg = encodeURIComponent(`Olá! Gostaria de agendar minha avaliação e saber mais sobre: ${selectedTopic}.`);
  if (whatsappLink) {
    whatsappLink.href = `https://wa.me/5500000000000?text=${msg}`;
  }
}

function openModal(mode, preselect) {
  if (!modalBackdrop) return;
  if (mode === 'tratamento') {
    if (modalTitle) modalTitle.textContent = 'Encontre seu tratamento ideal';
    if (modalDesc) modalDesc.textContent = 'Qual área você gostaria de priorizar neste momento?';
  } else if (mode === 'whatsapp') {
    if (modalTitle) modalTitle.textContent = 'Agende seu horário pelo WhatsApp';
    if (modalDesc) modalDesc.textContent = 'Escolha o foco do seu atendimento para agilizar seu agendamento com nossa equipe.';
  } else {
    if (modalTitle) modalTitle.textContent = 'Agendar minha avaliação';
    if (modalDesc) modalDesc.textContent = 'Você não precisa saber exatamente qual procedimento fazer. Escolha uma opção abaixo para conversarmos:';
  }

  if (preselect) {
    chips.forEach((chip) => {
      const match = chip.getAttribute('data-value')?.toUpperCase() === preselect.toUpperCase();
      chip.classList.toggle('is-selected', match);
      if (match) updateWhatsappUrl(chip.getAttribute('data-value'));
    });
  }
  modalBackdrop.classList.add('is-open');
}

function closeModal() {
  modalBackdrop?.classList.remove('is-open');
}

document.querySelectorAll('[data-open-modal]').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    openModal(trigger.getAttribute('data-open-modal'));
  });
});

document.querySelectorAll('.treatment-card[data-treatment]').forEach((card) => {
  card.addEventListener('click', () => {
    openModal('tratamento', card.getAttribute('data-treatment'));
  });
});

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((c) => c.classList.remove('is-selected'));
    chip.classList.add('is-selected');
    updateWhatsappUrl(chip.getAttribute('data-value') || 'Avaliação Personalizada');
  });
});

modalClose?.addEventListener('click', closeModal);
modalBackdrop?.addEventListener('click', (e) => {
  if (e.target === modalBackdrop) closeModal();
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

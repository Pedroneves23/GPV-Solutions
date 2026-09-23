const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

const introLoader = document.querySelector('.intro-loader');
if (introLoader && !reducedMotion) {
  document.body.classList.add('intro-active');
  window.setTimeout(() => {
    document.body.classList.remove('intro-active');
    introLoader.remove();
  }, 2500);
} else if (introLoader) {
  introLoader.remove();
}

const setHeader = () => header.classList.toggle('scrolled', window.scrollY > 24);
setHeader();
window.addEventListener('scroll', setHeader, { passive: true });

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'Abrir menu' : 'Fechar menu');
  mobileMenu.classList.toggle('open', !open);
  document.body.classList.toggle('menu-open', !open);
});

mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
  mobileMenu.classList.remove('open');
  document.body.classList.remove('menu-open');
}));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      return;
    }

    entry.target.classList.remove('visible');
    if (!entry.target.classList.contains('reveal')) return;

    const exitedAbove = entry.boundingClientRect.bottom <= 0;
    entry.target.classList.toggle('reveal-from-top', exitedAbove);
    entry.target.classList.toggle('reveal-from-bottom', !exitedAbove);
  });
}, { threshold: 0.12, rootMargin: '-24px 0px -40px' });

document.querySelectorAll('.reveal').forEach(el => {
  el.classList.add('reveal-from-bottom');
  observer.observe(el);
});
document.querySelectorAll('.timeline').forEach(el => observer.observe(el));

if (!reducedMotion && window.matchMedia('(pointer:fine)').matches) {
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  let mouseX = -100, mouseY = -100, ringX = -100, ringY = -100;
  window.addEventListener('mousemove', event => { mouseX = event.clientX; mouseY = event.clientY; dot.style.left = `${mouseX}px`; dot.style.top = `${mouseY}px`; });
  const follow = () => { ringX += (mouseX - ringX) * .14; ringY += (mouseY - ringY) * .14; ring.style.left = `${ringX}px`; ring.style.top = `${ringY}px`; requestAnimationFrame(follow); };
  follow();
  document.querySelectorAll('a, button, summary, .service-item, .project').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
  document.querySelectorAll('.magnetic').forEach(button => {
    button.addEventListener('mousemove', event => { const r = button.getBoundingClientRect(); button.style.transform = `translate(${(event.clientX-r.left-r.width/2)*.1}px,${(event.clientY-r.top-r.height/2)*.16}px)`; });
    button.addEventListener('mouseleave', () => button.style.transform = '');
  });
  const visual = document.querySelector('[data-parallax]');
  window.addEventListener('mousemove', event => {
    const factor = Number(visual.dataset.parallax);
    visual.style.transform = `translate(${(event.clientX-innerWidth/2)*factor}px,${(event.clientY-innerHeight/2)*factor}px)`;
  });
}

const slides = document.querySelector('.testimonial-track');
const slideItems = document.querySelectorAll('.testimonial');
const sliderProgress = document.querySelector('.slider-progress span');
let activeSlide = 0;
const showSlide = index => {
  activeSlide = (index + slideItems.length) % slideItems.length;
  slides.style.transform = `translateX(-${activeSlide * 100}%)`;
  sliderProgress.style.transform = `translateX(${activeSlide * 100}%)`;
};
document.querySelector('.slider-prev').addEventListener('click', () => showSlide(activeSlide - 1));
document.querySelector('.slider-next').addEventListener('click', () => showSlide(activeSlide + 1));

document.querySelectorAll('.accordion details').forEach(item => item.addEventListener('toggle', () => {
  if (!item.open) return;
  document.querySelectorAll('.accordion details').forEach(other => { if (other !== item) other.open = false; });
}));

const form = document.querySelector('.contact-form');
const status = document.querySelector('.form-status');
form.addEventListener('submit', event => {
  event.preventDefault();
  form.querySelectorAll('.field').forEach(field => field.classList.remove('invalid'));
  const invalid = [...form.querySelectorAll('[required]')].filter(input => !input.checkValidity());
  if (invalid.length) {
    invalid.forEach(input => input.closest('.field').classList.add('invalid'));
    status.textContent = 'Revise os campos obrigatórios.';
    status.className = 'form-status error';
    invalid[0].focus();
    return;
  }
  form.classList.add('loading');
  status.textContent = 'Enviando sua mensagem...';
  status.className = 'form-status';
  window.setTimeout(() => {
    form.classList.remove('loading');
    status.textContent = 'Mensagem preparada com sucesso. Conecte o formulário ao seu serviço de envio para receber contatos reais.';
    status.className = 'form-status success';
    form.reset();
  }, 900);
});

document.querySelector('#whatsapp').addEventListener('input', event => {
  let value = event.target.value.replace(/\D/g, '').slice(0, 11);
  value = value.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
  event.target.value = value;
});

document.querySelector('#year').textContent = new Date().getFullYear();

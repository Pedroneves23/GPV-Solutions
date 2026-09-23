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

const setMenuState = open => {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  mobileMenu.setAttribute('aria-hidden', String(!open));
  mobileMenu.inert = !open;
  mobileMenu.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
};

setMenuState(false);

menuButton.addEventListener('click', () => {
  setMenuState(menuButton.getAttribute('aria-expanded') !== 'true');
});

mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  setMenuState(false);
}));

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') setMenuState(false);
});

window.addEventListener('pageshow', () => setMenuState(false));
window.addEventListener('resize', () => {
  if (window.innerWidth > 1080) setMenuState(false);
});

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

  const data = new FormData(form);
  const message = [
    'Olá, GPV Solutions!',
    '',
    'Gostaria de conversar sobre um novo projeto.',
    '',
    `*Nome:* ${data.get('nome')}`,
    `*Empresa:* ${data.get('empresa') || 'Não informada'}`,
    `*E-mail:* ${data.get('email')}`,
    `*WhatsApp:* ${data.get('whatsapp')}`,
    `*Tipo de projeto:* ${data.get('tipo')}`,
    '',
    '*Mensagem:*',
    data.get('mensagem')
  ].join('\n');

  const whatsappUrl = `https://wa.me/5531990140015?text=${encodeURIComponent(message)}`;
  form.classList.add('loading');
  status.textContent = 'Abrindo o WhatsApp...';
  status.className = 'form-status';

  if (window.matchMedia('(pointer: coarse)').matches) {
    window.location.href = whatsappUrl;
  } else {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }

  window.setTimeout(() => {
    form.classList.remove('loading');
    status.textContent = 'Mensagem preparada. Confirme o envio no WhatsApp.';
    status.className = 'form-status success';
    form.reset();
  }, 600);
});

document.querySelector('#whatsapp').addEventListener('input', event => {
  let value = event.target.value.replace(/\D/g, '').slice(0, 11);
  value = value.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
  event.target.value = value;
});

document.querySelector('#year').textContent = new Date().getFullYear();

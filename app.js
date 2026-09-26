const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

const introLoader = document.querySelector('.intro-loader');
if (introLoader && !reducedMotion) {
  document.body.classList.add('intro-active');
  let introTimer;
  const finishIntro = () => {
    window.clearTimeout(introTimer);
    document.body.classList.remove('intro-active');
    introLoader.remove();
    window.removeEventListener('keydown', skipIntro);
    introLoader.removeEventListener('pointerdown', finishIntro);
  };
  const skipIntro = event => {
    if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') finishIntro();
  };
  window.addEventListener('keydown', skipIntro);
  introLoader.addEventListener('pointerdown', finishIntro);
  introTimer = window.setTimeout(finishIntro, 3500);
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

const projectCarousel = document.querySelector('.project-carousel');
if (projectCarousel) {
  const viewport = projectCarousel.querySelector('.project-viewport');
  const track = projectCarousel.querySelector('.project-track');
  const projects = [...projectCarousel.querySelectorAll('[data-project-slide]')];
  const dots = projectCarousel.querySelector('.project-dots');
  let activeProject = Math.min(1, projects.length - 1);

  projects.forEach((project, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Exibir projeto ${index + 1}`);
    dot.addEventListener('click', () => showProject(index));
    dots.appendChild(dot);
    project.addEventListener('click', event => {
      if (!event.target.closest('a') && index !== activeProject) showProject(index);
    });
  });

  const showProject = index => {
    activeProject = (index + projects.length) % projects.length;
    projects.forEach((project, projectIndex) => {
      const isActive = projectIndex === activeProject;
      project.classList.toggle('active', isActive);
      project.setAttribute('aria-hidden', String(!isActive));
      project.inert = !isActive;
    });
    [...dots.children].forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === activeProject));

    const active = projects[activeProject];
    const viewportPadding = Number.parseFloat(window.getComputedStyle(viewport).paddingLeft) || 0;
    const offset = viewport.clientWidth / 2 - viewportPadding - (active.offsetLeft + active.offsetWidth / 2);
    track.style.transform = `translate3d(${offset}px, 0, 0)`;
  };

  projectCarousel.querySelector('.project-prev').addEventListener('click', () => showProject(activeProject - 1));
  projectCarousel.querySelector('.project-next').addEventListener('click', () => showProject(activeProject + 1));
  projectCarousel.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') showProject(activeProject - 1);
    if (event.key === 'ArrowRight') showProject(activeProject + 1);
  });
  window.addEventListener('resize', () => window.requestAnimationFrame(() => showProject(activeProject)));
  window.requestAnimationFrame(() => showProject(activeProject));
}

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

document.querySelectorAll('.accordion details').forEach(item => item.addEventListener('toggle', () => {
  if (!item.open) return;
  document.querySelectorAll('.accordion details').forEach(other => { if (other !== item) other.open = false; });
}));

const form = document.querySelector('.contact-form');
const status = document.querySelector('.form-status');
const submitButton = form.querySelector('[type="submit"]');
const googleFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSf8DRONQ4j1U1mt8keL3B1zpy9bxGyIFqabk0HuXT4O3WQN7w/formResponse';
const googleFormFields = {
  nome: 'entry.1281676468',
  empresa: 'entry.1934653881',
  email: 'entry.569316418',
  whatsapp: 'entry.1914806971',
  tipo: 'entry.1743860925',
  mensagem: 'entry.1540573863'
};

form.addEventListener('submit', async event => {
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
  const googleData = new URLSearchParams();
  Object.entries(googleFormFields).forEach(([field, entry]) => {
    googleData.set(entry, String(data.get(field) || ''));
  });

  form.classList.add('loading');
  form.setAttribute('aria-busy', 'true');
  submitButton.disabled = true;
  status.textContent = 'Enviando projeto...';
  status.className = 'form-status';

  try {
    await fetch(googleFormUrl, {
      method: 'POST',
      mode: 'no-cors',
      body: googleData
    });

    status.textContent = 'Projeto enviado com sucesso. Em breve entraremos em contato.';
    status.className = 'form-status success';
    form.reset();
  } catch (error) {
    status.textContent = 'Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp.';
    status.className = 'form-status error';
  } finally {
    form.classList.remove('loading');
    form.removeAttribute('aria-busy');
    submitButton.disabled = false;
  }
});

document.querySelector('#whatsapp').addEventListener('input', event => {
  let value = event.target.value.replace(/\D/g, '').slice(0, 11);
  value = value.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
  event.target.value = value;
});

document.querySelector('#year').textContent = new Date().getFullYear();

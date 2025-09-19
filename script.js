// Typed effect for the hero tagline
const typingElement = document.querySelector('.typing');
const phrases = [
  'Web Developer',
  'Computer Science Student',
  'Problem Solver'
];
let currentPhraseIndex = 0;
let currentCharIndex = 0;
let deleting = false;

function type() {
  const currentPhrase = phrases[currentPhraseIndex];
  if (!deleting) {
    typingElement.textContent = currentPhrase.substring(0, currentCharIndex + 1);
    currentCharIndex++;
    if (currentCharIndex === currentPhrase.length) {
      deleting = true;
      setTimeout(type, 1500); // pause at the end of the phrase
      return;
    }
  } else {
    typingElement.textContent = currentPhrase.substring(0, currentCharIndex - 1);
    currentCharIndex--;
    if (currentCharIndex === 0) {
      deleting = false;
      currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
    }
  }
  setTimeout(type, deleting ? 80 : 120);
}

// Initialize typed effect when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  type();
  initReveal();
  initProgressBars();
  initModal();
  initNav();
  document.getElementById('year').textContent = new Date().getFullYear();
});

// Reveal animation using Intersection Observer
function initReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealElements.forEach(el => observer.observe(el));
}

// Animate progress bars when in view
function initProgressBars() {
  const bars = document.querySelectorAll('.progress-bar');
  // Preassign progress width CSS variable
  bars.forEach(bar => {
    const progress = bar.getAttribute('data-progress');
    bar.style.setProperty('--progress-width', progress + '%');
  });
  // Automatically append progress indicators and let CSS animate them
  bars.forEach(bar => {
    if (!bar.querySelector('.progress-indicator')) {
      const indicator = document.createElement('div');
      indicator.className = 'progress-indicator';
      bar.appendChild(indicator);
    }
  });
}

// Modal functionality for project details
function initModal() {
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = modal.querySelector('.close-btn');
  const detailButtons = document.querySelectorAll('.details-btn');

  const projectDetails = {
    '1': {
      title: 'Weather App',
      description:
        'This responsive weather application consumes a public weather API to display real‑time conditions and forecasts. It features geolocation search, multi‑day forecasts, and dynamic backgrounds based on weather conditions.',
      link: '#'
    },
    '2': {
      title: 'Personal Portfolio',
      description:
        'The project you are viewing now! A modern, responsive portfolio created using HTML, CSS and vanilla JavaScript. It features smooth scrolling, animated content reveals, modal dialogs, and responsive design principles.',
      link: '#'
    },
    '3': {
      title: 'Chatbot',
      description:
        'An intelligent chatbot built with natural language processing. It can answer common questions, provide recommendations and is built with Python using an NLP library. The project showcases back‑end logic and front‑end integration.',
      link: '#'
    }
  };

  detailButtons.forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.currentTarget.getAttribute('data-project');
      const project = projectDetails[id];
      modalBody.innerHTML = `<h3>${project.title}</h3><p>${project.description}</p>`;
      modal.classList.add('show');
    });
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
  });
  modal.addEventListener('click', e => {
    if (e.target === modal) {
      modal.classList.remove('show');
    }
  });
}

// Responsive navigation menu and active link highlighting
function initNav() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');
  const navItems = navLinks.querySelectorAll('a');

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('active');
  });

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
    });
  });

  // Highlight active navigation link on scroll
  const sections = document.querySelectorAll('section');
  const options = {
    threshold: 0.6
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navItems.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href').substring(1) === entry.target.id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, options);

  sections.forEach(section => observer.observe(section));
}
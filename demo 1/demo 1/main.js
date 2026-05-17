/* ========================================
   YUVRAJ GUPTA — Premium Portfolio
   Main JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ---------- Preloader ----------
  const preloader = document.querySelector('.preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('loaded');
      }, 800);
    });
    // Fallback: remove after 3s
    setTimeout(() => {
      preloader.classList.add('loaded');
    }, 3000);
  }

  // ---------- Navbar Scroll Effect ----------
  const navbar = document.querySelector('.navbar');
  const handleScroll = () => {
    if (window.scrollY > 60) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // initial check

  // ---------- Mobile Nav Toggle ----------
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ---------- Active Nav Link ----------
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ---------- Scroll Reveal ----------
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach((el, i) => {
    el.style.transitionDelay = `${i % 3 * 0.1}s`;
    revealObserver.observe(el);
  });

  // ---------- Back to Top Button ----------
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---------- Cursor Glow Effect ----------
  const cursorGlow = document.querySelector('.cursor-glow');
  if (cursorGlow && window.matchMedia('(min-width: 769px)').matches) {
    document.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
    });
  }

  // ---------- Counter Animation ----------
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.getAttribute('data-count'));
          const suffix = entry.target.getAttribute('data-suffix') || '';
          let current = 0;
          const step = Math.ceil(target / 40);
          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            entry.target.textContent = current + suffix;
          }, 40);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
  }

  // ---------- Project Filter ----------
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('[data-category]');

  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        projectCards.forEach(card => {
          if (filter === 'all' || card.getAttribute('data-category') === filter) {
            card.style.display = '';
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
              card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            }, 50);
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // ---------- Contact Form ----------
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Simulate form submission
      const btn = contactForm.querySelector('.form-submit');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span>Sending...</span>';
      btn.disabled = true;

      setTimeout(() => {
        contactForm.style.display = 'none';
        const successMsg = document.querySelector('.form-success');
        if (successMsg) {
          successMsg.classList.add('show');
        }
      }, 1500);
    });
  }

  // ---------- Smooth scroll for anchor links ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ---------- Typing effect for hero subtitle ----------
  const typingEl = document.querySelector('.typing-effect');
  if (typingEl) {
    const texts = JSON.parse(typingEl.getAttribute('data-texts'));
    let textIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let currentText = '';

    function type() {
      const fullText = texts[textIdx];

      if (isDeleting) {
        currentText = fullText.substring(0, charIdx - 1);
        charIdx--;
      } else {
        currentText = fullText.substring(0, charIdx + 1);
        charIdx++;
      }

      typingEl.textContent = currentText;

      let speed = isDeleting ? 40 : 80;

      if (!isDeleting && charIdx === fullText.length) {
        speed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        textIdx = (textIdx + 1) % texts.length;
        speed = 500;
      }

      setTimeout(type, speed);
    }

    type();
  }

  // ---------- AI Chatbot Functionality ----------
  const chatbotToggle = document.getElementById('chatbot-toggle');
  const chatbotWindow = document.getElementById('chatbot-window');
  const chatbotClose = document.getElementById('chatbot-close');
  const chatbotInput = document.getElementById('chatbot-input');
  const chatbotSend = document.getElementById('chatbot-send');
  const chatbotMessages = document.getElementById('chatbot-messages');

  if (chatbotToggle && chatbotWindow) {
    const toggleChat = () => {
      chatbotWindow.classList.toggle('active');
    };

    chatbotToggle.addEventListener('click', toggleChat);
    chatbotClose.addEventListener('click', () => chatbotWindow.classList.remove('active'));

    const botResponses = [
      "That's interesting! I'm an AI designed to showcase what Akarshit can build.",
      "Akarshit specializes in high-end websites and AI integrations. Need a quote?",
      "I might just be a simple demo bot, but Akarshit can build much smarter ones using modern APIs!",
      "I see! You can reach Akarshit directly via the contact form or WhatsApp for more details.",
      "Awesome. Did you know this entire portfolio is built from scratch with custom UI?",
      "Feel free to check out the Projects page to see Akarshit's latest work."
    ];

    const addMessage = (text, isUser = false) => {
      const msgDiv = document.createElement('div');
      msgDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'}`;
      msgDiv.innerHTML = `<p>${text}</p>`;
      chatbotMessages.appendChild(msgDiv);
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    };

    const handleSend = () => {
      const text = chatbotInput.value.trim();
      if (!text) return;
      
      addMessage(text, true);
      chatbotInput.value = '';
      
      // Simulate bot typing
      setTimeout(() => {
        const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
        addMessage(randomResponse, false);
      }, 1000);
    };

    chatbotSend.addEventListener('click', handleSend);
    chatbotInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }

});

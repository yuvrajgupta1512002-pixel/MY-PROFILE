/* ========================================
   YUVRAJ GUPTA — Premium Portfolio
   Main JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ---------- Preloader ----------
  const preloader = document.querySelector('.preloader');
  if (preloader) {
    // Animate hero content on page load
    const animateHeroOnLoad = () => {
      const heroContent = document.querySelector('.hero-content');
      const heroImage = document.querySelector('.hero-image');

      if (heroContent) {
        heroContent.style.animation = 'none';
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(30px)';

        setTimeout(() => {
          heroContent.style.animation = 'fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards';
        }, 50);
      }

      if (heroImage) {
        heroImage.style.animation = 'none';
        heroImage.style.opacity = '0';
        heroImage.style.transform = 'scale(0.95) translateY(30px)';

        setTimeout(() => {
          heroImage.style.animation = 'fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s forwards';
        }, 50);
      }
    };

    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('loaded');
        animateHeroOnLoad();

        // Trigger name animation with a small delay
        setTimeout(() => {
          const nameAnimation = document.querySelector('.name-animation');
          if (nameAnimation) {
            nameAnimation.classList.add('animate');
            // Force animation to start
            nameAnimation.offsetHeight;
          }
        }, 100);
      }, 1000);
    });
    // Fallback: remove after 3.5s
    setTimeout(() => {
      preloader.classList.add('loaded');
      animateHeroOnLoad();

      // Trigger name animation with a small delay
      setTimeout(() => {
        const nameAnimation = document.querySelector('.name-animation');
        if (nameAnimation) {
          nameAnimation.classList.add('animate');
          // Force animation to start
          nameAnimation.offsetHeight;
        }
      }, 100);
    }, 3500);
  }

  // ---------- Startup Popup ----------
  const startupPopup = document.querySelector('.startup-popup');
  const popupClose = document.querySelector('.popup-close');
  const popupPrimary = document.querySelector('.popup-primary');
  const popupSecondary = document.querySelector('.popup-secondary');

  if (startupPopup) {
    // Check if popup has been shown before in this session
    const hasSeenPopup = sessionStorage.getItem('popupShown');

    // Show popup after preloader with delay
    if (!hasSeenPopup) {
      setTimeout(() => {
        startupPopup.classList.add('show');
        sessionStorage.setItem('popupShown', 'true');
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
      }, 1500); // Appears after preloader ends
    }

    // Close popup function
    const closePopup = () => {
      startupPopup.classList.remove('show');
      document.body.style.overflow = '';
    };

    // Close button
    if (popupClose) {
      popupClose.addEventListener('click', closePopup);
    }

    // Secondary button (Skip)
    const popupSecondaryBtn = document.querySelector('#popupSecondary');
    if (popupSecondaryBtn) {
      popupSecondaryBtn.addEventListener('click', closePopup);
    }

    // Primary button (Explore)
    const popupPrimaryBtn = document.querySelector('#popupPrimary');
    if (popupPrimaryBtn) {
      popupPrimaryBtn.addEventListener('click', () => {
        closePopup();
        // Navigate to projects
        window.location.href = 'projects.html';
      });
    }

    // Close popup when clicking overlay
    const popupOverlay = document.querySelector('.popup-overlay');
    if (popupOverlay) {
      popupOverlay.addEventListener('click', closePopup);
    }
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

  // ========== DYNAMIC BACKGROUND & PARTICLES ==========
  (function () {
    // 1. Add animated gradient layer
    const animatedBg = document.createElement('div');
    animatedBg.className = 'animated-bg';
    document.body.prepend(animatedBg);

    // 2. Parallax grid effect on mousemove
    const grid = document.querySelector('.bg-grid');
    if (grid && window.matchMedia('(min-width: 769px)').matches) {
      document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        const moveX = (x - 0.5) * 20;
        const moveY = (y - 0.5) * 20;
        grid.style.backgroundPosition = `${moveX}px ${moveY}px`;
      });
    }

    // 3. Floating particles system
    function createParticle() {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      const size = Math.random() * 6 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.background = `radial-gradient(circle, 
      rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 100}, 255, 0.5), 
      rgba(168, 85, 247, 0.3))`;
      const duration = Math.random() * 12 + 8;
      particle.style.animationDuration = `${duration}s`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      document.body.appendChild(particle);

      // remove after animation ends
      setTimeout(() => particle.remove(), duration * 1000);
    }

    // spawn particles every 400ms, limit total to 40
    let particleInterval;
    function startParticles() {
      if (particleInterval) clearInterval(particleInterval);
      particleInterval = setInterval(() => {
        if (document.querySelectorAll('.particle').length < 40) {
          createParticle();
        }
      }, 400);
    }
    startParticles();

    // reduce particles on mobile for performance
    if (window.matchMedia('(max-width: 768px)').matches) {
      clearInterval(particleInterval);
      setInterval(() => {
        if (document.querySelectorAll('.particle').length < 15) createParticle();
      }, 800);
    }

    // 4. Enhance cursor glow with dynamic color shift
    const cursor = document.querySelector('.cursor-glow');
    if (cursor && window.matchMedia('(min-width: 769px)').matches) {
      document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';

        // color shift based on mouse position
        const hue = (e.clientX / window.innerWidth) * 360;
        cursor.style.background = `radial-gradient(circle, 
        hsla(${hue}, 80%, 60%, 0.25), 
        hsla(${hue + 40}, 80%, 60%, 0.15), 
        transparent 70%)`;
      });
    }
  })();

  // ---------- Cursor Glow Effect ----------

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
  /* Commented out to allow real PHP submission
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
  */

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

  // ---------- AI Chatbot ----------
  const chatbotToggle   = document.getElementById('chatbot-toggle');
  const chatbotWindow   = document.getElementById('chatbot-window');
  const chatbotClose    = document.getElementById('chatbot-close');
  const chatbotInput    = document.getElementById('chatbot-input');
  const chatbotSend     = document.getElementById('chatbot-send');
  const chatbotMessages = document.getElementById('chatbot-messages');

  if (chatbotToggle && chatbotWindow) {

    // Conversation history for context-aware replies
    const conversationHistory = [];

    // Toggle open/close
    chatbotToggle.addEventListener('click', () => {
      const isOpen = chatbotWindow.classList.toggle('active');
      if (isOpen) {
        chatbotInput.focus();
        // Show quick-reply chips on first open
        if (!chatbotWindow.dataset.chipsShown) {
          chatbotWindow.dataset.chipsShown = '1';
          setTimeout(showQuickReplies, 400);
        }
      }
    });
    chatbotClose.addEventListener('click', () => chatbotWindow.classList.remove('active'));

    // Quick reply chips
    const QUICK_REPLIES = [
      "What services do you offer?",
      "What is the pricing?",
      "How can I contact Akarshit?",
      "Show me your projects"
    ];

    function showQuickReplies() {
      const wrap = document.createElement('div');
      wrap.className = 'chatbot-chips';
      wrap.innerHTML = QUICK_REPLIES.map(q =>
        `<button class="chatbot-chip">${q}</button>`
      ).join('');
      chatbotMessages.appendChild(wrap);
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

      wrap.querySelectorAll('.chatbot-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          chatbotInput.value = btn.textContent;
          wrap.remove();
          handleSend();
        });
      });
    }

    // Add message bubble
    function addMessage(text, isUser = false) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'}`;
      // Convert **bold** markdown and newlines
      const html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
      msgDiv.innerHTML = `<p>${html}</p>`;
      chatbotMessages.appendChild(msgDiv);
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // Typing indicator
    function showTyping() {
      const el = document.createElement('div');
      el.className = 'chat-message bot-message chatbot-typing';
      el.id = 'chatbot-typing';
      el.innerHTML = `<p><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></p>`;
      chatbotMessages.appendChild(el);
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    function hideTyping() {
      document.getElementById('chatbot-typing')?.remove();
    }

    // Send handler
    async function handleSend() {
      const text = chatbotInput.value.trim();
      if (!text) return;

      addMessage(text, true);
      conversationHistory.push({ role: 'user', text });
      chatbotInput.value = '';
      chatbotInput.disabled = true;
      chatbotSend.disabled = true;
      showTyping();

      try {
        const res = await fetch('gemini-api.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: conversationHistory.slice(-10) // send last 10 turns for context
          })
        });

        hideTyping();
        const data = await res.json();

        if (data.reply) {
          addMessage(data.reply, false);
          conversationHistory.push({ role: 'model', text: data.reply });
        } else {
          addMessage('Sorry, something went wrong. Please try again! 🙏', false);
        }
      } catch (err) {
        hideTyping();
        addMessage('Network error. Make sure the site is running on a local server (not file://). 🌐', false);
        console.error('Chatbot error:', err);
      } finally {
        chatbotInput.disabled = false;
        chatbotSend.disabled = false;
        chatbotInput.focus();
      }
    }

    chatbotSend.addEventListener('click', handleSend);
    chatbotInput.addEventListener('keypress', e => {
      if (e.key === 'Enter' && !e.shiftKey) handleSend();
    });
  }


  // ---------- Modern Features ----------
  // Add smooth reveal animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal');
      }
    });
  }, observerOptions);

  // Observe all elements with reveal class
  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
  });

  // Add smooth scroll behavior
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Add dynamic year to footer
  const currentYear = new Date().getFullYear();
  const yearElements = document.querySelectorAll('.current-year');
  yearElements.forEach(el => {
    el.textContent = currentYear;
  });

  /* Commented out as it can interfere with form submission
  // Add loading states to buttons
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function() {
      if (!btn.disabled) {
        btn.classList.add('loading');
        btn.disabled = true;
        
        setTimeout(() => {
          btn.classList.remove('loading');
          btn.disabled = false;
        }, 2000);
      }
    });
  });
  */

  // ---------- Dark Mode Toggle ----------
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = themeToggle?.querySelector('.theme-icon');
  
  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    if (themeIcon) themeIcon.textContent = '🌙';
  } else {
    document.body.classList.remove('dark-mode');
    if (themeIcon) themeIcon.textContent = '🌙';
  }

  // Theme toggle functionality
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDarkMode = document.body.classList.contains('dark-mode');
      
      if (isDarkMode) {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
        if (themeIcon) themeIcon.textContent = '🌙';
      } else {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
        if (themeIcon) themeIcon.textContent = '🌙';
      }
    });
  }

  // ---------- Welcome Popup Logic ----------
  const welcomePopup = document.getElementById('welcome-popup');
  const welcomePopupClose = document.getElementById('welcome-popup-close');
  const welcomePopupSkip = document.getElementById('welcome-popup-skip');

  if (welcomePopup) {
    const showPopup = () => {
      // Show popup after a short delay once page is loaded
      setTimeout(() => {
        welcomePopup.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
      }, 2000);
    };

    const hidePopup = (e) => {
      if (e) e.preventDefault();
      welcomePopup.classList.remove('active');
      document.body.style.overflow = ''; // Restore scrolling

      // Save to session storage so it doesn't show again in the same session
      sessionStorage.setItem('welcomePopupShown', 'true');
    };

    // Only show if not shown before in this session
    if (!sessionStorage.getItem('welcomePopupShown')) {
      // Wait for preloader to finish
      window.addEventListener('load', showPopup);

      // Fallback if load event already fired
      if (document.readyState === 'complete') {
        showPopup();
      }
    }

    welcomePopupClose?.addEventListener('click', hidePopup);
    welcomePopupSkip?.addEventListener('click', hidePopup);

    // Also close on overlay click
    welcomePopup.querySelector('.welcome-popup-overlay')?.addEventListener('click', hidePopup);
  }

});


/* ============================================
   YUVRAJ GUPTA — Premium Portfolio
   JavaScript: Interactions, Animations & Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ─── Loading Screen ───
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 800);
  });
  // Fallback if load event already fired
  if (document.readyState === 'complete') {
    setTimeout(() => loader.classList.add('hidden'), 800);
  }

  // ─── Cursor Glow (Desktop only) ───
  const cursorGlow = document.getElementById('cursorGlow');
  if (window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
    });
  } else {
    cursorGlow.style.display = 'none';
  }

  // ─── Navbar Scroll Effect ───
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');

  const handleScroll = () => {
    const scrollY = window.scrollY;

    // Navbar background
    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Back to top visibility
    if (scrollY > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }

    // Active nav link
    updateActiveNavLink();
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // initial check

  // ─── Active Nav Link ───
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  function updateActiveNavLink() {
    const scrollY = window.scrollY + 200;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // ─── Mobile Navigation ───
  const hamburger = document.getElementById('hamburger');
  const navLinksEl = document.getElementById('navLinks');
  const mobileOverlay = document.getElementById('mobileOverlay');

  function toggleMobileNav() {
    hamburger.classList.toggle('active');
    navLinksEl.classList.toggle('open');
    mobileOverlay.classList.toggle('open');
    document.body.style.overflow = navLinksEl.classList.contains('open') ? 'hidden' : '';
  }

  hamburger.addEventListener('click', toggleMobileNav);
  mobileOverlay.addEventListener('click', toggleMobileNav);

  // Close mobile nav on link click
  navLinksEl.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (navLinksEl.classList.contains('open')) {
        toggleMobileNav();
      }
    });
  });

  // ─── Back to Top ───
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ─── Scroll Reveal (IntersectionObserver) ───
  const revealElements = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger'
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Optional: stop observing after reveal
          // revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px',
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // ─── Smooth Scroll for Anchor Links ───
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const navHeight = navbar.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      }
    });
  });

  // ─── Contact Form ───
  const contactForm = document.getElementById('contactForm');

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const submitBtn = this.querySelector('.form-submit');
    const originalHTML = submitBtn.innerHTML;

    // Show loading state
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';

    // Simulate form submission (replace with actual endpoint)
    setTimeout(() => {
      submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Message Sent!';
      submitBtn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';

      // Reset form
      setTimeout(() => {
        contactForm.reset();
        submitBtn.innerHTML = originalHTML;
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.background = '';
      }, 2500);
    }, 1500);
  });

  // ─── Typing Effect for Hero (optional enhancement) ───
  const taglineEl = document.querySelector('.hero-tagline');
  if (taglineEl) {
    const roles = [
      'AI Creator',
      'Web Developer',
      'Digital Problem Solver',
      'UI/UX Designer',
      'Tech Innovator',
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    // Create a dynamic span for the typing text
    const dynamicSpan = taglineEl.querySelector('span');

    function typeEffect() {
      const currentRole = roles[roleIndex];

      if (isDeleting) {
        dynamicSpan.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
      } else {
        dynamicSpan.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
      }

      if (!isDeleting && charIndex === currentRole.length) {
        // Pause at end
        typingSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typingSpeed = 300;
      }

      setTimeout(typeEffect, typingSpeed);
    }

    // Start typing after loader hides
    setTimeout(typeEffect, 1500);
  }

  // ─── Parallax-lite on Hero Glow (Desktop) ───
  if (window.matchMedia('(pointer: fine)').matches) {
    const heroSection = document.querySelector('.hero');
    const glows = heroSection ? heroSection.querySelectorAll('.bg-glow') : [];

    heroSection && heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      glows.forEach((glow, i) => {
        const factor = (i + 1) * 15;
        glow.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
      });
    });
  }

  // ─── Tilt Effect on Project Cards (Desktop) ───
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.project-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const tiltX = (0.5 - y) * 8;
        const tiltY = (x - 0.5) * 8;

        card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ─── Counter Animation for Stats ───
  const statElements = document.querySelectorAll('.stat h3');
  let statsCounted = false;

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !statsCounted) {
          statsCounted = true;
          statElements.forEach((stat) => {
            const target = parseInt(stat.textContent);
            const suffix = stat.textContent.replace(/[0-9]/g, '');
            let current = 0;
            const increment = Math.ceil(target / 40);
            const interval = setInterval(() => {
              current += increment;
              if (current >= target) {
                current = target;
                clearInterval(interval);
              }
              stat.textContent = current + suffix;
            }, 40);
          });
          statsObserver.disconnect();
        }
      });
    },
    { threshold: 0.5 }
  );

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) statsObserver.observe(heroStats);

});

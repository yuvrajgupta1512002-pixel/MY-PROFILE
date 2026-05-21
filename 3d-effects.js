// ========== 3D MOUSE TRACKING & TILT EFFECTS ==========
// This file adds interactive 3D transforms based on mouse movement

document.addEventListener('DOMContentLoaded', () => {
  // Only enable 3D effects on desktop (not mobile)
  if (window.matchMedia('(min-width: 769px)').matches) {
    
    // ===== 3D TILT EFFECT FOR PROJECT & SKILL CARDS =====
    const tilt3dCards = document.querySelectorAll('.project-card, .skill-card');
    
    tilt3dCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(30px)`;
        card.style.boxShadow = `${rotateY * 2}px ${rotateX * 2}px 30px rgba(99, 102, 241, 0.3)`;
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) translateZ(0)';
        card.style.boxShadow = 'var(--shadow-glow)';
      });
    });
    
    // ===== 3D PARALLAX HERO IMAGE =====
    const heroImageWrapper = document.querySelector('.hero-image-wrapper');
    if (heroImageWrapper) {
      const heroImage = heroImageWrapper.querySelector('img');
      
      document.addEventListener('mousemove', (e) => {
        const rect = heroImageWrapper.getBoundingClientRect();
        
        // Only apply effect when hovering over hero section
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          const rotateX = (y - centerY) / 20;
          const rotateY = (centerX - x) / 20;
          
          heroImageWrapper.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        }
      });
      
      document.addEventListener('mouseleave', () => {
        heroImageWrapper.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) scale(1)';
      });
    }
    
    // ===== 3D BUTTON HOVER EFFECT =====
    const buttons = document.querySelectorAll('.btn-primary');
    buttons.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 15;
        const rotateY = (centerX - x) / 15;
        
        btn.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)';
      });
    });
    
    // ===== 3D SKILL CARD ENHANCEMENT =====
    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach((card, index) => {
      card.style.transitionDelay = `${index * 50}ms`;
      
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'scale(1.08) translateZ(30px)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'scale(1) translateZ(0)';
      });
    });
    
    console.log('✨ 3D Effects Activated! Move your mouse to see the magic.');
  }
});

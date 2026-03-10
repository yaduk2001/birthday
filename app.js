/* ============================================
   app.js — Birthday Website for Krishnendu
   ============================================ */

// ---- Generate animated stars in Hero ----
function createStars() {
    const container = document.getElementById('stars');
    if (!container) return;

    const starConfigs = [
        // Small dots
        ...Array.from({ length: 30 }, (_, i) => ({
            type: 'dot',
            x: Math.random() * 100,
            y: Math.random() * 100,
            dur: (2.5 + Math.random() * 3).toFixed(1),
            delay: (Math.random() * 4).toFixed(1),
        })),
        // Gold sparkle crosses
        ...Array.from({ length: 10 }, (_, i) => ({
            type: 'sparkle',
            char: '✦',
            x: Math.random() * 100,
            y: Math.random() * 100,
            dur: (3 + Math.random() * 4).toFixed(1),
            delay: (Math.random() * 5).toFixed(1),
        })),
        // Star crosses (pink)
        ...Array.from({ length: 8 }, (_, i) => ({
            type: 'cross',
            char: ['✦', '✺', '✸', '✼', '✻'][Math.floor(Math.random() * 5)],
            x: Math.random() * 100,
            y: Math.random() * 100,
            dur: (4 + Math.random() * 3).toFixed(1),
            delay: (Math.random() * 6).toFixed(1),
        })),
    ];

    starConfigs.forEach(cfg => {
        const el = document.createElement('span');
        el.className = `star ${cfg.type}`;
        el.style.cssText = `
      left: ${cfg.x}%;
      top: ${cfg.y}%;
      --dur: ${cfg.dur}s;
      --delay: ${cfg.delay}s;
    `;
        if (cfg.char) el.textContent = cfg.char;
        container.appendChild(el);
    });
}

// ---- Generate wish section stars ----
function createWishStars() {
    const container = document.getElementById('wishStars');
    if (!container) return;

    const items = [
        { char: '+', x: 10, y: 25 }, { char: '+', x: 90, y: 25 },
        { char: '·', x: 50, y: 15 }, { char: '✦', x: 30, y: 70 },
        { char: '✦', x: 72, y: 65 }, { char: '★', x: 15, y: 80 },
        { char: '★', x: 85, y: 82 },
    ];

    items.forEach(item => {
        const el = document.createElement('span');
        el.className = 'star sparkle';
        el.textContent = item.char;
        el.style.cssText = `
      left: ${item.x}%;
      top: ${item.y}%;
      --dur: ${(3 + Math.random() * 3).toFixed(1)}s;
      --delay: ${(Math.random() * 3).toFixed(1)}s;
      font-size: ${item.char === '·' ? '1.5rem' : '1rem'};
      color: rgba(255,255,255,0.25);
    `;
        container.appendChild(el);
    });
}

// ---- Scroll fade-in observer ----
function initScrollAnimations() {
    const targets = document.querySelectorAll(
        '.stat-card, .bento-card, .gallery-card, .wish-card-wrap, .date-display-card, .section-title, .section-label'
    );

    targets.forEach((el, i) => {
        el.classList.add('fade-in');
        el.style.transitionDelay = `${(i % 5) * 0.08}s`;
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.12 });

    targets.forEach(el => observer.observe(el));
}

// ---- Navbar scroll effect ----
function initNavbar() {
    const nav = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            nav.style.background = 'rgba(10, 8, 16, 0.92)';
        } else {
            nav.style.background = 'rgba(15, 13, 20, 0.75)';
        }
    }, { passive: true });
}

// ---- Smooth active nav link highlighting ----
function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(sec => {
            if (window.scrollY >= sec.offsetTop - 120) {
                current = sec.getAttribute('id');
            }
        });

        links.forEach(link => {
            link.style.color = link.getAttribute('href') === `#${current}`
                ? 'rgba(232, 143, 165, 0.9)'
                : 'rgba(245, 240, 255, 0.65)';
        });
    }, { passive: true });
}

// ---- Bento card 3D elastic tilt ----
function initBentoHover() {
    const cards = document.querySelectorAll('.bento-card');
    const MAX_TILT = 12;

    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();

            // Normalize mouse to -0.5 ... +0.5
            const xRel = (e.clientX - rect.left) / rect.width - 0.5;
            const yRel = (e.clientY - rect.top) / rect.height - 0.5;

            const rotY = xRel * MAX_TILT;
            const rotX = -yRel * MAX_TILT;

            // Spotlight glow tracks cursor
            card.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width * 100).toFixed(1)}%`);
            card.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height * 100).toFixed(1)}%`);

            // Fast tracking while moving
            card.style.transition = 'transform 0.08s linear, border-color 0.3s ease, box-shadow 0.3s ease';
            card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.04,1.04,1.04)`;
        });

        card.addEventListener('mouseleave', () => {
            // Elastic spring-back on leave
            card.style.transition = 'transform 0.6s cubic-bezier(0.23,1.5,0.32,1), border-color 0.3s ease, box-shadow 0.4s ease';
            card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
        });
    });
}

// ---- Date card – scroll-triggered count-up / slot roll ----
function initDateCountUp() {
    const card = document.querySelector('.date-display-card');
    const dayEl = document.getElementById('date-day');
    const monthEl = document.getElementById('date-month');
    const yearEl = document.getElementById('date-year');
    if (!card || !dayEl || !monthEl || !yearEl) return;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let fired = false;

    // Helper: flip element to new value with slide animation
    function flipTo(el, value, delay) {
        setTimeout(() => {
            el.classList.add('flipping');
            setTimeout(() => {
                el.textContent = value;
                el.classList.remove('flipping');
            }, 130);
        }, delay);
    }

    // Count a number from `from` to `to`, calling flipTo each step
    function countNumber(el, from, to, totalDuration) {
        const steps = to - from;
        const interval = totalDuration / steps;
        let current = from;
        const tick = setInterval(() => {
            current++;
            flipTo(el, current, 0);
            if (current >= to) clearInterval(tick);
        }, interval);
    }

    // Roll through months: Jan → Feb → Mar
    function rollMonths(el, targetIndex, totalDuration) {
        let i = 0;
        const interval = totalDuration / (targetIndex + 1);
        const tick = setInterval(() => {
            flipTo(el, months[i], 0);
            i++;
            if (i > targetIndex) clearInterval(tick);
        }, interval);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !fired) {
                fired = true;
                observer.disconnect();

                // Start from blank / initial low values
                dayEl.textContent = '1';
                monthEl.textContent = 'Jan';
                yearEl.textContent = '2020';

                // Day: 1 → 11 over 2200ms (~200ms per step)
                countNumber(dayEl, 1, 11, 2200);

                // Month: Jan → Feb → Mar over 1500ms (~500ms per month)
                rollMonths(monthEl, 2, 1500);

                // Year: 2020 → 2026 over 2000ms (~333ms per step, starts 200ms late)
                setTimeout(() => countNumber(yearEl, 2020, 2026, 2000), 200);
            }
        });
    }, { threshold: 0.4 });

    observer.observe(card);
}

// ---- Wish section – scroll-triggered typing effect ----
function initWishTyping() {
    const wishSection = document.getElementById('a-wish');
    const para = document.querySelector('.wish-text');
    if (!para || !wishSection) return;

    // Capture the full text content (collapse whitespace nicely)
    const fullText = para.textContent.replace(/\s+/g, ' ').trim();

    // Hide text immediately so there's no flash
    para.textContent = '';

    let hasTyped = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasTyped) {
                hasTyped = true;
                observer.disconnect();
                typeText(para, fullText, 22);
            }
        });
    }, { threshold: 0.1 });

    const cardToObserve = document.querySelector('.wish-card');
    if (cardToObserve) {
        observer.observe(cardToObserve);
    } else {
        observer.observe(wishSection);
    }
}

function typeText(el, text, speed) {
    // Create a blinking cursor span
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    el.appendChild(cursor);

    let i = 0;
    const interval = setInterval(() => {
        if (i < text.length) {
            // Insert character before the cursor
            el.insertBefore(document.createTextNode(text[i]), cursor);
            i++;
        } else {
            clearInterval(interval);
            // Let cursor blink a moment then fade out
            setTimeout(() => {
                cursor.style.transition = 'opacity 0.5s ease';
                cursor.style.opacity = '0';
                setTimeout(() => cursor.remove(), 520);
            }, 900);
        }
    }, speed);
}

// ---- Init all ----
document.addEventListener('DOMContentLoaded', () => {
    createStars();
    createWishStars();
    initScrollAnimations();
    initNavbar();
    initActiveNav();
    initBentoHover();
    initDateCountUp();
    initWishTyping();
});

/* ============================================================
   Rafiul Islam Portfolio — main.js
   ============================================================ */

/* ── CONFIG: তোমার roles ── */
const ROLES = [
    'IoT & Robotics Engineer',
    'AI Enthusiast',
    'ML Developer',
    'Embedded Systems Developer',
    'Problem Solver',
    'Innovation Creator'
];

/* ══════════════════════════════════════════════
   1. STARFIELD CANVAS
══════════════════════════════════════════════ */
function initStars() {
    const c = document.getElementById('bg-stars');
    if (!c) return;
    const ctx = c.getContext('2d');
    const resize = () => { c.width = innerWidth; c.height = innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const stars = Array.from({ length: 200 }, () => ({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        r: Math.random() * 1.2 + .2,
        a: Math.random() * .6 + .1
    }));
    (function draw() {
        ctx.clearRect(0, 0, c.width, c.height);
        stars.forEach(s => {
            s.a += (Math.random() - .5) * .014;
            s.a = Math.max(.04, Math.min(.85, s.a));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(180,160,255,${s.a})`;
            ctx.fill();
        });
        requestAnimationFrame(draw);
    })();
}

/* ══════════════════════════════════════════════
   2. CUSTOM CURSOR
══════════════════════════════════════════════ */
function initCursor() {
    const cur = document.getElementById('cursor');
    if (!cur) return;
    document.addEventListener('mousemove', e => {
        cur.style.left = e.clientX + 'px';
        cur.style.top  = e.clientY + 'px';
    });
    document.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('mouseenter', () => { cur.style.width = '22px'; cur.style.height = '22px'; cur.style.opacity = '.5'; });
        el.addEventListener('mouseleave', () => { cur.style.width = '10px'; cur.style.height = '10px'; cur.style.opacity = '1'; });
    });
}

/* ══════════════════════════════════════════════
   3. TYPING ANIMATION
══════════════════════════════════════════════ */
function initTyping() {
    const el = document.getElementById('typing');
    if (!el) return;
    let ri = 0, ci = 0, deleting = false;
    (function tick() {
        const cur = ROLES[ri];
        el.textContent = deleting ? cur.slice(0, ci - 1) : cur.slice(0, ci + 1);
        deleting ? ci-- : ci++;
        if (!deleting && ci === cur.length) setTimeout(() => deleting = true, 2200);
        else if (deleting && ci === 0) { deleting = false; ri = (ri + 1) % ROLES.length; }
        setTimeout(tick, deleting ? 45 : 95);
    })();
}

/* ══════════════════════════════════════════════
   4. NAVBAR SCROLL + ACTIVE LINK
══════════════════════════════════════════════ */
function initNavbar() {
    const nb = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        nb.style.background = scrollY > 60
            ? 'rgba(4,5,15,.97)'
            : 'rgba(4,5,15,.75)';
        let current = '';
        document.querySelectorAll('section[id]').forEach(s => {
            if (scrollY >= s.offsetTop - 110) current = s.id;
        });
        document.querySelectorAll('.nav-link').forEach(a =>
            a.classList.toggle('active', a.getAttribute('href') === '#' + current)
        );
    });
}

/* ══════════════════════════════════════════════
   5. MOBILE MENU
══════════════════════════════════════════════ */
function initMobileMenu() {
    const btn  = document.getElementById('ham');
    const menu = document.getElementById('mobile-nav');
    if (!btn || !menu) return;
    btn.addEventListener('click', () => menu.classList.toggle('open'));
    menu.querySelectorAll('a').forEach(a =>
        a.addEventListener('click', () => menu.classList.remove('open'))
    );
}

/* ══════════════════════════════════════════════
   6. SMOOTH SCROLL
══════════════════════════════════════════════ */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a =>
        a.addEventListener('click', e => {
            const t = document.querySelector(a.getAttribute('href'));
            if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
        })
    );
}

/* ══════════════════════════════════════════════
   7. SCROLL REVEAL
══════════════════════════════════════════════ */
function initReveal() {
    new IntersectionObserver(
        entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); }),
        { threshold: .1 }
    ).observe;
    // fallback: per-element observer
    document.querySelectorAll('.reveal').forEach(el =>
        new IntersectionObserver(
            entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); }),
            { threshold: .1 }
        ).observe(el)
    );
}

/* ══════════════════════════════════════════════
   8. SKILL BAR ANIMATION
══════════════════════════════════════════════ */
function initSkillBars() {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.style.width = e.target.getAttribute('data-w') + '%';
            io.unobserve(e.target);
        }
    }), { threshold: .3 });
    document.querySelectorAll('.bar-fill').forEach(b => io.observe(b));
}

/* ══════════════════════════════════════════════
   9. VIDEO MODAL
   ─────────────────────────────────────────────
   Usage in HTML:
   onclick="openVideo('https://youtu.be/YOUR_ID','Project Title')"
══════════════════════════════════════════════ */
function initVideoModal() {
    const overlay = document.getElementById('vid-modal');
    const iframe  = document.getElementById('vid-iframe');
    const title   = document.getElementById('vid-title');
    if (!overlay) return;

    window.openVideo = function(url, label) {
        let embed = url;
        if (url.includes('youtube.com/watch?v=')) {
            embed = 'https://www.youtube.com/embed/' + url.split('v=')[1].split('&')[0] + '?autoplay=1';
        } else if (url.includes('youtu.be/')) {
            embed = 'https://www.youtube.com/embed/' + url.split('youtu.be/')[1].split('?')[0] + '?autoplay=1';
        } else if (url.includes('youtube.com/shorts/')) {
            embed = 'https://www.youtube.com/embed/' + url.split('shorts/')[1].split('?')[0] + '?autoplay=1';
        }
        title.textContent = label || '';
        iframe.src = embed;
        overlay.classList.add('open');
    };

    const close = () => { overlay.classList.remove('open'); iframe.src = ''; };
    document.getElementById('vid-close').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

/* ══════════════════════════════════════════════
   10. CERTIFICATE LIGHTBOX
   ─────────────────────────────────────────────
   Usage in HTML:
   onclick="openLightbox('assets/cert-name.jpg')"
══════════════════════════════════════════════ */
function initCertLightbox() {
    const lb    = document.getElementById('lightbox');
    const lbImg = document.getElementById('lb-img');
    if (!lb) return;
    window.openLightbox = src => { lbImg.src = src; lb.classList.add('open'); };
    lb.addEventListener('click', () => lb.classList.remove('open'));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('open'); });
}

/* ══════════════════════════════════════════════
   11. CONTACT FORM
   ─────────────────────────────────────────────
   TODO: Replace alert() with Formspree or EmailJS for real sending.
   Formspree setup: https://formspree.io → get your form ID
   Then change to: fetch('https://formspree.io/f/YOUR_ID', {method:'POST',body:new FormData(e.target)})
══════════════════════════════════════════════ */
function initContactForm() {
    const form = document.getElementById('cform');
    if (!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        alert('Message sent! Thank you 🚀');
        form.reset();
    });
}

/* ══════════════════════════════════════════════
   INIT ALL
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    initStars();
    initCursor();
    initTyping();
    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initReveal();
    initSkillBars();
    initVideoModal();
    initCertLightbox();
    initContactForm();
});

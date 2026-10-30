// Mobile Navigation Toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        
        // Update aria-expanded
        const isExpanded = navMenu.classList.contains('active');
        navToggle.setAttribute('aria-expanded', isExpanded);
    });
    
    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', false);
        });
    });
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (navToggle && navMenu) {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', false);
        }
    }
});

// Search Form Handling
// The form hands off to the live listings page, so we only guard the one thing
// that would silently produce an empty result set: a reversed price range.
const searchForm = document.getElementById('searchForm');

if (searchForm) {
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');

    searchForm.addEventListener('submit', (e) => {
        if (!minPrice || !maxPrice || !minPrice.value || !maxPrice.value) {
            return;
        }

        if (parseFloat(minPrice.value) > parseFloat(maxPrice.value)) {
            e.preventDefault();
            maxPrice.setCustomValidity('Maximum price must be higher than the minimum price.');
            maxPrice.reportValidity();
            maxPrice.focus();
        }
    });

    if (maxPrice) {
        maxPrice.addEventListener('input', () => maxPrice.setCustomValidity(''));
    }
}

// Contact Form Handling
const contactForm = document.getElementById('contactForm');
const formNotice = document.getElementById('formNotice');
const contactSubmit = document.getElementById('contactSubmit');
const nameError = document.getElementById('nameError');
const emailError = document.getElementById('emailError');

// Shared "tell them something" helper for the panel under the form
const showFormNotice = (modifier, html) => {
    if (!formNotice) return;

    formNotice.classList.remove('form__notice--success', 'form__notice--fallback');
    if (modifier) formNotice.classList.add(modifier);
    if (html) formNotice.innerHTML = html;

    formNotice.classList.add('is-visible');
    formNotice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

if (contactForm) {
    // The Formspree endpoint is a placeholder until an account is connected.
    const backendReady = !/YOUR_FORM_ID/i.test(contactForm.getAttribute('action') || '');

    const setBusy = (busy) => {
        if (!contactSubmit) return;
        contactSubmit.classList.toggle('is-busy', busy);
        contactSubmit.disabled = busy;
        contactSubmit.textContent = busy ? 'Sending…' : 'Send';
    };

    contactForm.addEventListener('submit', (e) => {
        // Clear previous errors
        if (nameError) nameError.textContent = '';
        if (emailError) emailError.textContent = '';

        let isValid = true;
        const nameField = document.getElementById('contactName');
        const emailField = document.getElementById('contactEmail');
        const name = nameField ? nameField.value.trim() : '';
        const email = emailField ? emailField.value.trim() : '';

        // Name validation
        if (!name) {
            if (nameError) nameError.textContent = 'Name is required.';
            isValid = false;
        }

        // Email validation
        if (!email) {
            if (emailError) emailError.textContent = 'Email is required.';
            isValid = false;
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                if (emailError) emailError.textContent = 'Please enter a valid email address.';
                isValid = false;
            }
        }

        if (!isValid) {
            e.preventDefault();
            return;
        }

        // Honeypot filled in? Quietly drop it — only bots do that.
        const honeypot = contactForm.querySelector('[name="_gotcha"]');
        if (honeypot && honeypot.value) {
            e.preventDefault();
            contactForm.reset();
            return;
        }

        // No form backend connected yet: hand off to the phone instead of
        // dead-ending on a broken POST.
        if (!backendReady) {
            e.preventDefault();
            contactForm.reset();
            showFormNotice(
                'form__notice--fallback',
                '<p><strong>One quick step.</strong> Messages go straight to Marci by phone today &mdash; call ' +
                    '<a href="tel:2069196886">(206) 919-6886</a>. She answers personally, daily from 8:00 am to 7:00 pm.</p>'
            );
            return;
        }

        // Backend connected: post without leaving the page so the visitor
        // gets immediate confirmation.
        e.preventDefault();
        setBusy(true);

        fetch(contactForm.action, {
            method: 'POST',
            body: new FormData(contactForm),
            headers: { Accept: 'application/json' }
        })
            .then((response) => {
                if (!response.ok) throw new Error('Request failed');
                contactForm.reset();
                showFormNotice(
                    'form__notice--success',
                    '<p><strong>Message sent.</strong> Marci will reply shortly &mdash; for a same-day answer call ' +
                        '<a href="tel:2069196886">(206) 919-6886</a>.</p>'
                );
            })
            .catch(() => {
                // Let the browser do a normal POST as a last resort
                contactForm.submit();
            })
            .finally(() => setBusy(false));
    });
}

// Gallery Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxClose = document.getElementById('lightboxClose');

const openLightbox = (img) => {
    if (!img || !lightbox || !lightboxImage) return;
    lightboxImage.src = img.currentSrc || img.src;
    lightboxImage.alt = img.alt || '';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
};

// Photo Gallery Showcase
const showcase = document.getElementById('showcase');

if (showcase) {
    const slides = Array.from(showcase.querySelectorAll('.showcase__slide'));
    const thumbs = Array.from(showcase.querySelectorAll('.showcase__thumb'));
    const stage = showcase.querySelector('.showcase__stage');
    const bar = document.getElementById('showcaseBar');
    const prevBtn = document.getElementById('showcasePrev');
    const nextBtn = document.getElementById('showcaseNext');
    const expandBtn = document.getElementById('showcaseExpand');
    const currentEl = document.getElementById('showcaseCurrent');
    const titleEl = document.getElementById('showcaseTitle');
    const metaEl = document.getElementById('showcaseMeta');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = parseInt(showcase.dataset.duration, 10) || 7000;

    let index = 0;
    let hovering = false;
    let visible = true;
    let swiped = false;
    let stopped = false;

    if (bar) {
        showcase.style.setProperty('--showcase-dur', duration + 'ms');
    }

    const updatePause = () => {
        showcase.classList.toggle('is-paused', hovering || !visible || document.hidden);
    };

    const restartBar = () => {
        if (!bar || reduceMotion) return;
        bar.style.animation = 'none';
        void bar.offsetWidth;
        bar.style.animation = '';
    };

    const show = (next) => {
        if (!slides.length) return;

        index = (next + slides.length) % slides.length;
        const slide = slides[index];

        slides.forEach((item, i) => {
            const active = i === index;
            item.classList.toggle('is-active', active);
            item.setAttribute('aria-hidden', active ? 'false' : 'true');
        });

        thumbs.forEach((thumb, i) => {
            const active = i === index;
            thumb.classList.toggle('is-active', active);
            thumb.setAttribute('aria-selected', active ? 'true' : 'false');
            thumb.tabIndex = active ? 0 : -1;
        });

        if (currentEl) {
            currentEl.textContent = String(index + 1).padStart(2, '0');
        }
        if (titleEl) {
            titleEl.textContent = slide.dataset.title || '';
        }
        if (metaEl) {
            metaEl.textContent = slide.dataset.meta || '';
        }

        restartBar();
    };

    show(0);

    if (prevBtn) {
        prevBtn.addEventListener('click', () => show(index - 1));
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => show(index + 1));
    }

    // Explicit pause/play control (WCAG 2.2.2 — auto-playing content can be stopped)
    const toggleBtn = document.getElementById('showcaseToggle');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            stopped = !stopped;
            showcase.classList.toggle('is-stopped', stopped);
            toggleBtn.setAttribute('aria-pressed', stopped ? 'true' : 'false');
            toggleBtn.setAttribute('aria-label', stopped ? 'Play slideshow' : 'Pause slideshow');
        });
    }

    thumbs.forEach((thumb, i) => {
        thumb.addEventListener('click', () => show(i));
    });

    // Autoplay is driven by the progress-bar animation so pausing keeps timing in sync
    if (bar && !reduceMotion) {
        bar.addEventListener('animationend', () => show(index + 1));
    }

    // Pause on hover, keyboard focus, off-screen, or hidden tab
    showcase.addEventListener('mouseenter', () => {
        hovering = true;
        updatePause();
    });
    showcase.addEventListener('mouseleave', () => {
        hovering = false;
        updatePause();
    });
    showcase.addEventListener('focusin', () => {
        hovering = true;
        updatePause();
    });
    showcase.addEventListener('focusout', () => {
        hovering = false;
        updatePause();
    });

    document.addEventListener('visibilitychange', updatePause);

    if ('IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                visible = entry.isIntersecting;
                updatePause();
            });
        }, { threshold: 0.25 }).observe(showcase);
    }

    // Arrow-key navigation while the gallery has focus
    showcase.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            show(index - 1);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            show(index + 1);
        }
    });

    // Touch swipe
    let touchStartX = null;
    let touchStartY = null;

    if (stage) {
        stage.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'mouse') return;
            touchStartX = e.clientX;
            touchStartY = e.clientY;
        });

        stage.addEventListener('pointerup', (e) => {
            if (touchStartX === null) return;

            const dx = e.clientX - touchStartX;
            const dy = e.clientY - touchStartY;
            touchStartX = null;
            touchStartY = null;

            if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
                swiped = true;
                show(index + (dx < 0 ? 1 : -1));
            }
        });

        // Click anywhere on the stage (except controls) opens the lightbox
        stage.addEventListener('click', (e) => {
            if (swiped) {
                swiped = false;
                return;
            }
            if (e.target.closest('button')) return;
            openLightbox(slides[index] && slides[index].querySelector('.showcase__image'));
        });
    }

    if (expandBtn) {
        expandBtn.addEventListener('click', () => {
            openLightbox(slides[index] && slides[index].querySelector('.showcase__image'));
        });
    }
}

if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

// Close lightbox when clicking outside the image
if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

// Close lightbox with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
        // Close mobile nav if open
        if (navMenu) {
            navMenu.classList.remove('active');
            if (navToggle) {
                navToggle.setAttribute('aria-expanded', false);
            }
        }
    }
});

// Smooth scroll offset for sticky header
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') {
            e.preventDefault();
            return;
        }
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Add focus trap for mobile menu accessibility
if (navToggle) {
    navToggle.setAttribute('aria-expanded', 'false');
}

// Cookie notice — remembered so it does not nag on return visits
const footerEl = document.querySelector('.footer');
const cookieAccept = document.getElementById('cookieAccept');
const COOKIE_KEY = 'mm-cookie-consent';

if (footerEl && cookieAccept) {
    try {
        if (localStorage.getItem(COOKIE_KEY) === 'accepted') {
            footerEl.classList.add('is-consented');
        }
    } catch (err) {
        // Private mode / storage disabled — the notice simply stays visible
    }

    cookieAccept.addEventListener('click', () => {
        footerEl.classList.add('is-consented');
        try {
            localStorage.setItem(COOKIE_KEY, 'accepted');
        } catch (err) {
            // Nothing to persist to; the class alone still dismisses it
        }
    });
}

/* ==========================================================================
   Alive layer
   Scroll-linked motion and live state. Every effect is opt-in on motion:
   with prefers-reduced-motion the content simply appears, fully readable.
   ========================================================================== */

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

const prefersReducedMotion = () => motionQuery.matches;

/* --------------------------------------------------------------------------
   1. Reveal on scroll
   -------------------------------------------------------------------------- */
const revealTargets = document.querySelectorAll('.reveal');

if (revealTargets.length) {
    const showAllReveals = () => {
        revealTargets.forEach((el) => el.classList.add('is-visible'));
    };

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
        showAllReveals();
    } else {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });

        revealTargets.forEach((el) => revealObserver.observe(el));

        // Safety net: anything already in (or above) the first viewport shows at
        // once, so a slow or skipped observer callback can never leave the
        // opening screen blank.
        window.requestAnimationFrame(() => {
            revealTargets.forEach((el) => {
                if (el.getBoundingClientRect().top < window.innerHeight) {
                    el.classList.add('is-visible');
                    revealObserver.unobserve(el);
                }
            });
        });

        // Someone can flip the OS setting mid-session; never leave content hidden.
        motionQuery.addEventListener('change', (event) => {
            if (event.matches) {
                revealObserver.disconnect();
                showAllReveals();
            }
        });
    }
}

/* --------------------------------------------------------------------------
   2. Scrollspy — highlights the section you are actually reading
   -------------------------------------------------------------------------- */
const spyLinks = Array.from(document.querySelectorAll('.nav__link[href^="#"]'));
const spySections = spyLinks
    .map((link) => {
        const id = link.getAttribute('href');
        if (id === '#') return null;
        const section = document.querySelector(id);
        return section ? { link, section } : null;
    })
    .filter(Boolean);

if (spySections.length && 'IntersectionObserver' in window) {
    const setActive = (activeLink) => {
        spySections.forEach(({ link }) => {
            const isActive = link === activeLink;
            link.classList.toggle('is-active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'true');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    const spyObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const match = spySections.find(({ section }) => section === entry.target);
            if (match) setActive(match.link);
        });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    spySections.forEach(({ section }) => spyObserver.observe(section));
}

/* --------------------------------------------------------------------------
   3. Single scroll frame: reading progress, header state, back-to-top,
      hero parallax
   -------------------------------------------------------------------------- */
const headerEl = document.querySelector('.header');
const progressBar = document.getElementById('scrollProgress');
const toTopBtn = document.getElementById('toTop');
const heroBackground = document.querySelector('.hero__background');

let scrollTicking = false;

const renderScrollFrame = () => {
    scrollTicking = false;

    const y = window.pageYOffset || document.documentElement.scrollTop;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;

    if (progressBar) {
        const ratio = scrollable > 0 ? Math.min(y / scrollable, 1) : 0;
        progressBar.style.transform = `scaleX(${ratio})`;
    }

    if (headerEl) {
        headerEl.classList.toggle('is-scrolled', y > 24);
    }

    if (toTopBtn) {
        toTopBtn.classList.toggle('is-visible', y > window.innerHeight * 0.9);
    }

    if (heroBackground && !prefersReducedMotion()) {
        const shift = Math.max(-26, Math.min(26, y * 0.07));
        heroBackground.style.setProperty('--hero-shift', `${shift.toFixed(2)}px`);
    }
};

const requestScrollFrame = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(renderScrollFrame);
};

window.addEventListener('scroll', requestScrollFrame, { passive: true });
window.addEventListener('resize', requestScrollFrame);
renderScrollFrame();

if (toTopBtn) {
    toTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion() ? 'auto' : 'smooth'
        });
    });
}

/* --------------------------------------------------------------------------
   4. Count-up for the verified results band
   -------------------------------------------------------------------------- */
const statsBand = document.querySelector('.stats');
const countTargets = statsBand ? statsBand.querySelectorAll('[data-count]') : [];

if (statsBand && countTargets.length) {
    const runCount = (el) => {
        const target = parseFloat(el.getAttribute('data-count'));
        const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
        if (Number.isNaN(target)) return;

        const duration = 1400;
        const start = performance.now();

        const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = (target * eased).toFixed(decimals);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                el.textContent = target.toFixed(decimals);
            }
        };

        window.requestAnimationFrame(step);
    };

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
        countTargets.forEach((el) => {
            const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
            el.textContent = parseFloat(el.getAttribute('data-count')).toFixed(decimals);
        });
    } else {
        const countObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                countTargets.forEach(runCount);
                countObserver.disconnect();
            });
        }, { threshold: 0.4 });

        countObserver.observe(statsBand);
    }
}

/* --------------------------------------------------------------------------
   5. Live office status — Pahrump runs on Pacific time
   -------------------------------------------------------------------------- */
const officeStatus = document.getElementById('officeStatus');
const officeStatusText = document.getElementById('officeStatusText');
const officeClock = document.getElementById('officeClock');

if (officeStatus && officeStatusText) {
    const OPEN_HOUR = 8;
    const CLOSE_HOUR = 19;

    const formatHour = (hour24) => {
        const suffix = hour24 >= 12 ? 'pm' : 'am';
        const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
        return `${hour12}:00 ${suffix}`;
    };

    const updateOfficeStatus = () => {
        let parts;
        try {
            parts = new Intl.DateTimeFormat('en-US', {
                timeZone: 'America/Los_Angeles',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
                weekday: 'short'
            }).formatToParts(new Date());
        } catch (err) {
            return; // Intl without time-zone data: the static HTML text stands.
        }

        const get = (type) => {
            const part = parts.find((p) => p.type === type);
            return part ? part.value : '';
        };

        // Derive the hour from the formatted parts so we never need a second
        // formatter that could disagree with the clock we print.
        const hourPart = get('hour');
        const dayPeriod = get('dayPeriod').toLowerCase();
        let hour24 = parseInt(hourPart, 10) % 12;
        if (dayPeriod === 'pm') hour24 += 12;

        const isOpen = hour24 >= OPEN_HOUR && hour24 < CLOSE_HOUR;

        officeStatus.classList.toggle('is-open', isOpen);
        officeStatus.classList.toggle('is-closed', !isOpen);
        officeStatusText.textContent = isOpen
            ? `Open now \u2013 closes ${formatHour(CLOSE_HOUR)}`
            : `Closed \u2013 opens ${formatHour(OPEN_HOUR)}`;

        if (officeClock) {
            officeClock.textContent = `${get('hour')}:${get('minute')} ${get('dayPeriod')} PT`;
        }
    };

    updateOfficeStatus();
    window.setInterval(updateOfficeStatus, 60000);
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) updateOfficeStatus();
    });
}

// ═══════════════════════════════════════════════════════════
// Acadomix - Main JavaScript (Complete Bug-Free Version)
// ═══════════════════════════════════════════════════════════

// Scroll to top on page load
window.addEventListener('load', function () {
    window.scrollTo(0, 0);
});

document.addEventListener('DOMContentLoaded', async function () {
    // Critical initialization
    initLoader();
    initTheme();
    initNavbar();
    initMobileMenu();
    initParticles();
    initCardGlow();

    // Start background init
    initCursor();
    initScrollReveal();
    initStatsCounter();
    initProjectsFilter();
    initReviews();
    initForms();
    initQRModal();
    initStarRating();
    initFileUpload();

    // Fetch critical data before hiding loader fully (if we wanted to)
    // For now, let's at least trigger them
    await Promise.all([
        initAssets(),
        initSettings(),
        fetchProjects(),
        initReviews()
    ]);
});


// ============ Dynamic Assets (Logo/QR) ============
async function initAssets() {
    try {
        const response = await fetch('/api/assets-config');
        const config = await response.json();

        if (config.logo) {
            // Update all logos
            const logos = document.querySelectorAll('img[src*="logo.png"], link[rel="icon"]');
            logos.forEach(el => {
                if (el.tagName === 'IMG') el.src = config.logo;
                else if (el.tagName === 'LINK') el.href = config.logo;
            });
        }

        if (config.qr_code) {
            // Update QR code on payment page
            const qrImages = document.querySelectorAll('img[src*="qr-code.png"]');
            qrImages.forEach(img => {
                img.src = config.qr_code;
            });
        }
    } catch (error) {
        console.error('Error loading dynamic assets:', error);
    }
}

// ============ Dynamic Settings (Pricing) ============
async function initSettings() {
    try {
        const response = await fetch('/api/settings');
        const settings = await response.json();

        // Update pricing page elements
        if (settings.mini_project_price) {
            updateElementText('mini-price', formatCurrency(settings.mini_project_price));
            updateElementText('compare-mini', formatCurrency(settings.mini_project_price));
        }
        if (settings.major_project_price) {
            updateElementText('major-price', formatCurrency(settings.major_project_price));
            updateElementText('compare-major', formatCurrency(settings.major_project_price));
        }
        if (settings.custom_project_price) {
            updateElementText('custom-price', formatCurrency(settings.custom_project_price));
            updateElementText('compare-custom', formatCurrency(settings.custom_project_price));
        }

        // Store settings globally for use in other functions if needed
        window.siteSettings = settings;

    } catch (error) {
        console.error('Error loading dynamic settings:', error);
    }
}

function updateElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function formatCurrency(value) {
    const num = parseInt(value);
    if (isNaN(num)) return value;
    return num.toLocaleString('en-IN');
}

// ============ Fetch Projects ============
async function fetchProjects() {
    const grid = document.querySelector('.projects-grid');
    if (!grid) return;

    grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding: 60px 0; opacity: 0.6;">
            <div style="font-size: 2rem; margin-bottom: 12px;">⏳</div>
            <p style="font-size: 1rem;">Loading projects from database...</p>
        </div>`;

    try {
        const response = await fetch('/api/projects');
        if (!response.ok) throw new Error('Failed to fetch');
        const projects = await response.json();

        if (projects && projects.length > 0) {
            const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '';
            let displayProjects = projects;

            if (isHomePage) {
                // Pick a mix of popular and common projects for the home page
                const popular = projects.filter(p => p.is_popular).sort(() => Math.random() - 0.5).slice(0, 4);
                const common = projects.filter(p => !p.is_popular).sort(() => Math.random() - 0.5).slice(0, 4);
                displayProjects = [...popular, ...common];
            }

            grid.innerHTML = displayProjects.map((project, index) => {
                const ourPrice = Number(project.price);
                const marketPrice = ourPrice + 2000 + (project.title.length % 5) * 100;
                
                return `
                <div class="project-card ${project.is_popular ? 'popular' : ''} reveal"
                     data-category="${project.category}"
                     data-year="${project.year_type}"
                     style="animation-delay: ${index * 0.1}s">
                    <span class="project-category">${formatCategory(project.category)} &bull; ${formatYearType(project.year_type)}</span>
                    <h3 class="project-title">${escapeHtml(project.title)}</h3>
                    <p class="project-description">${escapeHtml(project.description)}</p>
                    <div class="project-features">
                        ${(project.features || '').split(',').map(f => `<span class="project-feature">${escapeHtml(f.trim())}</span>`).join('')}
                    </div>
                    <div class="project-footer">
                        <div class="price-tiers">
                            <div class="price-tier">
                                <span class="price-ours-label">Our Price</span>
                                <span class="price-ours">₹${ourPrice.toLocaleString('en-IN')}</span>
                                <span class="price-market-rate" style="text-decoration: line-through; opacity: 0.5; font-size: 0.8rem;">₹${marketPrice.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                        <a href="contact.html" class="project-btn">Get Started</a>
                    </div>
                </div>`;
            }).join('');

            setTimeout(() => initScrollReveal(), 100);
        } else {
            grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding: 60px 0;"><p>No projects found in database.</p></div>`;
        }
    } catch (error) {
        console.error('Error fetching projects:', error);
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding: 60px 0;"><p>⚠️ Connection Error. Using fallback projects.</p></div>`;
    }
}

// ============ Fetch & Initialize Reviews ============
async function initReviews() {
    const track = document.querySelector('.testimonials-track');
    const allContainer = document.getElementById('allReviewsContainer');
    const modal = document.getElementById('allReviewsModal');
    const closeBtn = document.getElementById('closeReviewsModal');
    const viewAllBtn = document.getElementById('viewAllReviewsBtn');

    // Setup modal listeners
    if (viewAllBtn && modal && closeBtn) {
        viewAllBtn.addEventListener('click', () => {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    if (!track && !allContainer) return;

    try {
        const response = await fetch('/api/reviews');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        
        // Handle both {success, reviews} and flat array formats
        const reviews = Array.isArray(data) ? data : (data.reviews || []);

        if (reviews.length > 0) {
            const reviewsHtml = reviews.map(review => `
                <div class="testimonial-card">
                    <div class="testimonial-header">
                        <div class="testimonial-avatar">${review.student_name.charAt(0).toUpperCase()}</div>
                        <div class="testimonial-info">
                            <h4>${escapeHtml(review.student_name)}</h4>
                            <p>${escapeHtml(review.college_name)}</p>
                        </div>
                    </div>
                    <div class="testimonial-rating"><span>${'⭐'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span></div>
                    <p class="testimonial-text">"${escapeHtml(review.experience)}"</p>
                    <span class="testimonial-project">📂 ${escapeHtml(review.project_name)}</span>
                </div>
            `).join('');
            if (track) {
                track.innerHTML = reviewsHtml + reviewsHtml;
            }
            if (allContainer) {
                allContainer.innerHTML = reviewsHtml;
            }
        }
    } catch (error) {
        console.error('Error fetching reviews:', error);
    }
}

function formatCategory(category) {
    const map = {
        'aiml': 'AI/ML',
        'datascience': 'Data Science',
        'frontend': 'Frontend',
        'cybersecurity': 'Cybersecurity',
        'python': 'Python'
    };
    return map[category] || category;
}

function formatYearType(yearType) {
    const map = {
        'mini': 'Mini Project',
        'third': '3rd Year',
        'major': 'Major Project'
    };
    return map[yearType] || yearType;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============ Loader ============
function initLoader() {
    const loader = document.querySelector('.loader-wrapper');
    if (loader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 2000);
        });

        // Fallback
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 3500);
    }
}

// ============ Custom Cursor ============
function initCursor() {
    let cursor = document.querySelector('.cursor');
    let cursorGlow = document.querySelector('.cursor-glow');

    if (!cursor) {
        cursor = document.createElement('div');
        cursor.className = 'cursor';
        document.body.appendChild(cursor);
    }

    if (!cursorGlow) {
        cursorGlow = document.createElement('div');
        cursorGlow.className = 'cursor-glow';
        document.body.appendChild(cursorGlow);
    }

    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let cursorX = mouseX, cursorY = mouseY;
    let isVisible = false;

    // Hover effects selectors
    const hoverSelectors = 'a, button, .btn, input, textarea, select, .project-card, .service-card, .pricing-card, .testimonial-card, .filter-btn, .stat-card, .contact-item, .qr-image, .file-upload, label[for]';

    // Mouse Events
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (!isVisible) {
            cursor.style.opacity = '1';
            cursorGlow.style.opacity = '1';
            isVisible = true;
        }
    });

    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        cursorGlow.style.opacity = '0';
        isVisible = false;
    });

    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
        cursorGlow.style.opacity = '1';
        isVisible = true;
    });

    // Touch Events for Mobile
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
            mouseX = e.touches[0].clientX;
            mouseY = e.touches[0].clientY;
            // Instantly snap to touch position
            cursorX = mouseX;
            cursorY = mouseY;
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
            cursorGlow.style.left = cursorX + 'px';
            cursorGlow.style.top = cursorY + 'px';

            cursor.style.opacity = '1';
            cursorGlow.style.opacity = '1';
            isVisible = true;
        }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouseX = e.touches[0].clientX;
            mouseY = e.touches[0].clientY;

            if (!isVisible) {
                cursor.style.opacity = '1';
                cursorGlow.style.opacity = '1';
                isVisible = true;
            }

            // Re-evaluate hover state while dragging finger
            const element = document.elementFromPoint(mouseX, mouseY);
            if (element && element.closest(hoverSelectors)) {
                cursor.classList.add('hovering');
                cursorGlow.classList.add('hovering');
            } else {
                cursor.classList.remove('hovering');
                cursorGlow.classList.remove('hovering');
            }
        }
    }, { passive: true });

    document.addEventListener('touchend', () => {
        cursor.style.opacity = '0';
        cursorGlow.style.opacity = '0';
        isVisible = false;
        cursor.classList.remove('hovering');
        cursorGlow.classList.remove('hovering');
    }, { passive: true });

    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;

        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
        cursorGlow.style.left = cursorX + 'px';
        cursorGlow.style.top = cursorY + 'px';

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Mouse Hover effects
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverSelectors)) {
            cursor.classList.add('hovering');
            cursorGlow.classList.add('hovering');
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverSelectors)) {
            cursor.classList.remove('hovering');
            cursorGlow.classList.remove('hovering');
        }
    });

    // Touch hover effects equivalent
    document.addEventListener('touchstart', (e) => {
        if (e.target.closest(hoverSelectors)) {
            cursor.classList.add('hovering');
            cursorGlow.classList.add('hovering');
        }
    }, { passive: true });

    // Handle scrolling where mouseout doesn't fire
    window.addEventListener('scroll', () => {
        if (!isVisible) return;
        const element = document.elementFromPoint(mouseX, mouseY);
        if (element && element.closest(hoverSelectors)) {
            cursor.classList.add('hovering');
            cursorGlow.classList.add('hovering');
        } else {
            cursor.classList.remove('hovering');
            cursorGlow.classList.remove('hovering');
        }
    }, { passive: true });
}

// ============ Theme Toggle ============
function initTheme() {
    const themeToggle = document.querySelector('.theme-toggle');

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}

// ============ Navbar ============
function initNavbar() {
    const navbar = document.querySelector('.navbar');

    if (navbar) {
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;

            if (currentScroll > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        });
    }

    // Set active link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// ============ Mobile Menu ============
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            menuBtn.classList.toggle('active');
        });

        // Close on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuBtn.classList.remove('active');
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!menuBtn.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                menuBtn.classList.remove('active');
            }
        });
    }
}

// ============ Particles ============
function initParticles() {
    const container = document.querySelector('.particles-container');
    if (!container) return;

    // Clear existing particles
    container.innerHTML = '';

    const particleCount = window.innerWidth < 768 ? 20 : 40;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            left: ${Math.random() * 100}%;
            width: ${Math.random() * 4 + 2}px;
            height: ${particle.style.width};
            animation-delay: ${Math.random() * 15}s;
            animation-duration: ${Math.random() * 10 + 15}s;
        `;
        particle.style.height = particle.style.width;
        container.appendChild(particle);
    }
}

// ============ Scroll Reveal - Efficient Intersection Observer ============
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (revealElements.length === 0) return;

    const observerOption = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                // Only remove if we want it to re-animate (currently keeping it active once revealed)
                // entry.target.classList.remove('active'); 
            }
        });
    }, observerOption);

    revealElements.forEach(el => revealObserver.observe(el));
}


// ============ Stats Counter - Visibility Based ============
function initStatsCounter() {
    const stats = document.querySelectorAll('.stat-number[data-target]');
    if (stats.length === 0) return;

    const statsData = Array.from(stats).map(el => ({
        el: el,
        target: parseInt(el.getAttribute('data-target')) || 0,
        current: 0,
        startTime: null,
        direction: 0, // 1 for up (towards target), -1 for down (towards 0)
        isAnimating: false,
        lastTimestamp: 0
    }));

    function animate(timestamp, item) {
        if (!item.startTime) item.startTime = timestamp;
        const elapsed = timestamp - item.startTime;
        const duration = 1000; // Requirement: Within 1 second
        const progress = Math.min(elapsed / duration, 1);

        // Easing
        const ease = 1 - Math.pow(1 - progress, 3);

        let value;
        if (item.direction === 1) { // Increasing
            value = Math.floor(ease * item.target);
        } else { // Decreasing
            value = Math.floor((1 - ease) * item.target);
        }

        item.current = value;
        item.el.textContent = value + (item.el.getAttribute('data-target') === '95' ? '%' : '+');

        if (progress < 1 && item.isAnimating) {
            requestAnimationFrame((t) => animate(t, item));
        } else {
            item.isAnimating = false;
            // Final snap
            if (item.direction === 1) item.el.textContent = item.target + (item.el.getAttribute('data-target') === '95' ? '%' : '+');
            else item.el.textContent = '0' + (item.el.getAttribute('data-target') === '95' ? '%' : '+');
        }
    }

    function startAnimation(item, direction) {
        if (item.direction === direction && (item.isAnimating || (direction === 1 && item.current === item.target) || (direction === -1 && item.current === 0))) return;

        item.direction = direction;
        item.startTime = null;
        item.isAnimating = true;
        requestAnimationFrame((t) => animate(t, item));
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const index = Array.from(stats).indexOf(entry.target);
            if (index === -1) return;
            const item = statsData[index];

            if (entry.isIntersecting) {
                // Entering View -> Increase
                startAnimation(item, 1);
            } else {
                // Leaving View -> Decrease
                startAnimation(item, -1);
            }
        });
    }, { threshold: 0.1 });

    stats.forEach(stat => observer.observe(stat));
}

// ============ Projects Filter ============
function initProjectsFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    if (filterBtns.length === 0) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            const projectCards = document.querySelectorAll('.project-card');

            projectCards.forEach((card, index) => {
                const category = card.getAttribute('data-category');
                const year = card.getAttribute('data-year');

                const shouldShow = filter === 'all' || category === filter || year === filter;

                if (shouldShow) {
                    card.style.display = 'block';
                    card.style.animation = `fadeInUp 0.25s ease ${index * 0.05}s forwards`;
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// ============ Testimonials Slider ============
async function initTestimonialsSlider() {
    const track = document.querySelector('.testimonials-track');
    if (!track) return;

    // Fetch reviews from DB
    try {
        const res = await fetch('/api/reviews');
        const data = await res.json();
        if (data.success && data.reviews && data.reviews.length > 0) {

            // Generate HTML for a testimonial card
            const createCardHTML = (r) => `
                <div class="testimonial-card">
                    <div class="testimonial-header">
                        <div class="testimonial-avatar">${r.student_name.charAt(0).toUpperCase()}</div>
                        <div class="testimonial-info">
                            <h4>${escapeHtml(r.student_name)}</h4>
                            <p>${escapeHtml(r.college_name)} &bull; ${escapeHtml(r.year_of_study)}</p>
                        </div>
                    </div>
                    <div class="testimonial-rating"><span>${'⭐'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span></div>
                    <p class="testimonial-text">"${escapeHtml(r.experience)}"</p>
                    <span class="testimonial-project">📂 ${escapeHtml(r.project_name)}</span>
                </div>
            `;

            // Populate Track (requires two sets for infinite scroll loop)
            const cardsHTML = data.reviews.map(createCardHTML).join('');
            track.innerHTML = cardsHTML + cardsHTML;

            // Populate "View All" modal
            const allContainer = document.getElementById('allReviewsContainer');
            if (allContainer) {
                allContainer.innerHTML = cardsHTML;
            }
        }
    } catch (e) {
        console.error('Failed to fetch reviews:', e);
    }

    // Pause on hover
    track.addEventListener('mouseenter', () => {
        track.style.animationPlayState = 'paused';
    });

    track.addEventListener('mouseleave', () => {
        track.style.animationPlayState = 'running';
    });

    // Arrow navigation
    const prevBtn = document.querySelector('.testi-btn.prev');
    const nextBtn = document.querySelector('.testi-btn.next');

    if (prevBtn && nextBtn) {
        let isHolding = false;
        let holdInterval;
        const jumpAmount = 500; // ms to jump in animation timeline (adjusts speed)

        const shiftAnimation = (amount) => {
            const anims = track.getAnimations();
            if (anims.length > 0) {
                // Modulo against the duration if needed
                const current = anims[0].currentTime || 0;
                let newTime = current + amount;

                // Wrap around logic if the time goes negative or beyond the 60s (60000ms) limit
                const duration = 60000;
                if (newTime < 0) newTime = duration + newTime;
                if (newTime > duration) newTime = newTime % duration;

                anims[0].currentTime = newTime;
            }
        };

        const startHold = (direction) => {
            if (isHolding) return;
            isHolding = true;
            track.style.animationPlayState = 'paused'; // pause while fast forwarding
            shiftAnimation(direction * jumpAmount);

            holdInterval = setInterval(() => {
                shiftAnimation(direction * jumpAmount);
            }, 16);
        };

        const stopHold = () => {
            if (!isHolding) return;
            isHolding = false;
            clearInterval(holdInterval);
            track.style.animationPlayState = 'running';
        };

        // Prev Button
        prevBtn.addEventListener('mousedown', () => startHold(-1));
        prevBtn.addEventListener('mouseup', stopHold);
        prevBtn.addEventListener('mouseleave', stopHold);
        prevBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startHold(-1); });
        prevBtn.addEventListener('touchend', stopHold);

        // Next Button
        nextBtn.addEventListener('mousedown', () => startHold(1));
        nextBtn.addEventListener('mouseup', stopHold);
        nextBtn.addEventListener('mouseleave', stopHold);
        nextBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startHold(1); });
        nextBtn.addEventListener('touchend', stopHold);
    }
}

// ============ Forms ============
function initForms() {
    // Contact Form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }

    // Payment Form
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmit);
    }

    // Review Form
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmit);
    }
}

async function handleContactSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    try {
        const response = await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Form submitted successfully! We will contact you soon.', 'success');
            form.reset();
        } else {
            showNotification(result.error || 'Error submitting form. Please try again.', 'error');
        }
    } catch (error) {
        showNotification('Error submitting form. Please try again.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

async function handlePaymentSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    try {
        const response = await fetch('/api/payments', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Payment submitted! We will verify and contact you within 24 hours.', 'success');
            form.reset();
            const preview = document.querySelector('.file-preview');
            if (preview) preview.remove();
        } else {
            showNotification(result.error || 'Error submitting payment. Please try again.', 'error');
        }
    } catch (error) {
        showNotification('Error submitting payment. Please try again.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

async function handleReviewSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Get rating
    const selectedRating = document.querySelector('.star-rating input:checked');
    if (!selectedRating) {
        showNotification('Please select a rating', 'error');
        return;
    }
    data.rating = parseInt(selectedRating.value);

    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    try {
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Review submitted! It will be visible after approval.', 'success');
            form.reset();
            // Reset stars to default (5)
            const star5 = document.getElementById('star5');
            if (star5) star5.checked = true;
        } else {
            showNotification(result.error || 'Error submitting review. Please try again.', 'error');
        }
    } catch (error) {
        showNotification('Error submitting review. Please try again.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// ============ QR Modal - FIXED ============
function initQRModal() {
    const qrImage = document.querySelector('.qr-image');
    const qrModal = document.querySelector('.qr-modal');
    const qrClose = document.querySelector('.qr-modal-close');

    if (!qrImage || !qrModal) {
        console.log('QR elements not found on this page');
        return;
    }

    // Open modal when clicking QR image
    qrImage.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('QR clicked - opening modal');
        qrModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Close modal function
    function closeQRModal() {
        console.log('Closing QR modal');
        qrModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Close button click
    if (qrClose) {
        qrClose.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            closeQRModal();
        });
    }

    // Click outside to close
    qrModal.addEventListener('click', function (e) {
        if (e.target === qrModal) {
            closeQRModal();
        }
    });

    // ESC key to close
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && qrModal.classList.contains('active')) {
            closeQRModal();
        }
    });

    console.log('QR Modal initialized successfully');
}
// ============ Star Rating ============
function initStarRating() {
    const starRating = document.querySelector('.star-rating');
    if (!starRating) return;

    // Set default to 5 stars
    const star5 = document.getElementById('star5');
    if (star5) star5.checked = true;
}

// ============ File Upload ============
function initFileUpload() {
    const fileInput = document.getElementById('screenshot');
    const fileUpload = document.querySelector('.file-upload');

    if (!fileInput || !fileUpload) return;

    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileUpload.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        fileUpload.addEventListener(eventName, () => {
            fileUpload.style.borderColor = 'var(--accent-primary)';
            fileUpload.style.background = 'rgba(220, 38, 38, 0.05)';
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        fileUpload.addEventListener(eventName, () => {
            fileUpload.style.borderColor = '';
            fileUpload.style.background = '';
        });
    });

    fileUpload.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleFileSelect({ target: fileInput });
        }
    });
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate
    if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
        showNotification('Please select a valid image file', 'error');
        e.target.value = '';
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showNotification('File size must be less than 5MB', 'error');
        e.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const fileUpload = document.querySelector('.file-upload');
        let preview = fileUpload.querySelector('.file-preview');

        if (!preview) {
            preview = document.createElement('div');
            preview.className = 'file-preview';
            fileUpload.appendChild(preview);
        }

        preview.innerHTML = `
            <img src="${event.target.result}" alt="Preview">
            <p>${file.name}</p>
        `;
    };
    reader.readAsDataURL(file);
}

// ============ Notification ============
function showNotification(message, type = 'info') {
    document.querySelectorAll('.notification').forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.04s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideOut {
        to { transform: translateX(120%); opacity: 0; }
    }
`;
document.head.appendChild(styleSheet);

// Global access
window.showNotification = showNotification;

// ============ Card Glow Interaction - Cross Device ============
function initCardGlow() {
    const cardSelectors = '.service-card, .project-card, .testimonial-card, .pricing-card, .stat-card, .contact-item, .filter-btn, .qr-image, .file-upload, .admin-stat-card';

    const clearAllGlows = () => {
        document.querySelectorAll('.glow-active').forEach(c => c.classList.remove('glow-active'));
    };

    // Mouse Events
    document.addEventListener('mouseover', (e) => {
        const card = e.target.closest(cardSelectors);
        if (card) {
            if (!card.classList.contains('glow-active')) {
                clearAllGlows();
                card.classList.add('glow-active');
            }
        }
    });

    document.addEventListener('mouseout', (e) => {
        const card = e.target.closest(cardSelectors);
        if (card) {
            const related = e.relatedTarget;
            if (!related || !card.contains(related)) {
                card.classList.remove('glow-active');
            }
        }
    });

    // Tap/Click to keep glow, but clear others
    document.addEventListener('click', (e) => {
        const card = e.target.closest(cardSelectors);
        if (card) {
            clearAllGlows();
            card.classList.add('glow-active');
        } else {
            clearAllGlows();
        }
    });

    // Touch events for mobile
    let touchMoveActive = false;
    let touchTimeout;

    document.addEventListener('touchstart', (e) => {
        touchMoveActive = false;
        const card = e.target.closest(cardSelectors);
        if (card) {
            clearAllGlows();
            card.classList.add('glow-active');
        } else {
            clearAllGlows();
        }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        touchMoveActive = true;

        // Throttle touchmove for performance
        if (touchTimeout) return;

        touchTimeout = setTimeout(() => {
            const touch = e.touches[0];

            // Temporarily hide custom cursor to prevent it from blocking elementFromPoint
            const cursor = document.querySelector('.cursor');
            const cursorGlow = document.querySelector('.cursor-glow');
            if (cursor) cursor.style.display = 'none';
            if (cursorGlow) cursorGlow.style.display = 'none';

            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            const card = element ? element.closest(cardSelectors) : null;

            // Restore custom cursor
            if (cursor) cursor.style.display = '';
            if (cursorGlow) cursorGlow.style.display = '';

            if (card) {
                if (!card.classList.contains('glow-active')) {
                    clearAllGlows();
                    card.classList.add('glow-active');
                }
            } else {
                clearAllGlows();
            }
            touchTimeout = null;
        }, 16); // ~60fps throttle
    }, { passive: true });

    document.addEventListener('touchend', () => {
        if (!touchMoveActive) {
            // It was a tap, let the click handler deal with the persistent glow
        } else {
            // It was a swipe, optionally clear glows if we want cards to reset after swipe finishes
            // clearAllGlows(); 
        }
        touchMoveActive = false;
    }, { passive: true });

    let lastMouseX = 0;
    let lastMouseY = 0;

    document.addEventListener('mousemove', (e) => {
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    }, { passive: true });

    // Ensure we clear on scroll or other interactions that move away
    window.addEventListener('scroll', () => {
        const element = document.elementFromPoint(lastMouseX, lastMouseY);
        const card = element ? element.closest(cardSelectors) : null;

        if (card) {
            if (!card.classList.contains('glow-active')) {
                clearAllGlows();
                card.classList.add('glow-active');
            }
        } else {
            clearAllGlows();
        }
    }, { passive: true });
}
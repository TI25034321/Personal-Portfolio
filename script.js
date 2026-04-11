const canvas = document.getElementById('backgroundCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Particle system for background
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.color = Math.random() > 0.5 ? '#00d9ff' : '#ff006e';
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around screen
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// Create particles
const particles = [];
for (let i = 0; i < 50; i++) {
    particles.push(new Particle());
}

// Draw connecting lines between nearby particles
function drawConnections() {
    const distance = 150;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < distance) {
                ctx.strokeStyle = `rgba(0, 217, 255, ${0.2 * (1 - dist / distance)})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

// Draw geometric shapes
function drawGeometricShapes() {
    const time = Date.now() * 0.0001;

    // Draw rotating circles
    for (let i = 0; i < 3; i++) {
        const x = canvas.width / 2 + Math.cos(time + i) * (100 + i * 50);
        const y = canvas.height / 2 + Math.sin(time + i) * (100 + i * 50);
        const radius = 20 + i * 10;

        ctx.strokeStyle = `rgba(0, 217, 255, ${0.1 + i * 0.05})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Draw grid pattern
    ctx.strokeStyle = 'rgba(255, 0, 110, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 100;
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Animation loop for canvas
function animateCanvas() {
    // Clear canvas with semi-transparent background for trail effect
    ctx.fillStyle = 'rgba(26, 26, 46, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    // Draw connections
    drawConnections();

    // Draw geometric shapes
    drawGeometricShapes();

    requestAnimationFrame(animateCanvas);
}

animateCanvas();

// ============================================
// FLOATING SYMBOLS ANIMATION
// ============================================

function createFloatingSymbols() {
    const container = document.getElementById('floatingSymbolsContainer');
    const mathSymbols = ['∫', 'π', 'Σ', '∂', '√', '∞', 'λ', 'θ', '∇', 'ℵ', 'ℏ', '∆'];
    const csSymbols = ['<', '>', '{', '}', '|', '&', '^', '~', '0', '1', '(', ')'];

    const symbolPool = [
        ...mathSymbols.map(s => ({ symbol: s, type: 'math' })),
        ...csSymbols.map(s => ({ symbol: s, type: 'cs' }))
    ];

    function spawnSymbol() {
        const symbolData = symbolPool[Math.floor(Math.random() * symbolPool.length)];
        const symbol = document.createElement('div');
        symbol.className = `floating-symbol symbol-${symbolData.type}`;
        symbol.textContent = symbolData.symbol;

        symbol.style.left = Math.random() * 100 + '%';
        const duration = 8 + Math.random() * 7;
        symbol.style.animationDuration = duration + 's';
        symbol.style.animationDelay = Math.random() * 5 + 's';
        symbol.style.fontSize = (1.5 + Math.random() * 1.5) + 'rem';

        container.appendChild(symbol);

        // Clean up the element precisely when its animation finishes
        symbol.addEventListener('animationend', () => {
            symbol.remove();
        });
    }

    // Initial batch
    for (let i = 0; i < 30; i++) {
        spawnSymbol();
    }

    // Continuously add new symbols
    setInterval(() => {
        if (container.children.length < 45) spawnSymbol();
    }, 500);
}

// ============================================
// SMOOTH SCROLL NAVIGATION
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// ============================================
// FETCH GITHUB PROJECTS
// ============================================

async function fetchGitHubProjects() {
    const projectsGrid = document.getElementById('projectsGrid');

    try {
        const response = await fetch('https://api.github.com/users/TI25034321/repos?sort=updated&per_page=12');

        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }

        const projects = await response.json();

        if (projects.length === 0) {
            projectsGrid.innerHTML = '<p class="loading">No projects found.</p>';
            return;
        }

        projectsGrid.innerHTML = '';

        projects.forEach(project => {
            const projectCard = document.createElement('a');
            projectCard.href = project.html_url;
            projectCard.target = '_blank';
            projectCard.rel = 'noopener noreferrer';
            projectCard.className = 'project-card';

            const description = project.description || 'No description available';
            const stars = project.stargazers_count || 0;
            const forks = project.forks_count || 0;

            projectCard.innerHTML = `
                <h3>${project.name}</h3>
                <p class="project-description">${description}</p>
                <div class="project-meta">
                    <span>${project.language || 'N/A'}</span>
                    <div class="project-stats">
                        <span>⭐ ${stars}</span>
                        <span>🍴 ${forks}</span>
                    </div>
                </div>
            `;

            projectsGrid.appendChild(projectCard);
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        projectsGrid.innerHTML = '<p class="loading">Unable to load projects. Please try again later.</p>';
    }
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all cards
    document.querySelectorAll('.education-card, .achievement-block, .math-card, .cs-card, .olympiad-card, .sigma-card, .dev-card, .mentorship-card, .skill-category, .project-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
}

// ============================================
// ACTIVE NAV LINK ON SCROLL
// ============================================

function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    const observerOptions = {
        root: null,
        threshold: 0.5, // Section is considered "active" when 50% visible
        rootMargin: "-10% 0px -40% 0px" // Adjusted to feel natural during scroll
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                
                navLinks.forEach(link => {
                    const isActive = link.getAttribute('href').slice(1) === currentId;
                    link.classList.toggle('active', isActive);
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
}

// ============================================
// CTA BUTTON
// ============================================

const ctaButton = document.querySelector('.cta-button');
if (ctaButton) {
    ctaButton.addEventListener('click', () => {
        document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
    });
}

// ============================================
// MOBILE MENU
// ============================================

function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// ============================================
// CUSTOM CURSOR
// ============================================

function setupCustomCursor() {
    const cursorDot = document.getElementById('cursorDot');
    const cursorFollower = document.getElementById('cursorFollower');

    if (!cursorDot || !cursorFollower || window.matchMedia('(hover: none), (pointer: coarse)').matches) {
        return;
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let followerX = mouseX;
    let followerY = mouseY;
    let isCursorVisible = false;

    const interactiveSelector = 'a, button, .project-card, .contact-link, .nav-link, .skill-tag, .hamburger';

    window.addEventListener('mousemove', (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;

        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;

        if (!isCursorVisible) {
            cursorDot.style.opacity = '1';
            cursorFollower.style.opacity = '1';
            isCursorVisible = true;
        }
    });

    document.querySelectorAll(interactiveSelector).forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursorFollower.classList.add('cursor-hover');
        });

        element.addEventListener('mouseleave', () => {
            cursorFollower.classList.remove('cursor-hover');
        });
    });

    function animateCursorFollower() {
        followerX += (mouseX - followerX) * 0.14;
        followerY += (mouseY - followerY) * 0.14;

        cursorFollower.style.left = `${followerX}px`;
        cursorFollower.style.top = `${followerY}px`;

        requestAnimationFrame(animateCursorFollower);
    }

    cursorDot.style.opacity = '0';
    cursorFollower.style.opacity = '0';
    animateCursorFollower();

    document.addEventListener('mouseleave', () => {
        cursorDot.style.opacity = '0';
        cursorFollower.style.opacity = '0';
        isCursorVisible = false;
    });

    document.addEventListener('mouseenter', () => {
        if (isCursorVisible) {
            cursorDot.style.opacity = '1';
            cursorFollower.style.opacity = '1';
        }
    });
}

// ============================================
// HERO SCROLL INDICATOR
// ============================================

function setupScrollIndicator() {
    const scrollIndicator = document.getElementById('scrollIndicator');
    const heroSection = document.getElementById('home');
    const nextSection = document.getElementById('about');

    if (!scrollIndicator || !heroSection || !nextSection) return;

    scrollIndicator.addEventListener('click', () => {
        nextSection.scrollIntoView({ behavior: 'smooth' });
    });

    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const shouldHide = !entry.isIntersecting || entry.intersectionRatio < 0.65;
            scrollIndicator.classList.toggle('is-hidden', shouldHide);
        });
    }, {
        threshold: [0.2, 0.65, 0.9]
    });

    heroObserver.observe(heroSection);
}

// ============================================
// TYPING EFFECT FOR HERO SUBTITLE
// ============================================

function setupTypingEffect() {
    const subtitleElement = document.querySelector('.hero-subtitle');
    
    if (!subtitleElement) return;
    
    const fullText = 'Mathematician | Programmer | Problem Solver | Entrepreneur | Creative Thinker';
    
    const typingSpeed = 80; // ms per character
    const deletingSpeed = 40; // ms per character
    const waitAfterTyping = 5000; // 5 seconds wait after typing
    const waitAfterDeleting = 0; // No wait after deleting, repeat immediately
    
    let displayedText = '';
    let isDeleting = false;
    
    function type() {
        if (isDeleting) {
            // Delete character
            displayedText = displayedText.substring(0, displayedText.length - 1);
            subtitleElement.textContent = displayedText;
            
            if (displayedText.length === 0) {
                isDeleting = false;
                // Start typing again immediately
                setTimeout(type, waitAfterDeleting);
            } else {
                setTimeout(type, deletingSpeed);
            }
        } else {
            // Type character
            if (displayedText.length < fullText.length) {
                displayedText = fullText.substring(0, displayedText.length + 1);
                subtitleElement.textContent = displayedText;
                setTimeout(type, typingSpeed);
            } else {
                // Finished typing, wait before deleting
                isDeleting = true;
                setTimeout(type, waitAfterTyping);
            }
        }
    }
    
    // Start the typing effect
    setTimeout(type, typingSpeed);
}

// ============================================
// INITIALIZE EVERYTHING
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    createFloatingSymbols();
    fetchGitHubProjects();
    setupScrollAnimations();
    updateActiveNav();
    setupMobileMenu();
    setupCustomCursor();
    setupScrollIndicator();
    setupTypingEffect();
});

// ============================================
// WINDOW RESIZE HANDLER
// ============================================

window.addEventListener('resize', () => {
    // Canvas resize is handled by resizeCanvas function
}); 

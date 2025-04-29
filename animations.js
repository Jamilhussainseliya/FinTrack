// Animations and UI Enhancements

document.addEventListener('DOMContentLoaded', function() {
    // Hide preloader after page load
    const preloader = document.querySelector('.preloader');
    
    window.addEventListener('load', function() {
        setTimeout(function() {
            preloader.classList.add('hidden');
        }, 500);
    });
    
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const body = document.body;
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('menu-open');
            mobileMenu.classList.toggle('open');
            body.classList.toggle('menu-active');
        });
    }
    
    // Theme Toggle
    const themeToggle = document.querySelector('.theme-toggle');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            body.classList.toggle('dark-mode');
            
            // Save theme preference
            const currentTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
            localStorage.setItem('theme', currentTheme);
        });
    }
    
    // Help Button and Modal
    const helpButton = document.querySelector('.help-button');
    const helpModal = document.getElementById('help-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    
    if (helpButton && helpModal) {
        helpButton.addEventListener('click', function() {
            helpModal.classList.add('open');
            body.style.overflow = 'hidden';
        });
        
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                helpModal.classList.remove('open');
                body.style.overflow = '';
            });
        });
        
        // Close modal when clicking outside
        helpModal.addEventListener('click', function(e) {
            if (e.target === helpModal) {
                helpModal.classList.remove('open');
                body.style.overflow = '';
            }
        });
    }
    
    // Back to Top Button
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });
        
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Animate Stats Counter
    const statNumbers = document.querySelectorAll('.stat-number');
    
    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-count'));
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); // 60fps
        let current = 0;
        
        const timer = setInterval(function() {
            current += step;
            el.textContent = Math.round(current);
            
            if (current >= target) {
                el.textContent = target;
                clearInterval(timer);
            }
        }, 16);
    }
    
    // Intersection Observer for animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate counters when visible
                if (entry.target.classList.contains('stat-number')) {
                    animateCounter(entry.target);
                }
                
                // Add aos-animate class for AOS-like animations
                if (entry.target.hasAttribute('data-aos')) {
                    entry.target.classList.add('aos-animate');
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe stat numbers
    statNumbers.forEach(stat => {
        observer.observe(stat);
    });
    
    // Observe AOS elements
    const aosElements = document.querySelectorAll('[data-aos]');
    aosElements.forEach(element => {
        observer.observe(element);
    });
    
    // Testimonial Slider
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (testimonialSlides.length > 0) {
        let currentSlide = 0;
        
        function showSlide(index) {
            testimonialSlides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            testimonialSlides[index].classList.add('active');
            dots[index].classList.add('active');
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                currentSlide = (currentSlide + 1) % testimonialSlides.length;
                showSlide(currentSlide);
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                currentSlide = (currentSlide - 1 + testimonialSlides.length) % testimonialSlides.length;
                showSlide(currentSlide);
            });
        }
        
        dots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                currentSlide = index;
                showSlide(currentSlide);
            });
        });
        
        // Auto slide every 5 seconds
        let slideInterval = setInterval(function() {
            currentSlide = (currentSlide + 1) % testimonialSlides.length;
            showSlide(currentSlide);
        }, 5000);
        
        // Pause auto slide on hover
        const testimonialSlider = document.querySelector('.testimonial-slider');
        if (testimonialSlider) {
            testimonialSlider.addEventListener('mouseenter', function() {
                clearInterval(slideInterval);
            });
            
            testimonialSlider.addEventListener('mouseleave', function() {
                slideInterval = setInterval(function() {
                    currentSlide = (currentSlide + 1) % testimonialSlides.length;
                    showSlide(currentSlide);
                }, 5000);
            });
        }
    }
    
    // Update current year in footer
    const currentYearEl = document.getElementById('current-year');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }
    
    // Add smooth scrolling to all links
    const links = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (mobileMenu && mobileMenu.classList.contains('open')) {
                    mobileMenuBtn.classList.remove('menu-open');
                    mobileMenu.classList.remove('open');
                    body.classList.remove('menu-active');
                }
            }
        });
    });
    
    // Form input animations
    const formInputs = document.querySelectorAll('.form-group input, .form-group select');
    
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
    
    // Add tooltip functionality
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        const tooltipText = element.getAttribute('data-tooltip');
        const tooltip = document.createElement('div');
        tooltip.classList.add('tooltip');
        tooltip.textContent = tooltipText;
        
        element.appendChild(tooltip);
        
        element.addEventListener('mouseenter', function() {
            tooltip.style.opacity = '1';
            tooltip.style.visibility = 'visible';
        });
        
        element.addEventListener('mouseleave', function() {
            tooltip.style.opacity = '0';
            tooltip.style.visibility = 'hidden';
        });
    });
    
    // Add shake animation to form submit buttons when form is invalid
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!this.checkValidity()) {
                const submitBtn = this.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.classList.add('shake');
                    setTimeout(() => {
                        submitBtn.classList.remove('shake');
                    }, 500);
                }
            }
        });
    });
});
// Animations and UI Enhancements

document.addEventListener('DOMContentLoaded', function() {
    // Hide preloader after page load
    const preloader = document.querySelector('.preloader');
    
    if (preloader) {
        window.addEventListener('load', function() {
            setTimeout(function() {
                preloader.classList.add('hidden');
            }, 500);
        });
    }
    
    // Mobile Menu Toggle - Fixed implementation
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const body = document.body;
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('menu-open');
            mobileMenu.classList.toggle('open');
            body.classList.toggle('menu-active');
            
            // Toggle aria-expanded for accessibility
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.setAttribute('aria-hidden', isExpanded);
        });
        
        // Initialize aria attributes
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
    }
    
    // Rest of the existing animations.js code...
    // [Keep all other existing code below this point]
}); 
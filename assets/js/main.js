        document.addEventListener("DOMContentLoaded", () => {

            // 1. Initialize Lenis (High End Smooth Apple/Awwwards Scroll)
            const lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                direction: 'vertical',
                gestureDirection: 'vertical',
                smooth: true,
                smoothTouch: false,
                touchMultiplier: 2,
            });

            // Connect Lenis to ScrollTrigger Native Match
            lenis.on('scroll', ScrollTrigger.update);

            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);

            // 2. Setup GSAP Plugins
            gsap.registerPlugin(ScrollTrigger);

            // 3. Setup Cool GSAP Entrance Animations
            function playHeroEntrance() {
                gsap.fromTo(".hero-fade-out",
                    { y: "50px", autoAlpha: 0, filter: "blur(12px)" },
                    { y: "0px", autoAlpha: 1, filter: "blur(0px)", duration: 1.5, stagger: 0.1, ease: "power2.out", overwrite: true }
                );
            }

            const tlEntrance = gsap.timeline();
            tlEntrance.to("#hero-box", {
                autoAlpha: 1,
                scale: 1,
                duration: 1.8,
                ease: "power3.out"
            });
            // Set initial scale for the box animation
            gsap.set("#hero-box", { scale: 0.95 });

            // Handle the initial state based on scroll position
            // Hide immediately if loaded past the top to avoid appearing out of place.
            if (window.scrollY >= 50) {
                gsap.set(".hero-fade-out", {
                    y: "-80px",
                    autoAlpha: 0,
                    filter: "blur(10px)",
                    overwrite: true
                });
            }

            // Execute entrance automatically after box starts loading ONLY if at the top
            setTimeout(() => {
                if (window.scrollY < 50) {
                    playHeroEntrance();
                }
            }, 200);

            // Create separated ScrollTrigger for the UI overlay elements
            // so they exit gracefully and re-enter properly on scroll-back
            ScrollTrigger.create({
                trigger: "#hero-wrapper",
                start: "top -50", // When user scrolls down 50px
                onEnter: () => {
                    gsap.to(".hero-fade-out", {
                        y: "-80px",
                        opacity: 0,
                        filter: "blur(10px)",
                        duration: 0.4,
                        stagger: 0.04,
                        ease: "power2.in",
                        overwrite: true
                    });
                },
                onLeaveBack: () => {
                    // When scroll is perfectly at the top, replay entrance
                    playHeroEntrance();
                }
            });

            // 4. Parallax Scroll / Image Sequence Scrubbing (Apple Style Canvas)
            const canvas = document.getElementById("hero-canvas");
            const ctx = canvas.getContext("2d");

            const frameCount = 240;
            const currentFrame = index => (
                `assets/frames/hero-desktop/ezgif-6b902fd6eea368ac-jpg/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`
            );

            const images = [];
            const frames = { frame: 0 };
            let imagesLoaded = 0;

            // Preload all frames
            for (let i = 0; i < frameCount; i++) {
                const img = new Image();
                img.src = currentFrame(i);
                images.push(img);

                if (i === 0) {
                    img.onload = () => {
                        // Set canvas intrinsic size to match frame size
                        canvas.width = img.width;
                        canvas.height = img.height;
                        render(); // draw first frame immediately
                    };
                }
            }

            function render() {
                const img = images[Math.round(frames.frame)];
                if (img && img.complete) {
                    // Clear and draw the frame
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                }
            }

            function setupCanvasScrub() {
                const scrollDistance = 3500;

                const tlScroll = gsap.timeline({
                    scrollTrigger: {
                        trigger: "#hero-wrapper",
                        start: "top top",
                        end: `+=${scrollDistance}`,
                        pin: true,
                        scrub: 1.2, // 1.2s lag on scrub for buttery smooth trail effect
                        anticipatePin: 1
                    }
                });

                // a) Drive frame index via proxy
                tlScroll.to(frames, {
                    frame: frameCount - 1,
                    snap: "frame", // ensure we hit integer frames
                    ease: "none",
                    onUpdate: render
                }, 0);

                // Eject logic is now handled by the separate ScrollTrigger onEnter

                // Dim the gradient a bit more when scrolling to emphasize only the video art
                tlScroll.to("#hero-box [class*='bg-gradient']", {
                    opacity: 0.5,
                    duration: 0.3
                }, 0);
            }

            // Initialize Scrub
            setupCanvasScrub();

            // High custom smooth click anchors integrated w/ Lenis
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    lenis.scrollTo(this.getAttribute('href'), {
                        duration: 1.5,
                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                    });
                });
            });

            // 5. Quarta Dobra: Video Play/Pause & Text Parallax
            const origemVideo = document.getElementById("origem-video");

            ScrollTrigger.create({
                trigger: "#origem",
                start: "top bottom",
                end: "bottom top",
                onEnter: () => origemVideo.play(),
                onEnterBack: () => origemVideo.play(),
                onLeave: () => origemVideo.pause(),
                onLeaveBack: () => origemVideo.pause()
            });

            gsap.to("#origem-content", {
                y: "-50px", // Reduced from -150px to fit mobile screen without escaping view too fast
                ease: "none",
                scrollTrigger: {
                    trigger: "#origem",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });

            // Mobile Menu Logic
            const mobileMenuBtn = document.getElementById('mobile-menu-btn');
            const mobileMenu = document.getElementById('mobile-menu');
            const menuBackdrop = document.getElementById('menu-backdrop');
            let isMenuOpen = false;

            if (mobileMenuBtn && mobileMenu) {
                mobileMenuBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    isMenuOpen = !isMenuOpen;
                    if (isMenuOpen) {
                        mobileMenu.classList.remove('hidden');
                        if(menuBackdrop) menuBackdrop.classList.remove('hidden');
                        
                        // Small delay to allow initial state before transition
                        setTimeout(() => {
                            mobileMenu.classList.remove('opacity-0', '-translate-y-4');
                            mobileMenu.classList.add('opacity-100', 'translate-y-0');
                            if(menuBackdrop) {
                                menuBackdrop.classList.remove('opacity-0');
                                menuBackdrop.classList.add('opacity-100');
                            }
                        }, 10);
                    } else {
                        mobileMenu.classList.remove('opacity-100', 'translate-y-0');
                        mobileMenu.classList.add('opacity-0', '-translate-y-4');
                        if(menuBackdrop) {
                            menuBackdrop.classList.remove('opacity-100');
                            menuBackdrop.classList.add('opacity-0');
                        }
                        
                        setTimeout(() => {
                            mobileMenu.classList.add('hidden');
                            if(menuBackdrop) menuBackdrop.classList.add('hidden');
                        }, 300);
                    }
                });

                // Close menu when clicking a link
                const mobileLinks = mobileMenu.querySelectorAll('.mobile-link');
                mobileLinks.forEach(link => {
                    link.addEventListener('click', () => {
                        isMenuOpen = false;
                        mobileMenu.classList.remove('opacity-100', 'translate-y-0');
                        mobileMenu.classList.add('opacity-0', '-translate-y-4');
                        if(menuBackdrop) {
                            menuBackdrop.classList.remove('opacity-100');
                            menuBackdrop.classList.add('opacity-0');
                        }
                        
                        setTimeout(() => {
                            mobileMenu.classList.add('hidden');
                            if(menuBackdrop) menuBackdrop.classList.add('hidden');
                        }, 300);
                    });
                });
                
                // Allow closing by clicking the backdrop
                if(menuBackdrop) {
                    menuBackdrop.addEventListener('click', () => {
                        if(isMenuOpen) mobileMenuBtn.click();
                    });
                }
            }

            // 6. Quinta Dobra: Galeria Assinatura Reveal (Staggered Blur-in + Zoom-in)
            const galeriaItems = document.querySelectorAll('.galeria-item');
            let mm = gsap.matchMedia();

            // Desktop: Staggered animation for the whole section
            mm.add("(min-width: 769px)", () => {
                const tlGaleria = gsap.timeline({ paused: true });
                
                ScrollTrigger.create({
                    trigger: "#galeria",
                    start: "top 70%",
                    onEnter: () => tlGaleria.play()
                });

                ScrollTrigger.create({
                    trigger: "#galeria",
                    start: "top bottom",
                    onLeaveBack: () => tlGaleria.pause(0) // Reset only when section leaves completely at the bottom
                });

                galeriaItems.forEach((item, index) => {
                    const imgWrapper = item.querySelector('.galeria-image-wrapper');
                    const text = item.querySelector('.galeria-text');

                    tlGaleria.to(imgWrapper, {
                        opacity: 1,
                        filter: "blur(0px)",
                        scale: 1,
                        y: 0,
                        duration: 1.8,
                        ease: "power2.out"
                    }, index * 0.4)
                    .to(text, {
                        opacity: 1,
                        duration: 1,
                        ease: "power2.out"
                    }, (index * 0.4) + 0.8);
                });
            });

            // Mobile: Individual animations triggered when each item comes into view
            mm.add("(max-width: 768px)", () => {
                galeriaItems.forEach((item) => {
                    const imgWrapper = item.querySelector('.galeria-image-wrapper');
                    const text = item.querySelector('.galeria-text');
                    
                    const tlItem = gsap.timeline({ paused: true });

                    ScrollTrigger.create({
                        trigger: item,
                        start: "top 80%",
                        onEnter: () => tlItem.play()
                    });

                    ScrollTrigger.create({
                        trigger: item,
                        start: "top bottom",
                        onLeaveBack: () => tlItem.pause(0) // Reset only when item leaves completely at the bottom
                    });

                    tlItem.to(imgWrapper, {
                        opacity: 1,
                        filter: "blur(0px)",
                        scale: 1,
                        y: 0,
                        duration: 1.8,
                        ease: "power2.out"
                    }, 0)
                    .to(text, {
                        opacity: 1,
                        duration: 1,
                        ease: "power2.out"
                    }, 0.8);
                });
            });

            // 7. Mobile Wandering Flashlight Effect for Cards
            const diffSection = document.getElementById('diferenciais');
            const flashCards = document.querySelectorAll('.flashlight-card');
            let lightRafId;
            let lightLocalX = 0;
            let lightLocalY = 0;
            let lightAngle = Math.PI / 2; // Moving straight down initially
            let lightSpeed = 0.8; // Very smooth, constant velocity

            function animateGlobalLight() {
                if (window.innerWidth > 768) {
                    flashCards.forEach(card => card.classList.remove('mobile-flashlight'));
                    if (lightRafId) { cancelAnimationFrame(lightRafId); lightRafId = null; }
                    return;
                }

                // Smoothly wander angle slightly every frame
                lightAngle += (Math.random() - 0.5) * 0.04;

                // Update position with constant smooth speed
                lightLocalX += Math.cos(lightAngle) * lightSpeed;
                lightLocalY += Math.sin(lightAngle) * lightSpeed;

                const diffWidth = diffSection.offsetWidth;
                const diffHeight = diffSection.offsetHeight;
                const pad = 80; // Soft boundary padding

                // Soft steering when approaching edges to keep it inside the section elegantly
                let steerX = 0;
                let steerY = 0;
                if (lightLocalX < pad) steerX = 1;
                else if (lightLocalX > diffWidth - pad) steerX = -1;
                
                if (lightLocalY < pad) steerY = 1;
                else if (lightLocalY > diffHeight - pad) steerY = -1;

                if (steerX !== 0 || steerY !== 0) {
                    const centerAngle = Math.atan2((diffHeight / 2) - lightLocalY, (diffWidth / 2) - lightLocalX);
                    // smoothly blend current angle towards centerAngle
                    let angleDiff = centerAngle - lightAngle;
                    // normalize angleDiff to -PI to PI
                    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                    lightAngle += angleDiff * 0.02;
                }

                const diffRect = diffSection.getBoundingClientRect();
                const globalLightViewportX = diffRect.left + lightLocalX;
                const globalLightViewportY = diffRect.top + lightLocalY;

                flashCards.forEach(card => {
                    card.classList.add('mobile-flashlight');
                    const rect = card.getBoundingClientRect();
                    const cardX = globalLightViewportX - rect.left;
                    const cardY = globalLightViewportY - rect.top;
                    card.style.setProperty('--mouse-x', `${cardX}px`);
                    card.style.setProperty('--mouse-y', `${cardY}px`);
                });

                lightRafId = requestAnimationFrame(animateGlobalLight);
            }

            setTimeout(() => {
                if (window.innerWidth <= 768 && diffSection && flashCards.length > 0) {
                    // Começa no topo absoluto (centro)
                    lightLocalX = diffSection.offsetWidth / 2;
                    lightLocalY = 0;
                    lightAngle = Math.PI / 2; // Apontando para baixo
                    animateGlobalLight();
                }
            }, 500);

            window.addEventListener('resize', () => {
                if (window.innerWidth <= 768) {
                    if (!lightRafId && diffSection && flashCards.length > 0) animateGlobalLight();
                } else {
                    if (lightRafId) { cancelAnimationFrame(lightRafId); lightRafId = null; }
                    flashCards.forEach(card => card.classList.remove('mobile-flashlight'));
                }
            });

        });

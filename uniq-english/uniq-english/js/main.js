// ============================================
// Uniq English - Main JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize
    initHeader();
    initMobileMenu();
    initCourses();
    initGallery();
    initStats();
    initAuth();
    initModals();
});

// Header Scroll Effect
function initHeader() {
    const header = document.getElementById('header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Mobile Menu
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const userAvatar = document.getElementById('userAvatar');

    if (!mobileMenu) return;

    // Function to toggle mobile menu
    function toggleMobileMenu() {
        mobileMenu.classList.toggle('active');
        if (mobileMenuBtn && mobileMenuBtn.style.display !== 'none') {
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        }
    }

    // Hamburger menu button click (when not logged in)
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }

    // User avatar click - on mobile opens menu, on desktop shows dropdown
    if (userAvatar) {
        userAvatar.addEventListener('click', (e) => {
            // Only toggle mobile menu on mobile screens
            if (window.innerWidth < 768) {
                e.stopPropagation();
                toggleMobileMenu();
            }
        });
    }

    // Close menu when clicking a link
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            if (mobileMenuBtn && mobileMenuBtn.style.display !== 'none') {
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            }
        });
    });
}

// Courses with Pagination
async function initCourses() {
    const coursesGrid = document.getElementById('coursesGrid');
    if (!coursesGrid) return;

    try {
        console.log('Initializing courses...');

        // Wait for Firebase to be ready
        let courses = [];
        if (typeof window.getCourses === 'function') {
            console.log('Firebase getCourses function found');
            courses = await window.getCourses();
            console.log('Courses loaded:', courses.length);
        } else {
            console.log('Waiting for Firebase to load...');
            // Wait a bit for Firebase to load
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (typeof window.getCourses === 'function') {
                courses = await window.getCourses();
                console.log('Courses loaded after wait:', courses.length);
            } else {
                console.error('Firebase getCourses function not available');
                coursesGrid.innerHTML = '<p class="empty-message">Loading courses...</p>';
                return;
            }
        }

        if (!courses || courses.length === 0) {
            console.warn('No courses found');
            coursesGrid.innerHTML = '<p class="empty-message">No courses available yet.</p>';
            return;
        }

        courses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        let displayedCourses = 6;
        const coursesPerLoad = 6;
        let currentFilteredCourses = [...courses];

        renderCourses(currentFilteredCourses.slice(0, displayedCourses));
        updateViewMoreButton(currentFilteredCourses.length);

        const courseSearchInput = document.getElementById('courseSearchInput');
        const filterTabs = document.getElementById('filterTabs');
        const clearSearch = document.getElementById('clearSearch');
        let currentFilter = 'all';

        if (courseSearchInput) {
            courseSearchInput.addEventListener('focus', () => {
                filterTabs.classList.add('show');
            });

            courseSearchInput.addEventListener('input', (e) => {
                const searchQuery = e.target.value.toLowerCase().trim();
                if (clearSearch) clearSearch.style.display = searchQuery ? 'flex' : 'none';

                let filtered = filterCourses(courses, currentFilter);
                if (searchQuery) {
                    filtered = filtered.filter(course =>
                        course.title.toLowerCase().includes(searchQuery) ||
                        course.instructor.toLowerCase().includes(searchQuery) ||
                        course.description.toLowerCase().includes(searchQuery)
                    );
                }

                currentFilteredCourses = filtered;
                displayedCourses = 6;
                renderCourses(currentFilteredCourses.slice(0, displayedCourses));
                updateViewMoreButton(currentFilteredCourses.length);
            });

            if (clearSearch) {
                clearSearch.addEventListener('click', () => {
                    courseSearchInput.value = '';
                    clearSearch.style.display = 'none';
                    currentFilteredCourses = filterCourses(courses, currentFilter);
                    displayedCourses = 6;
                    renderCourses(currentFilteredCourses.slice(0, displayedCourses));
                    updateViewMoreButton(currentFilteredCourses.length);
                    courseSearchInput.focus();
                });
            }
        }

        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                currentFilter = btn.dataset.filter;
                const searchQuery = courseSearchInput ? courseSearchInput.value.toLowerCase().trim() : '';

                let filtered = filterCourses(courses, currentFilter);
                if (searchQuery) {
                    filtered = filtered.filter(course =>
                        course.title.toLowerCase().includes(searchQuery) ||
                        course.instructor.toLowerCase().includes(searchQuery) ||
                        course.description.toLowerCase().includes(searchQuery)
                    );
                }

                currentFilteredCourses = filtered;
                displayedCourses = 6;
                renderCourses(currentFilteredCourses.slice(0, displayedCourses));
                updateViewMoreButton(currentFilteredCourses.length);
            });
        });

        const viewMoreBtn = document.getElementById('viewMoreBtn');
        if (viewMoreBtn) {
            viewMoreBtn.addEventListener('click', () => {
                displayedCourses += coursesPerLoad;
                renderCourses(currentFilteredCourses.slice(0, displayedCourses));
                updateViewMoreButton(currentFilteredCourses.length);

                setTimeout(() => {
                    const cards = coursesGrid.children;
                    const targetCard = cards[Math.max(0, cards.length - coursesPerLoad)];
                    if (targetCard) {
                        targetCard.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest'
                        });
                    }
                }, 100);
            });
        }

        function updateViewMoreButton(totalCourses) {
            const viewMoreContainer = document.getElementById('viewMoreContainer');
            const viewMoreBtn = document.getElementById('viewMoreBtn');

            if (viewMoreContainer && viewMoreBtn) {
                if (displayedCourses >= totalCourses) {
                    viewMoreContainer.style.display = 'none';
                } else {
                    viewMoreContainer.style.display = 'flex';
                    const remaining = totalCourses - displayedCourses;
                    viewMoreBtn.innerHTML = `<i class="fas fa-chevron-down"></i> View More Courses (${remaining} remaining)`;
                }
            }
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        coursesGrid.innerHTML = '<p class="empty-message">Error loading courses. Please refresh the page.</p>';
    }
}

function filterCourses(courses, filter) {
    if (filter === 'all') return courses;
    if (filter === 'free') return courses.filter(c => c.priceType === 'free');
    return courses.filter(c => c.level === filter);
}

function renderCourses(courses) {
    const coursesGrid = document.getElementById('coursesGrid');
    if (!coursesGrid) return;

    if (courses.length === 0) {
        coursesGrid.innerHTML = '<p class="empty-message">No courses found.</p>';
        return;
    }

    const sortedCourses = [...courses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    coursesGrid.innerHTML = sortedCourses.map(course => `
        <div class="course-card" data-course-id="${course.id}">
            <div class="course-thumbnail">
                <img src="${course.thumbnail}" alt="${course.title}">
                <div class="course-badges">
                    <span class="badge ${course.priceType === 'free' ? 'badge-free' : 'badge-paid'}">
                        ${course.priceType === 'free' ? 'Free' : '$' + course.price}
                    </span>
                    <span class="badge badge-level">${course.level}</span>
                </div>
                <div class="play-icon">
                    <i class="fas fa-play-circle"></i>
                </div>
            </div>
            <div class="course-content">
                <div class="course-meta">
                    <span class="course-category">${course.category}</span>
                    <span class="course-rating">
                        <i class="fas fa-star"></i> ${course.rating}
                    </span>
                </div>
                <h3 class="course-title">${course.title}</h3>
                <p class="course-description">${course.description}</p>
                <div class="course-stats">
                    <span><i class="fas fa-users"></i> ${course.studentCount.toLocaleString()}</span>
                    <span><i class="fas fa-clock"></i> ${course.duration}</span>
                </div>
                <div class="course-footer">
                    <div class="course-instructor">
                        <div class="instructor-avatar">${course.instructor.charAt(0)}</div>
                        <span>${course.instructor}</span>
                    </div>
                    <button class="btn btn-primary btn-sm">View Details</button>
                </div>
            </div>
        </div>
    `).join('');

    coursesGrid.querySelectorAll('.course-card').forEach(card => {
        card.addEventListener('click', () => {
            const courseId = card.dataset.courseId;
            openCourseModal(courseId);
        });
    });
}

// Gallery
function initGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;

    const galleryImages = [{
            src: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop',
            alt: 'Gallery 1',
            large: true
        },
        {
            src: 'img1.jpg',
            alt: 'Gallery 2',
            large: false
        },
        {
            src: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&h=400&fit=crop',
            alt: 'Gallery 3',
            large: false
        },
        {
            src: 'img2.jpg',
            alt: 'Gallery 4',
            large: false
        },
        {
            src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=400&fit=crop',
            alt: 'Gallery 5',
            large: false
        },
        {
            src: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=400&fit=crop',
            alt: 'Gallery 6',
            large: true
        },
        {
            src: 'img3.jpg',
            alt: 'Gallery 7',
            large: false
        },
        {
            src: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop',
            alt: 'Gallery 8',
            large: false
        }
    ];

    galleryGrid.innerHTML = galleryImages.map((img, index) => `
        <div class="gallery-item ${img.large ? 'large' : ''}" data-index="${index}">
            <img src="${img.src}" alt="${img.alt}" onerror="this.src='https://via.placeholder.com/600x400?text=Image+Not+Found'">
            <div class="gallery-overlay">
                <i class="fas fa-search-plus"></i>
            </div>
        </div>
    `).join('');

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxCounter = document.getElementById('lightboxCounter');

    let currentIndex = 0;
    const images = galleryImages.map(img => img.src);

    const galleryItems = galleryGrid.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            currentIndex = index;
            showLightbox();
        });
    });

    function showLightbox() {
        lightboxImg.src = images[currentIndex];
        lightboxCounter.textContent = `${currentIndex + 1} / ${images.length}`;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function hideLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showPrev() {
        currentIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
        showLightbox();
    }

    function showNext() {
        currentIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
        showLightbox();
    }

    lightboxClose.addEventListener('click', hideLightbox);
    lightboxPrev.addEventListener('click', showPrev);
    lightboxNext.addEventListener('click', showNext);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) hideLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') hideLightbox();
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'ArrowRight') showNext();
    });
}

// Stats Counter Animation
function initStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target);
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });

    statNumbers.forEach(stat => observer.observe(stat));
}

function animateCounter(element, target) {
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * easeOut);

        element.textContent = current.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target.toLocaleString();
        }
    }

    requestAnimationFrame(update);
}

// Auth
async function initAuth() {
    const currentUser = window.getCurrentUser();
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const userAvatar = document.getElementById('userAvatar');
    const userInitial = document.getElementById('userInitial');
    const dashboardLink = document.getElementById('dashboardLink');
    const logoutBtn = document.getElementById('logoutBtn');
    const mobileAuth = document.getElementById('mobileAuth');
    const mobileUserMenu = document.getElementById('mobileUserMenu');
    const mobileDashboardLink = document.getElementById('mobileDashboardLink');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');

    if (currentUser) {
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
        if (mobileAuth) mobileAuth.style.display = 'none';
        if (mobileUserMenu) mobileUserMenu.style.display = 'flex';

        // Hide hamburger when user is logged in
        if (mobileMenuBtn) mobileMenuBtn.style.display = 'none';

        if (userInitial) userInitial.textContent = currentUser.name.charAt(0).toUpperCase();

        if (userAvatar && currentUser.avatar) {
            userAvatar.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}">`;
        }

        const dashboardUrl = currentUser.role === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html';
        if (dashboardLink) {
            dashboardLink.href = dashboardUrl;
        }
        if (mobileDashboardLink) {
            mobileDashboardLink.href = dashboardUrl;
        }
    } else {
        // Show hamburger when user is not logged in
        if (mobileMenuBtn) mobileMenuBtn.style.display = 'flex';
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.setCurrentUser(null);
            window.location.href = 'index.html';
        });
    }

    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.setCurrentUser(null);
            window.location.href = 'index.html';
        });
    }
}

// Course Modal
let selectedCourse = null;

async function openCourseModal(courseId) {
    const course = await window.getCourseById(courseId);
    if (!course) return;

    selectedCourse = course;
    const modal = document.getElementById('courseModal');
    const currentUser = window.getCurrentUser();
    const enrolled = currentUser ? await window.isEnrolled(currentUser.id, courseId) : false;

    document.getElementById('modalImage').src = course.thumbnail;
    document.getElementById('modalTitle').textContent = course.title;
    document.getElementById('modalBadges').innerHTML = `
        <span class="badge ${course.priceType === 'free' ? 'badge-free' : 'badge-paid'}">
            ${course.priceType === 'free' ? 'Free' : '$' + course.price}
        </span>
        <span class="badge badge-level">${course.level}</span>
        <span class="badge badge-category">${course.category}</span>
    `;
    document.getElementById('modalRating').textContent = course.rating;
    document.getElementById('modalStudents').textContent = course.studentCount.toLocaleString() + ' students';
    document.getElementById('modalDuration').textContent = course.duration;
    document.getElementById('modalDescription').textContent = course.description;
    document.getElementById('modalInstructor').textContent = course.instructor;
    document.getElementById('instructorAvatar').textContent = course.instructor.charAt(0);
    document.getElementById('modalVideoCount').textContent = `${course.videos.length} lessons • Total duration: ${course.duration}`;

    const videoList = document.getElementById('videoList');
    videoList.innerHTML = course.videos.map((video, index) => `
        <div class="video-list-item">
            <span class="number">${index + 1}</span>
            <div class="info">
                <h4>${video.title}</h4>
                <p>${video.duration}</p>
            </div>
            <i class="fas fa-lock"></i>
        </div>
    `).join('');

    const enrollBtn = document.getElementById('enrollBtn');
    if (enrollBtn) {
        enrollBtn.style.display = 'block';
        enrollBtn.style.margin = '1.5em auto 0 auto';
        enrollBtn.style.textAlign = 'center';
    }

    if (enrolled) {
        enrollBtn.innerHTML = '<i class="fas fa-check-circle"></i> Go to Course';
        enrollBtn.onclick = () => window.location.href = 'user-dashboard.html';
    } else {
        enrollBtn.innerHTML = course.priceType === 'free' ?
            '<i class="fas fa-play"></i> Enroll for Free' :
            `<i class="fas fa-credit-card"></i> Enroll Now - $${course.price}`;
        enrollBtn.onclick = handleEnroll;
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    const tabBtns = modal.querySelectorAll('.tab-btn');
    const tabContents = modal.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });
}

function handleEnroll() {
    const currentUser = window.getCurrentUser();

    if (!currentUser) {
        showToast('Please login to enroll', 'warning');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    if (selectedCourse.priceType === 'free') {
        completeEnrollment(selectedCourse.id, 0);
    } else {
        openPaymentModal(selectedCourse);
    }
}

async function completeEnrollment(courseId, amount) {
    const currentUser = window.getCurrentUser();

    const enrollment = {
        id: window.generateId('enrollment'),
        userId: currentUser.id,
        courseId: courseId,
        progress: 0, // Start at 0%, will become 25% when user clicks "Start Course"
        completedVideos: [],
        enrolledAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        paymentStatus: 'completed',
        amount: amount
    };
    await window.addEnrollment(enrollment);

    // Create payment record for both free and paid courses
    const payment = {
        id: window.generateId('payment'),
        userId: currentUser.id,
        courseId: courseId,
        amount: amount,
        status: 'success',
        transactionId: amount === 0 ? 'FREE-' + Date.now() : 'TXN-' + Date.now(),
        paidAt: new Date().toISOString()
    };
    await window.addPayment(payment);

    const course = await window.getCourseById(courseId);
    course.studentCount++;
    await window.updateCourse(course);

    document.getElementById('courseModal').classList.remove('active');
    document.getElementById('paymentModal').classList.remove('active');
    showSuccessModal(selectedCourse.title);
}

// Payment Modal
function openPaymentModal(course) {
    const modal = document.getElementById('paymentModal');
    document.getElementById('paymentCourseTitle').textContent = course.title;
    document.getElementById('paymentAmount').textContent = '$' + course.price;

    modal.classList.add('active');

    const cardNumber = document.getElementById('cardNumber');
    cardNumber.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
        value = (value.match(/.{1,4}/g) ? value.match(/.{1,4}/g).join(' ') : value);
        e.target.value = value;
    });

    const expiryDate = document.getElementById('expiryDate');
    expiryDate.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\//g, '').replace(/[^0-9]/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        e.target.value = value;
    });
}

// Payment Form
function initModals() {
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalEl = btn.closest('.modal');
            modalEl.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    document.querySelectorAll('.modal').forEach(modalEl => {
        modalEl.addEventListener('click', (e) => {
            if (e.target === modalEl) {
                modalEl.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const payBtn = document.getElementById('payBtn');
            const spinner = payBtn.querySelector('.spinner');
            const btnText = payBtn.querySelector('.btn-text');

            spinner.style.display = 'block';
            btnText.textContent = 'Processing...';
            payBtn.disabled = true;

            setTimeout(() => {
                completeEnrollment(selectedCourse.id, selectedCourse.price);
                spinner.style.display = 'none';
                btnText.textContent = 'Pay Now';
                payBtn.disabled = false;
            }, 2000);
        });
    }

    const cancelPayment = document.getElementById('cancelPayment');
    if (cancelPayment) {
        cancelPayment.addEventListener('click', () => {
            document.getElementById('paymentModal').classList.remove('active');
        });
    }

    const successClose = document.getElementById('successClose');
    if (successClose) {
        successClose.addEventListener('click', () => {
            document.getElementById('successModal').classList.remove('active');
            document.body.style.overflow = '';
        });
    }
}

function showSuccessModal(courseTitle, type = 'enrolled') {
    const msgBox = document.getElementById('successMessage');
    let headline = '';
    let message = '';
    let sub = '';
    if (type === 'completed') {
        headline = 'Congratulations!';
        message = `You have <b>completed</b> <b>${courseTitle}</b>.`;
        sub = 'You have finished all lessons. Well done!';
    } else {
        headline = 'Congratulations!';
        message = `You have successfully enrolled in <b>${courseTitle}</b>.`;
        sub = 'Start learning now!';
    }
    msgBox.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
            <span style="font-size:2rem; color: #28a745; font-weight: bold; margin-bottom: 0.5em;">${headline}</span>
            <span style="font-size:1.2rem; color: #333;">${message}</span>
            <span style="font-size:1rem; color: #555; margin-top: 0.5em;">${sub}</span>
        </div>
    `;
    const modal = document.getElementById('successModal');
    setTimeout(() => {
        const btns = modal.querySelectorAll('button, .btn');
        btns.forEach(btn => {
            btn.style.display = 'block';
            btn.style.margin = '1.5em auto 0 auto';
            btn.style.textAlign = 'center';
        });
    }, 10);
    modal.classList.add('active');
}
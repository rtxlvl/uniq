// ============================================
// Uniq English - Admin Dashboard JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    initSidebar();
    initLogout();
    initDashboard();
    initAddCourse();
    initManageCourses();
    initStudents();
    initPayments();
});

// Check Authentication
function checkAuth() {
    const currentUser = window.getCurrentUser();

    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    if (currentUser.role !== 'admin') {
        window.location.href = 'user-dashboard.html';
        return;
    }

    // Update sidebar user info
    const sidebarName = document.getElementById('sidebarName');
    const sidebarInitial = document.getElementById('sidebarInitial');
    const sidebarAvatar = document.getElementById('sidebarAvatar');

    if (sidebarName) sidebarName.textContent = currentUser.name;
    if (sidebarInitial) sidebarInitial.textContent = currentUser.name.charAt(0).toUpperCase();
    if (sidebarAvatar && currentUser.avatar) {
        sidebarAvatar.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}">`;
    }
}

// Sidebar
function initSidebar() {
    const mobileSidebarBtn = document.getElementById('mobileSidebarBtn');
    const sidebar = document.getElementById('sidebar');

    if (!mobileSidebarBtn || !sidebar) return;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    mobileSidebarBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });
}

// Logout
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.setCurrentUser(null);
            window.location.href = 'login.html';
        });
    }
}

// Dashboard
async function initDashboard() {
    const totalCourses = document.getElementById('totalCourses');
    if (!totalCourses) return; // Not on dashboard page

    const stats = await window.getDashboardStats();

    document.getElementById('totalCourses').textContent = stats.totalCourses;
    document.getElementById('totalStudents').textContent = stats.totalStudents;
    document.getElementById('totalRevenue').textContent = '$' + stats.totalRevenue.toLocaleString();

    // Recent enrollments
    const enrollments = (await window.getEnrollments())
        .sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt))
        .slice(0, 5);

    const enrollmentList = document.getElementById('enrollmentList');
    if (enrollmentList) {
        if (enrollments.length === 0) {
            enrollmentList.innerHTML = '<p class="empty-state">No enrollments yet</p>';
        } else {
            const enrollmentPromises = enrollments.map(async (e) => {
                const user = await window.getUserById(e.userId);
                const course = await window.getCourseById(e.courseId);
                return `
                    <div class="enrollment-item">
                        <div class="enrollment-info">
                            <h4>${user?.name || 'Unknown'}</h4>
                            <p>${course?.title || 'Unknown Course'}</p>
                        </div>
                        <div class="enrollment-meta">
                            <p>${formatDate(e.enrolledAt)}</p>
                            <span class="status-badge ${e.paymentStatus === 'completed' ? 'status-completed' : 'status-pending'}">
                                ${e.paymentStatus}
                            </span>
                        </div>
                    </div>
                `;
            });
            enrollmentList.innerHTML = (await Promise.all(enrollmentPromises)).join('');
        }
    }

    // Popular courses
    const popularCourses = (await window.getCourses())
        .sort((a, b) => b.studentCount - a.studentCount)
        .slice(0, 5);

    const popularList = document.getElementById('popularList');
    if (popularList) {
        popularList.innerHTML = popularCourses.map((course, index) => `
            <div class="popular-item">
                <span class="popular-rank">${index + 1}</span>
                <img src="${course.thumbnail}" alt="${course.title}">
                <div class="popular-info">
                    <h4>${course.title}</h4>
                    <p>${course.instructor}</p>
                </div>
                <div class="popular-count">
                    <strong>${course.studentCount}</strong>
                    <span>students</span>
                </div>
            </div>
        `).join('');
    }
}

// Add Course
function initAddCourse() {
    const addCourseForm = document.getElementById('addCourseForm');
    if (!addCourseForm) return;

    // Check if we're in edit mode
    const urlParams = new URLSearchParams(window.location.search);
    const editCourseId = urlParams.get('edit');
    let isEditMode = false;
    let editingCourse = null;

    if (editCourseId) {
        isEditMode = true;
        // Make this async
        (async () => {
            editingCourse = await window.getCourseById(editCourseId);

            if (editingCourse) {
                // Update page title
                const pageTitle = document.querySelector('.page-header h1');
                if (pageTitle) pageTitle.textContent = 'Edit Course';

                // Update submit button text
                const submitBtn = document.getElementById('submitBtn');
                if (submitBtn) {
                    const btnText = submitBtn.querySelector('.btn-text');
                    if (btnText) btnText.textContent = 'Update Course';
                }

                // Load existing data
                videos = editingCourse.videos || [];

                // Populate form fields
                document.getElementById('courseTitle').value = editingCourse.title || '';
                document.getElementById('courseDescription').value = editingCourse.description || '';
                document.getElementById('instructorName').value = editingCourse.instructor || '';
                document.getElementById('courseCategory').value = editingCourse.category || '';
                document.getElementById('courseLevel').value = editingCourse.level || '';
                document.getElementById('priceType').value = editingCourse.priceType || 'free';
                document.getElementById('coursePrice').value = editingCourse.price || 0;
                document.getElementById('courseDuration').value = editingCourse.duration || '';

                // Show price field if paid
                const priceGroup = document.getElementById('priceGroup');
                if (editingCourse.priceType === 'paid' && priceGroup) {
                    priceGroup.style.display = 'block';
                }

                // Load thumbnail
                const thumbnailPreview = document.getElementById('thumbnailPreview');
                if (editingCourse.thumbnail && thumbnailPreview) {
                    thumbnailPreview.innerHTML = `<img src="${editingCourse.thumbnail}" alt="Thumbnail">`;
                    updateThumbnailDeleteBtn();
                }

                // Update video list
                updateVideoList();
            }
        })();
    }

    // Tab switching
    const tabBtns = addCourseForm.querySelectorAll('.tab-btn');
    const tabContents = addCourseForm.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    // Thumbnail upload
    const thumbnailPreview = document.getElementById('thumbnailPreview');
    const thumbnailInput = document.getElementById('thumbnailInput');
    const thumbnailDeleteBtn = document.getElementById('thumbnailDeleteBtn');

    // Function to show/hide delete button
    function updateThumbnailDeleteBtn() {
        if (thumbnailDeleteBtn) {
            const hasImage = thumbnailPreview && thumbnailPreview.querySelector('img');
            thumbnailDeleteBtn.style.display = hasImage ? 'flex' : 'none';
        }
    }

    if (thumbnailPreview && thumbnailInput) {
        thumbnailPreview.addEventListener('click', () => {
            // Only trigger file input if clicking on the preview area, not the delete button
            if (!event.target.closest('.thumbnail-delete-btn')) {
                thumbnailInput.click();
            }
        });

        thumbnailInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    thumbnailPreview.innerHTML = `<img src="${e.target.result}" alt="Thumbnail">`;
                    updateThumbnailDeleteBtn();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Delete thumbnail
    if (thumbnailDeleteBtn && thumbnailPreview) {
        thumbnailDeleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            thumbnailPreview.innerHTML = `
                <i class="fas fa-cloud-upload-alt"></i>
                <span>Upload image or paste URL</span>
            `;
            if (thumbnailInput) {
                thumbnailInput.value = '';
            }
            const thumbnailUrl = document.getElementById('thumbnailUrl');
            if (thumbnailUrl) {
                thumbnailUrl.value = '';
            }
            updateThumbnailDeleteBtn();
            showToast('Thumbnail removed', 'success');
        });
    }

    // Load thumbnail from URL
    const thumbnailUrl = document.getElementById('thumbnailUrl');
    const loadThumbnailBtn = document.getElementById('loadThumbnailBtn');

    if (loadThumbnailBtn && thumbnailUrl && thumbnailPreview) {
        loadThumbnailBtn.addEventListener('click', () => {
            const url = thumbnailUrl.value.trim();

            if (!url) {
                showToast('Please enter an image URL', 'warning');
                return;
            }

            // Validate URL format
            try {
                new URL(url);
            } catch (e) {
                showToast('Please enter a valid URL', 'error');
                return;
            }

            // Test if image loads
            const img = new Image();
            img.onload = () => {
                thumbnailPreview.innerHTML = `<img src="${url}" alt="Thumbnail">`;
                updateThumbnailDeleteBtn();
                showToast('Image loaded successfully', 'success');
            };
            img.onerror = () => {
                showToast('Failed to load image. Please check the URL', 'error');
            };
            img.src = url;
        });
    }

    // Price type toggle
    const priceType = document.getElementById('priceType');
    const priceGroup = document.getElementById('priceGroup');

    if (priceType && priceGroup) {
        priceType.addEventListener('change', () => {
            priceGroup.style.display = priceType.value === 'paid' ? 'block' : 'none';
        });
    }

    // Videos
    let videos = [];

    const videoList = document.getElementById('videoList');
    const emptyVideos = document.getElementById('emptyVideos');
    const videoCount = document.getElementById('videoCount');

    function updateVideoList() {
        if (videoCount) videoCount.textContent = videos.length;

        if (videos.length === 0) {
            if (videoList) videoList.style.display = 'none';
            if (emptyVideos) emptyVideos.style.display = 'block';
            return;
        }

        if (videoList) videoList.style.display = 'flex';
        if (emptyVideos) emptyVideos.style.display = 'none';

        if (videoList) {
            videoList.innerHTML = videos.map((video, index) => `
                <div class="video-item">
                    <span class="video-number">${index + 1}</span>
                    <div class="video-info">
                        <h4>${video.title}</h4>
                        <p>${video.duration}</p>
                    </div>
                    <div class="video-actions">
                        <button type="button" class="preview-video" data-index="${index}">
                            <i class="fas fa-play"></i>
                        </button>
                        <button type="button" class="delete delete-video" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }

        // Add event listeners
        document.querySelectorAll('.preview-video').forEach(btn => {
            btn.addEventListener('click', () => {
                const video = videos[btn.dataset.index];
                openVideoPreview(video);
            });
        });

        document.querySelectorAll('.delete-video').forEach(btn => {
            btn.addEventListener('click', () => {
                videos.splice(btn.dataset.index, 1);
                updateVideoList();
            });
        });
    }

    // Initial render of videos if editing
    // (This will be called from the async block above)

    // Add video
    const addVideoBtn = document.getElementById('addVideoBtn');
    const videoUrlInput = document.getElementById('videoUrl');
    const videoDurationInput = document.getElementById('videoDuration');

    // Auto-fill duration when URL is entered
    if (videoUrlInput && videoDurationInput) {
        videoUrlInput.addEventListener('input', () => {
            const url = videoUrlInput.value.trim();
            if (url && !videoDurationInput.value) {
                // Set default duration based on platform
                if (url.includes('youtube.com') || url.includes('youtu.be')) {
                    videoDurationInput.value = '10 min';
                    videoDurationInput.placeholder = 'Auto-filled (editable)';
                } else if (url.includes('drive.google.com')) {
                    videoDurationInput.value = '15 min';
                    videoDurationInput.placeholder = 'Auto-filled (editable)';
                } else {
                    videoDurationInput.value = '10 min';
                    videoDurationInput.placeholder = 'Auto-filled (editable)';
                }
            }
        });

        // Allow manual override
        videoDurationInput.addEventListener('focus', () => {
            if (videoDurationInput.placeholder === 'Auto-filled (editable)') {
                videoDurationInput.placeholder = 'e.g., 10 min, 1 hour';
            }
        });
    }

    if (addVideoBtn) {
        addVideoBtn.addEventListener('click', () => {
            const title = document.getElementById('videoTitle').value.trim();
            const url = document.getElementById('videoUrl').value.trim();
            const duration = document.getElementById('videoDuration').value.trim() || '10 min';

            if (!title || !url) {
                showToast('Please fill in video title and URL', 'warning');
                return;
            }

            videos.push({
                id: window.generateId('video'),
                title,
                url,
                duration,
                order: videos.length + 1
            });

            document.getElementById('videoTitle').value = '';
            document.getElementById('videoUrl').value = '';
            document.getElementById('videoDuration').value = '';
            document.getElementById('videoDuration').placeholder = 'Duration';

            updateVideoList();
            showToast('Video added successfully', 'success');
        });
    }

    // Video preview modal
    function openVideoPreview(video) {
        const modal = document.getElementById('videoPreviewModal');
        const embedUrl = getEmbedUrl(video.url);

        document.getElementById('previewVideoTitle').textContent = video.title;
        document.getElementById('previewVideoFrame').src = embedUrl;

        // Show modal
        modal.classList.add('active');

        // Log for debugging
        console.log('Opening video preview:', {
            title: video.title,
            originalUrl: video.url,
            embedUrl: embedUrl
        });
    }

    const closeVideoPreview = document.getElementById('closeVideoPreview');
    if (closeVideoPreview) {
        closeVideoPreview.addEventListener('click', () => {
            const modal = document.getElementById('videoPreviewModal');
            document.getElementById('previewVideoFrame').src = '';
            modal.classList.remove('active');
        });
    }

    // Close modal when clicking outside
    const videoPreviewModal = document.getElementById('videoPreviewModal');
    if (videoPreviewModal) {
        videoPreviewModal.addEventListener('click', (e) => {
            if (e.target === videoPreviewModal) {
                document.getElementById('previewVideoFrame').src = '';
                videoPreviewModal.classList.remove('active');
            }
        });
    }

    // Form submit
    if (addCourseForm) {
        addCourseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Form submitted');

            const title = document.getElementById('courseTitle').value.trim();
            const description = document.getElementById('courseDescription').value.trim();
            const instructor = document.getElementById('instructorName').value.trim();

            if (!title || !description || !instructor) {
                showToast('Please fill in all required fields', 'warning');
                return;
            }

            if (videos.length === 0) {
                showToast('Please add at least one video', 'warning');
                return;
            }

            const submitBtn = document.getElementById('submitBtn');
            const spinner = submitBtn.querySelector('.spinner');
            const btnText = submitBtn.querySelector('.btn-text');

            spinner.style.display = 'inline-block';
            btnText.textContent = isEditMode ? 'Updating...' : 'Creating...';
            submitBtn.disabled = true;

            try {
                // Get thumbnail
                let thumbnail = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop';
                if (thumbnailPreview) {
                    const thumbnailImg = thumbnailPreview.querySelector('img');
                    if (thumbnailImg) {
                        thumbnail = thumbnailImg.src;
                    }
                }

                const courseData = {
                    title,
                    description,
                    instructor,
                    thumbnail,
                    category: document.getElementById('courseCategory').value || '',
                    level: document.getElementById('courseLevel').value || '',
                    priceType: document.getElementById('priceType').value,
                    price: parseInt(document.getElementById('coursePrice').value || '0') || 0,
                    videos,
                    duration: document.getElementById('courseDuration').value || '4 weeks',
                    status: 'active'
                };

                if (isEditMode && editingCourse) {
                    // Update existing course
                    const updatedCourse = {
                        ...editingCourse,
                        ...courseData,
                        // Keep original values for these fields
                        id: editingCourse.id,
                        rating: editingCourse.rating,
                        studentCount: editingCourse.studentCount,
                        createdAt: editingCourse.createdAt
                    };

                    console.log('Updating course:', updatedCourse);
                    await window.updateCourse(updatedCourse);
                    showToast('Course updated successfully!', 'success');
                } else {
                    // Create new course
                    const newCourse = {
                        id: window.generateId('course'),
                        ...courseData,
                        rating: 0,
                        studentCount: 0,
                        createdAt: new Date().toISOString()
                    };

                    console.log('Creating course:', newCourse);
                    await window.addCourse(newCourse);
                    showToast('Course created successfully!', 'success');
                }

                setTimeout(() => {
                    window.location.href = 'admin-courses.html';
                }, 1500);
            } catch (error) {
                console.error('Error saving course:', error);
                showToast('Error saving course. Please try again.', 'error');
                spinner.style.display = 'none';
                btnText.textContent = isEditMode ? 'Update Course' : 'Create Course';
                submitBtn.disabled = false;
            }
        });
    }
}

// Manage Courses
// Manage Courses
async function initManageCourses() {
    const coursesTableBody = document.getElementById('coursesTableBody');
    if (!coursesTableBody) return;

    let courses = await window.getCourses();
    // Sort by createdAt descending (newest first)
    courses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    renderCoursesTable(courses);

    // Filters
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const levelFilter = document.getElementById('levelFilter');
    const priceFilter = document.getElementById('priceFilter');
    const clearFilters = document.getElementById('clearFilters');

    async function applyFilters() {
        let filtered = await window.getCourses();

        if (searchInput && searchInput.value) {
            const query = searchInput.value.toLowerCase();
            filtered = filtered.filter(c =>
                c.title.toLowerCase().includes(query) ||
                c.instructor.toLowerCase().includes(query)
            );
        }

        if (categoryFilter && categoryFilter.value && categoryFilter.value !== 'all') {
            filtered = filtered.filter(c => c.category === categoryFilter.value);
        }

        if (levelFilter && levelFilter.value && levelFilter.value !== 'all') {
            filtered = filtered.filter(c => c.level === levelFilter.value);
        }

        if (priceFilter && priceFilter.value && priceFilter.value !== 'all') {
            filtered = filtered.filter(c => c.priceType === priceFilter.value);
        }

        renderCoursesTable(filtered);
    }

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (levelFilter) levelFilter.addEventListener('change', applyFilters);
    if (priceFilter) priceFilter.addEventListener('change', applyFilters);

    if (clearFilters) clearFilters.addEventListener('click', async () => {
        searchInput.value = '';
        categoryFilter.value = 'all';
        levelFilter.value = 'all';
        priceFilter.value = 'all';
        renderCoursesTable(await window.getCourses());
    });

    function renderCoursesTable(courses) {
        const emptyCourses = document.getElementById('emptyCourses');

        if (courses.length === 0) {
            coursesTableBody.innerHTML = '';
            emptyCourses.style.display = 'block';
            return;
        }

        emptyCourses.style.display = 'none';

        // Sort by createdAt descending (newest first)
        const sortedCourses = [...courses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        coursesTableBody.innerHTML = sortedCourses.map(course => `
            <tr>
                <td>
                    <div class="course-cell">
                        <img src="${course.thumbnail}" alt="${course.title}">
                        <div>
                            <h4>${course.title}</h4>
                            <span>${course.level}</span>
                        </div>
                    </div>
                </td>
                <td>${course.instructor}</td>
                <td><span class="badge">${course.category}</span></td>
                <td>${course.priceType === 'free' ? '<span class="badge status-completed">Free</span>' : '$' + course.price}</td>
                <td>${course.studentCount}</td>
                <td><span class="badge ${course.status === 'active' ? 'status-completed' : ''}">${course.status}</span></td>
                <td>
                    <div class="video-actions">
                        <button class="edit-course" data-id="${course.id}"><i class="fas fa-edit"></i></button>
                        <button class="delete delete-course" data-id="${course.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Delete handlers
        document.querySelectorAll('.delete-course').forEach(btn => {
            btn.addEventListener('click', async () => {
                const courseId = btn.dataset.id;
                const course = await window.getCourseById(courseId);

                document.getElementById('deleteCourseName').textContent = course.title;
                document.getElementById('deleteModal').classList.add('active');

                document.getElementById('confirmDelete').onclick = async () => {
                    await window.deleteCourse(courseId);
                    document.getElementById('deleteModal').classList.remove('active');
                    applyFilters();
                    showToast('Course deleted successfully', 'success');
                };
            });
        });

        // Edit handlers
        document.querySelectorAll('.edit-course').forEach(btn => {
            btn.addEventListener('click', () => {
                const courseId = btn.dataset.id;
                // Redirect to add course page with course ID for editing
                window.location.href = `admin-add-course.html?edit=${courseId}`;
            });
        });

        const cancelDelete = document.getElementById('cancelDelete');
        if (cancelDelete) {
            cancelDelete.addEventListener('click', () => {
                document.getElementById('deleteModal').classList.remove('active');
            });
        }
    }
}

// Students
async function initStudents() {
    const studentsTableBody = document.getElementById('studentsTableBody');
    if (!studentsTableBody) return;

    // Populate course filter
    const courseFilter = document.getElementById('courseFilter');
    if (courseFilter) {
        const courses = await window.getCourses();
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.id;
            option.textContent = course.title;
            courseFilter.appendChild(option);
        });
    }

    let enrollments = await window.getEnrollments();
    renderStudentsTable(enrollments);

    // Filters
    const searchInput = document.getElementById('searchInput');
    const progressFilter = document.getElementById('progressFilter');
    const clearFilters = document.getElementById('clearFilters');

    async function applyFilters() {
        let filtered = await window.getEnrollments();

        if (searchInput && searchInput.value) {
            const query = searchInput.value.toLowerCase();
            const filteredPromises = filtered.map(async (e) => {
                const user = await window.getUserById(e.userId);
                return user && (user.name.toLowerCase().includes(query) ||
                    user.email.toLowerCase().includes(query)) ? e : null;
            });
            const results = await Promise.all(filteredPromises);
            filtered = results.filter(e => e !== null);
        }

        if (courseFilter && courseFilter.value && courseFilter.value !== 'all') {
            filtered = filtered.filter(e => e.courseId === courseFilter.value);
        }

        if (progressFilter && progressFilter.value && progressFilter.value !== 'all') {
            filtered = filtered.filter(e => {
                if (progressFilter.value === 'completed') return e.progress === 100;
                if (progressFilter.value === 'in-progress') return e.progress > 0 && e.progress < 100;
                if (progressFilter.value === 'not-started') return e.progress === 0;
                return true;
            });
        }

        renderStudentsTable(filtered);
    }

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (courseFilter) courseFilter.addEventListener('change', applyFilters);
    if (progressFilter) progressFilter.addEventListener('change', applyFilters);
    if (clearFilters) clearFilters.addEventListener('click', async () => {
        searchInput.value = '';
        courseFilter.value = 'all';
        progressFilter.value = 'all';
        renderStudentsTable(await window.getEnrollments());
    });

    function renderStudentsTable(enrollments) {
        const emptyStudents = document.getElementById('emptyStudents');

        if (enrollments.length === 0) {
            studentsTableBody.innerHTML = '';
            emptyStudents.style.display = 'block';
            return;
        }

        emptyStudents.style.display = 'none';

        Promise.all(enrollments.map(async (e) => {
            const user = await window.getUserById(e.userId);
            const course = await window.getCourseById(e.courseId);
            return `
                <tr>
                    <td>
                        <div class="course-cell">
                            <div class="instructor-avatar">${user?.name.charAt(0) || '?'}</div>
                            <div>
                                <h4>${user?.name || 'Unknown'}</h4>
                                <span>${user?.email || ''}</span>
                            </div>
                        </div>
                    </td>
                    <td>${course?.title || 'Unknown'}</td>
                    <td>${formatDate(e.enrolledAt)}</td>
                    <td>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${e.progress}%"></div>
                        </div>
                        <span>${e.progress}%</span>
                    </td>
                    <td><span class="badge ${e.paymentStatus === 'completed' ? 'status-completed' : 'status-pending'}">${e.paymentStatus}</span></td>
                    <td>${e.rating > 0 ? `<span class='badge'>${e.rating} <i class='fas fa-star' style='color:gold'></i></span>` : '-'}</td>
                    <td>${e.feedback ? `<span title='${e.feedback}'>${e.feedback.length > 40 ? e.feedback.slice(0,40)+'...' : e.feedback}</span>` : '-'}</td>
                </tr>
            `;
        })).then(rows => {
            studentsTableBody.innerHTML = rows.join('');
        });
    }
}

// Payments
async function initPayments() {
    const paymentsTableBody = document.getElementById('paymentsTableBody');
    if (!paymentsTableBody) return;

    const payments = await window.getPayments();

    // Stats
    const totalRevenue = payments.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0);
    document.getElementById('totalRevenue').textContent = '$' + totalRevenue.toLocaleString();
    document.getElementById('totalTransactions').textContent = payments.length;
    document.getElementById('successfulPayments').textContent = payments.filter(p => p.status === 'success').length;
    document.getElementById('failedPayments').textContent = payments.filter(p => p.status === 'failed').length;

    renderPaymentsTable(payments);

    // Filters
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const clearFilters = document.getElementById('clearFilters');

    async function applyFilters() {
        let filtered = await window.getPayments();

        if (searchInput && searchInput.value) {
            const query = searchInput.value.toLowerCase();
            const filteredPromises = filtered.map(async (p) => {
                const user = await window.getUserById(p.userId);
                return (user && user.name.toLowerCase().includes(query)) ||
                    p.transactionId.toLowerCase().includes(query) ? p : null;
            });
            const results = await Promise.all(filteredPromises);
            filtered = results.filter(p => p !== null);
        }

        if (statusFilter && statusFilter.value && statusFilter.value !== 'all') {
            filtered = filtered.filter(p => p.status === statusFilter.value);
        }

        renderPaymentsTable(filtered);
    }

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    if (clearFilters) clearFilters.addEventListener('click', async () => {
        searchInput.value = '';
        statusFilter.value = 'all';
        renderPaymentsTable(await window.getPayments());
    });

    function renderPaymentsTable(payments) {
        const emptyPayments = document.getElementById('emptyPayments');

        if (payments.length === 0) {
            paymentsTableBody.innerHTML = '';
            emptyPayments.style.display = 'block';
            return;
        }

        emptyPayments.style.display = 'none';

        Promise.all(payments.map(async (p) => {
            const user = await window.getUserById(p.userId);
            const course = await window.getCourseById(p.courseId);
            return `
                <tr>
                    <td><code>${p.transactionId}</code></td>
                    <td>
                        <div>
                            <h4>${user?.name || 'Unknown'}</h4>
                            <span>${user?.email || ''}</span>
                        </div>
                    </td>
                    <td>${course?.title || 'Unknown'}</td>
                    <td>${p.amount === 0 ? 'Free' : '$' + p.amount}</td>
                    <td>${formatDate(p.paidAt)}</td>
                    <td><span class="badge ${p.status === 'success' ? 'status-completed' : p.status === 'pending' ? 'status-pending' : ''}">${p.status}</span></td>
                </tr>
            `;
        })).then(rows => {
            paymentsTableBody.innerHTML = rows.join('');
        });
    }
}
// ============================================
// Uniq English - User Dashboard JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    initSidebar();
    initLogout();
    initMyCourses();
    initPayments();
    initProfile();
    initPassword();
});

// Check Authentication
function checkAuth() {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    if (currentUser.role === 'admin') {
        window.location.href = 'admin-dashboard.html';
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
            setCurrentUser(null);
            window.location.href = 'login.html';
        });
    }
}

// My Courses
async function initMyCourses() {
    const myCoursesGrid = document.getElementById('myCoursesGrid');
    if (!myCoursesGrid) return;

    const currentUser = window.getCurrentUser();
    const enrollments = await window.getUserEnrollments(currentUser.id);

    // Update counts
    document.getElementById('allCount').textContent = enrollments.length;
    document.getElementById('progressCount').textContent = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;
    document.getElementById('completedCount').textContent = enrollments.filter(e => e.progress === 100).length;
    document.getElementById('notStartedCount').textContent = enrollments.filter(e => e.progress === 0).length;

    // Tab filtering
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.tab;
            const filtered = filterEnrollments(enrollments, filter);
            await renderMyCourses(filtered);
        });
    });

    await renderMyCourses(enrollments);
}

function filterEnrollments(enrollments, filter) {
    if (filter === 'all') return enrollments;
    if (filter === 'completed') return enrollments.filter(e => e.progress === 100);
    if (filter === 'in-progress') return enrollments.filter(e => e.progress > 0 && e.progress < 100);
    if (filter === 'not-started') return enrollments.filter(e => e.progress === 0);
    return enrollments;
}

async function renderMyCourses(enrollments) {
    const myCoursesGrid = document.getElementById('myCoursesGrid');
    const emptyCourses = document.getElementById('emptyCourses');
    const emptyMessage = document.getElementById('emptyMessage');

    if (enrollments.length === 0) {
        myCoursesGrid.style.display = 'none';
        emptyCourses.style.display = 'block';

        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) {
            const filter = activeTab.dataset.tab;
            emptyMessage.textContent = filter === 'all' ?
                "You haven't enrolled in any courses yet." :
                "No courses in this category.";
        }
        return;
    }

    myCoursesGrid.style.display = 'grid';
    emptyCourses.style.display = 'none';

    const coursePromises = enrollments.map(async (enrollment) => {
        const course = await window.getCourseById(enrollment.courseId);
        if (!course) return '';

        const statusBadge = enrollment.progress === 100 ?
            '<span class="badge badge-free">Completed</span>' :
            enrollment.progress > 0 ?
            '<span class="badge badge-paid">In Progress</span>' :
            '<span class="badge" style="background: var(--gray-400);">Not Started</span>';

        // Determine button based on completion status
        let buttonHTML = '';
        if (enrollment.progress === 100) {
            // Already downloaded certificate - show completed status
            buttonHTML = `<button class="btn btn-success btn-full" disabled><i class="fas fa-check-circle"></i> Certificate Downloaded</button>`;
        } else if (enrollment.progress === 90) {
            // All videos complete - show download certificate button
            buttonHTML = `<button class="btn btn-primary btn-full download-cert-btn" data-course-id="${course.id}" data-course-title="${course.title}"><i class="fas fa-download"></i> Download Certificate</button>`;
        } else if (enrollment.progress === 0) {
            buttonHTML = `<a href="course-player.html?course=${course.id}" class="btn btn-primary btn-full"><i class="fas fa-play"></i> Start Course</a>`;
        } else {
            buttonHTML = `<a href="course-player.html?course=${course.id}" class="btn btn-primary btn-full"><i class="fas fa-play"></i> Continue Learning</a>`;
        }

        return `
            <div class="course-card progress-card">
                <div class="course-thumbnail">
                    <img src="${course.thumbnail}" alt="${course.title}">
                    <div class="course-badges" style="right: 1rem; left: auto;">
                        ${statusBadge}
                    </div>
                    <div class="progress-bar" style="width: ${enrollment.progress}%"></div>
                </div>
                <div class="course-content">
                    <h3 class="course-title">${course.title}</h3>
                    <p class="course-description">Instructor: ${course.instructor}</p>
                    <div class="progress-info">
                        <div class="label">
                            <span>Progress</span>
                            <span>${enrollment.progress}%</span>
                        </div>
                        <div class="progress-track">
                            <div class="progress-fill" style="width: ${enrollment.progress}%"></div>
                        </div>
                    </div>
                    <div class="last-accessed">
                        <i class="fas fa-clock"></i>
                        <span>Last accessed: ${formatDate(enrollment.lastAccessed)}</span>
                    </div>
                    ${buttonHTML}
                </div>
            </div>
        `;
    });

    const courseHTMLArray = await Promise.all(coursePromises);
    myCoursesGrid.innerHTML = courseHTMLArray.join('');

    // Add event listeners to download certificate buttons
    document.querySelectorAll('.download-cert-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            downloadCertificate(this.dataset.courseId, this.dataset.courseTitle);
        });
    });
}

// Payments
async function initPayments() {
    const userPaymentsTableBody = document.getElementById('userPaymentsTableBody');
    if (!userPaymentsTableBody) return;

    const currentUser = window.getCurrentUser();
    const payments = await window.getUserPayments(currentUser.id);

    // Stats
    const totalSpent = payments.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0);
    const totalSpentEl = document.getElementById('totalSpent');
    const coursesPurchasedEl = document.getElementById('coursesPurchased');

    if (totalSpentEl) {
        totalSpentEl.textContent = '$' + totalSpent.toLocaleString();
    }
    if (coursesPurchasedEl) {
        coursesPurchasedEl.textContent = new Set(payments.map(p => p.courseId)).size;
    }

    if (payments.length === 0) {
        userPaymentsTableBody.innerHTML = '';
        document.getElementById('emptyPayments').style.display = 'block';
        return;
    }

    document.getElementById('emptyPayments').style.display = 'none';

    // Fetch all courses for the payments
    const coursePromises = payments.map(async (p) => {
        const course = await window.getCourseById(p.courseId);
        return `
            <tr>
                <td><strong>${course?.title || 'Unknown'}</strong></td>
                <td>${p.amount === 0 ? 'Free' : '$' + p.amount}</td>
                <td>${formatDate(p.paidAt)}</td>
                <td><code>${p.transactionId}</code></td>
                <td><span class="badge ${p.status === 'success' ? 'status-completed' : p.status === 'pending' ? 'status-pending' : ''}">${p.status}</span></td>
                <td><button class="btn btn-ghost btn-sm"><i class="fas fa-download"></i> Download</button></td>
            </tr>
        `;
    });

    const paymentRows = await Promise.all(coursePromises);
    userPaymentsTableBody.innerHTML = paymentRows.join('');
}

// Profile
function initProfile() {
    const profileForm = document.getElementById('profileForm');
    if (!profileForm) return;

    const currentUser = getCurrentUser();

    // Populate form
    document.getElementById('profileName').value = currentUser.name;
    document.getElementById('profileEmail').value = currentUser.email;
    document.getElementById('profilePhone').value = currentUser.phone || '';
    document.getElementById('profileBio').value = currentUser.bio || '';

    // Avatar
    const avatarPreview = document.getElementById('avatarPreview');
    const avatarInitial = document.getElementById('avatarInitial');
    const avatarUrlInput = document.getElementById('avatarUrlInput');

    avatarInitial.textContent = currentUser.name.charAt(0).toUpperCase();

    if (currentUser.avatar) {
        avatarPreview.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}">`;
        if (avatarUrlInput) {
            avatarUrlInput.value = currentUser.avatar;
        }
    }

    // Avatar URL input - update preview when URL changes
    if (avatarUrlInput) {
        avatarUrlInput.addEventListener('input', (e) => {
            const url = e.target.value.trim();
            if (url) {
                // Test if URL is valid by trying to load the image
                const img = new Image();
                img.onload = () => {
                    avatarPreview.innerHTML = `<img src="${url}" alt="Avatar">`;
                };
                img.onerror = () => {
                    // If image fails to load, show initial
                    avatarPreview.innerHTML = `<span id="avatarInitial">${currentUser.name.charAt(0).toUpperCase()}</span>`;
                };
                img.src = url;
            } else {
                // If URL is empty, show initial
                avatarPreview.innerHTML = `<span id="avatarInitial">${currentUser.name.charAt(0).toUpperCase()}</span>`;
            }
        });
    }

    // Form submit
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('saveProfileBtn');
        const spinner = submitBtn.querySelector('.spinner');
        const btnText = submitBtn.querySelector('.btn-text');

        spinner.style.display = 'block';
        btnText.textContent = 'Saving...';
        submitBtn.disabled = true;

        // Get avatar URL from input
        const avatarUrl = avatarUrlInput ? avatarUrlInput.value.trim() : currentUser.avatar;

        const updatedUser = {
            ...currentUser,
            name: document.getElementById('profileName').value.trim(),
            phone: document.getElementById('profilePhone').value.trim(),
            bio: document.getElementById('profileBio').value.trim(),
            avatar: avatarUrl
        };

        await window.updateUser(updatedUser);
        window.setCurrentUser(updatedUser);

        // Update sidebar
        const sidebarName = document.getElementById('sidebarName');
        const sidebarInitial = document.getElementById('sidebarInitial');
        const sidebarAvatar = document.getElementById('sidebarAvatar');

        if (sidebarName) sidebarName.textContent = updatedUser.name;
        if (sidebarInitial) sidebarInitial.textContent = updatedUser.name.charAt(0).toUpperCase();
        if (sidebarAvatar && updatedUser.avatar) {
            sidebarAvatar.innerHTML = `<img src="${updatedUser.avatar}" alt="${updatedUser.name}">`;
        }

        spinner.style.display = 'none';
        btnText.textContent = 'Save Changes';
        submitBtn.disabled = false;

        showToast('Profile updated successfully!', 'success');
    });
}

// Password
function initPassword() {
    const passwordForm = document.getElementById('passwordForm');
    if (!passwordForm) return;

    const currentUser = getCurrentUser();

    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const input = document.getElementById(targetId);
            const icon = btn.querySelector('i');

            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        const submitBtn = document.getElementById('updatePasswordBtn');
        const spinner = submitBtn.querySelector('.spinner');
        const btnText = submitBtn.querySelector('.btn-text');

        // Validate current password
        if (currentUser.password !== currentPassword) {
            showToast('Current password is incorrect', 'error');
            return;
        }

        // Validate new password
        if (newPassword.length < 6) {
            showToast('New password must be at least 6 characters', 'error');
            return;
        }

        // Validate confirm password
        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }

        spinner.style.display = 'block';
        btnText.textContent = 'Updating...';
        submitBtn.disabled = true;

        const updatedUser = {
            ...currentUser,
            password: newPassword
        };

        updateUser(updatedUser);
        setCurrentUser(updatedUser);

        spinner.style.display = 'none';
        btnText.textContent = 'Update Password';
        submitBtn.disabled = false;

        passwordForm.reset();
        showToast('Password changed successfully!', 'success');
    });
}

// Download Certificate
async function downloadCertificate(courseId, courseTitle) {
    const currentUser = window.getCurrentUser();

    showToast('Generating certificate preview...', 'info');

    // Update progress to 100% when certificate is generated
    const enrollments = await window.getUserEnrollments(currentUser.id);
    const enrollment = enrollments.find(e => e.courseId === courseId);
    if (enrollment && enrollment.progress < 100) {
        enrollment.progress = 100;
        await window.updateEnrollment(enrollment);
    }

    setTimeout(() => {
        const certificateHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Certificate of Completion - ${courseTitle}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Georgia', serif;
            background: #f5f5f5;
            padding: 20px;
        }
        .actions {
            max-width: 800px;
            margin: 0 auto 20px;
            display: flex;
            gap: 10px;
            justify-content: center;
        }
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s;
        }
        .btn-primary {
            background: #2563eb;
            color: white;
        }
        .btn-primary:hover {
            background: #1d4ed8;
        }
        .btn-secondary {
            background: #10b981;
            color: white;
        }
        .btn-secondary:hover {
            background: #059669;
        }
        .certificate-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 60px;
            border: 20px solid #2563eb;
            box-shadow: 0 0 30px rgba(0,0,0,0.1);
            text-align: center;
        }
        .certificate h1 {
            font-size: 48px;
            color: #2563eb;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 3px;
        }
        .certificate h2 {
            font-size: 24px;
            color: #333;
            margin: 30px 0;
        }
        .certificate .name {
            font-size: 36px;
            color: #7c3aed;
            font-weight: bold;
            margin: 20px 0;
            border-bottom: 2px solid #2563eb;
            display: inline-block;
            padding-bottom: 10px;
        }
        .certificate .course {
            font-size: 28px;
            color: #333;
            margin: 30px 0;
            font-style: italic;
        }
        .certificate .date {
            font-size: 18px;
            color: #666;
            margin-top: 40px;
        }
        .certificate .signature {
            margin-top: 60px;
            display: flex;
            justify-content: space-around;
        }
        .certificate .signature div {
            text-align: center;
        }
        .certificate .signature .line {
            width: 200px;
            border-top: 2px solid #333;
            margin: 0 auto 10px;
        }
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .actions {
                display: none;
            }
            .certificate-container {
                border: 15px solid #2563eb;
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="actions">
        <button class="btn btn-primary" onclick="window.print()">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
                <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/>
            </svg>
            Print Certificate
        </button>
        <button class="btn btn-secondary" onclick="downloadPDF()">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
            </svg>
            Download as PDF
        </button>
    </div>
    
    <div class="certificate-container">
        <div class="certificate">
            <h1>Certificate of Completion</h1>
            <h2>This is to certify that</h2>
            <div class="name">${currentUser.name}</div>
            <h2>has successfully completed the course</h2>
            <div class="course">${courseTitle}</div>
            <div class="date">Date: ${new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}</div>
            <div class="signature">
                <div>
                    <div class="line"></div>
                    <p>Instructor Signature</p>
                </div>
                <div>
                    <div class="line"></div>
                    <p>Director Signature</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        function downloadPDF() {
            // Use browser's print to PDF functionality
            window.print();
        }
    </script>
</body>
</html>`;

        const certificateWindow = window.open('', '_blank', 'width=900,height=800');
        if (certificateWindow) {
            certificateWindow.document.write(certificateHTML);
            certificateWindow.document.close();
        }

        showToast('Certificate preview opened! Progress updated to 100%.', 'success');

        // Refresh the page to show updated progress
        setTimeout(() => {
            location.reload();
        }, 2000);
    }, 1000);
}
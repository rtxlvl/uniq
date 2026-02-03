// ============================================
// Uniq English - Course Player JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    initSidebar();
    initLogout();
    initPlayer();
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

// Player State
let currentCourse = null;
let currentEnrollment = null;
let currentVideoIndex = 0;
let videos = [];

// Initialize Player
async function initPlayer() {
    try {
        // Get course ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('course');

        if (!courseId) {
            showToast('No course selected', 'error');
            setTimeout(() => window.location.href = 'user-dashboard.html', 1500);
            return;
        }

        const currentUser = window.getCurrentUser();
        currentCourse = await window.getCourseById(courseId);

        if (!currentCourse) {
            showToast('Course not found', 'error');
            setTimeout(() => window.location.href = 'user-dashboard.html', 1500);
            return;
        }

        // Check enrollment
        const enrollments = await window.getUserEnrollments(currentUser.id);
        currentEnrollment = enrollments.find(e => e.courseId === courseId);

        if (!currentEnrollment) {
            showToast('You are not enrolled in this course', 'error');
            setTimeout(() => window.location.href = 'user-dashboard.html', 1500);
            return;
        }

        // Set progress to 25% when user starts the course (first time opening player)
        if (currentEnrollment.progress === 0) {
            currentEnrollment.progress = 25;
            await window.updateEnrollment(currentEnrollment);
        }

        // Set course info
        const courseTitleEl = document.getElementById('courseTitle');
        if (courseTitleEl) {
            courseTitleEl.textContent = currentCourse.title;
        }

        // Get videos
        videos = currentCourse.videos || [];

        if (videos.length === 0) {
            showToast('No videos available for this course', 'error');
            const videoTitleEl = document.getElementById('videoTitle');
            if (videoTitleEl) {
                videoTitleEl.textContent = 'No videos available';
            }
            return;
        }

        // Render playlist
        renderPlaylist();

        // Load first uncompleted video or first video
        const firstUncompleted = videos.findIndex((v, i) => !currentEnrollment.completedVideos.includes(v.id));
        currentVideoIndex = firstUncompleted !== -1 ? firstUncompleted : 0;

        loadVideo(currentVideoIndex);
        updateProgress();
    } catch (error) {
        console.error('Error initializing player:', error);
        showToast('Error loading course player', 'error');
    }
}

// Render Playlist
function renderPlaylist() {
    try {
        const playlist = document.getElementById('videoPlaylist');
        if (!playlist) {
            console.error('Playlist element not found');
            return;
        }

        const completedCount = currentEnrollment.completedVideos.length;
        const playlistProgress = document.getElementById('playlistProgress');
        if (playlistProgress) {
            playlistProgress.textContent = `${completedCount}/${videos.length} videos`;
        }

        playlist.innerHTML = videos.map((video, index) => {
            const isCompleted = currentEnrollment.completedVideos.includes(video.id);
            const isActive = index === currentVideoIndex;

            return `
                <div class="playlist-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" data-index="${index}">
                    <div class="playlist-number">
                        ${isCompleted ? '<i class="fas fa-check"></i>' : index + 1}
                    </div>
                    <div class="playlist-info">
                        <h4>${video.title}</h4>
                        <span><i class="fas fa-clock"></i> ${video.duration}</span>
                    </div>
                    ${isCompleted ? '<i class="fas fa-check-circle completed-icon"></i>' : ''}
                </div>
            `;
        }).join('');

        // Add click handlers
        playlist.querySelectorAll('.playlist-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                currentVideoIndex = index;
                loadVideo(index);
            });
        });

        console.log('Playlist rendered with', videos.length, 'videos');
    } catch (error) {
        console.error('Error rendering playlist:', error);
        showToast('Error rendering playlist', 'error');
    }
}

// Load Video
function loadVideo(index) {
    try {
        if (index < 0 || index >= videos.length) {
            console.error('Invalid video index:', index);
            return;
        }

        currentVideoIndex = index;
        const video = videos[index];

        if (!video) {
            console.error('Video not found at index:', index);
            return;
        }

        // Update video player
        const videoPlayer = document.getElementById('videoPlayer');
        if (videoPlayer) {
            const embedUrl = getEmbedUrl(video.url);
            console.log('Loading video:', video.title, 'URL:', embedUrl);
            videoPlayer.src = embedUrl;
        }

        // Update video info
        const videoTitle = document.getElementById('videoTitle');
        if (videoTitle) {
            videoTitle.textContent = video.title;
        }

        const videoDuration = document.getElementById('videoDuration');
        if (videoDuration) {
            videoDuration.innerHTML = `<i class="fas fa-clock"></i> ${video.duration}`;
        }

        const videoNumber = document.getElementById('videoNumber');
        if (videoNumber) {
            videoNumber.innerHTML = `<i class="fas fa-list-ol"></i> Video ${index + 1} of ${videos.length}`;
        }

        const videoDescription = document.getElementById('videoDescription');
        if (videoDescription) {
            const isCompleted = currentEnrollment.completedVideos.includes(video.id);
            if (isCompleted) {
                videoDescription.textContent = `Lesson ${index + 1}: ${video.title}. Completed!`;
            } else {
                videoDescription.textContent = `Lesson ${index + 1}: ${video.title}. Watch the video and click "Mark as Complete" when finished.`;
            }
        }

        // Update playlist active state
        document.querySelectorAll('.playlist-item').forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });

        // Update navigation buttons
        const prevBtn = document.getElementById('prevVideoBtn');
        const nextBtn = document.getElementById('nextVideoBtn');
        if (prevBtn) prevBtn.disabled = index === 0;
        if (nextBtn) nextBtn.disabled = index === videos.length - 1;

        // Update mark complete button
        updateMarkCompleteButton();

        // Scroll active item into view
        const activeItem = document.querySelector(`.playlist-item[data-index="${index}"]`);
        if (activeItem) {
            activeItem.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    } catch (error) {
        console.error('Error loading video:', error);
        // Don't show error toast if video loads successfully
    }
}

// Update mark complete button state
function updateMarkCompleteButton() {
    const markCompleteBtn = document.getElementById('markCompleteBtn');
    if (!markCompleteBtn || currentVideoIndex < 0 || currentVideoIndex >= videos.length) return;

    const video = videos[currentVideoIndex];
    const isCompleted = currentEnrollment.completedVideos.includes(video.id);

    if (isCompleted) {
        markCompleteBtn.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
        markCompleteBtn.classList.add('completed');
        markCompleteBtn.disabled = true;
    } else {
        markCompleteBtn.innerHTML = '<i class="fas fa-check"></i> Mark as Complete';
        markCompleteBtn.classList.remove('completed');
        markCompleteBtn.disabled = false;
    }
}

// Update Progress
async function updateProgress() {
    const completedCount = currentEnrollment.completedVideos.length;
    const totalVideos = videos.length;

    let progressPercent = currentEnrollment.progress;

    // If all videos are completed, set to 90%
    if (completedCount === totalVideos && totalVideos > 0) {
        progressPercent = 90;
    } else if (completedCount > 0) {
        // Between 25% and 90% based on completed videos
        // Formula: 25 + ((completedCount / totalVideos) * 65)
        progressPercent = Math.round(25 + ((completedCount / totalVideos) * 65));
    }

    // Update header progress
    const headerProgressBar = document.getElementById('headerProgressBar');
    const headerProgressText = document.getElementById('headerProgressText');

    if (headerProgressBar) {
        headerProgressBar.style.width = `${progressPercent}%`;
    }
    if (headerProgressText) {
        headerProgressText.textContent = `${progressPercent}% Complete`;
    }

    // Update enrollment progress
    currentEnrollment.progress = progressPercent;
    currentEnrollment.lastAccessed = new Date().toISOString();
    await window.updateEnrollment(currentEnrollment);

    console.log(`Progress: ${completedCount}/${totalVideos} completed = ${progressPercent}%`);

    // Check if all videos completed (90% milestone)
    if (completedCount === totalVideos && totalVideos > 0 && progressPercent === 90) {
        showCompletionModal();
    }
}

// Mark Video as Complete
async function markVideoComplete() {
    const video = videos[currentVideoIndex];

    if (currentEnrollment.completedVideos.includes(video.id)) {
        return;
    }

    // Add to completed videos
    currentEnrollment.completedVideos.push(video.id);
    await window.updateEnrollment(currentEnrollment);

    // Update UI
    renderPlaylist();
    loadVideo(currentVideoIndex);
    await updateProgress();

    showToast('Video marked as complete!', 'success');

    // Auto-advance to next video after 2 seconds
    if (currentVideoIndex < videos.length - 1) {
        setTimeout(() => {
            loadVideo(currentVideoIndex + 1);
        }, 2000);
    }
}

// Show Completion Modal
function showCompletionModal() {
    const modal = document.getElementById('completionModal');
    modal.classList.add('active');

    // Add download certificate button handler
    const downloadCertBtn = document.getElementById('downloadCertBtn');
    if (downloadCertBtn) {
        downloadCertBtn.onclick = () => {
            downloadCertificate();
        };
    }
}

// Download Certificate
async function downloadCertificate() {
    const currentUser = window.getCurrentUser();

    showToast('Generating certificate preview...', 'info');

    // Update progress to 100% when certificate is generated
    currentEnrollment.progress = 100;
    await window.updateEnrollment(currentEnrollment);

    setTimeout(() => {
        const certificateHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Certificate of Completion - ${currentCourse.title}</title>
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
            <div class="course">${currentCourse.title}</div>
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

        showToast('Certificate preview opened! Course marked as 100% complete.', 'success');

        // Update UI to reflect 100% completion
        const headerProgressBar = document.getElementById('headerProgressBar');
        const headerProgressText = document.getElementById('headerProgressText');
        if (headerProgressBar) headerProgressBar.style.width = '100%';
        if (headerProgressText) headerProgressText.textContent = '100% Complete';

        // Close modal and redirect after a delay
        setTimeout(() => {
            window.location.href = 'user-dashboard.html';
        }, 2000);
    }, 1000);
}

// Navigation Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Previous video
    const prevBtn = document.getElementById('prevVideoBtn');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentVideoIndex > 0) {
                loadVideo(currentVideoIndex - 1);
            }
        });
    }

    // Next video
    const nextBtn = document.getElementById('nextVideoBtn');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentVideoIndex < videos.length - 1) {
                loadVideo(currentVideoIndex + 1);
            }
        });
    }

    // Mark complete
    const markBtn = document.getElementById('markCompleteBtn');
    if (markBtn) {
        markBtn.addEventListener('click', markVideoComplete);
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Only if player is active
    if (!currentCourse) return;

    switch (e.key) {
        case 'ArrowLeft':
            if (currentVideoIndex > 0) {
                loadVideo(currentVideoIndex - 1);
            }
            break;
        case 'ArrowRight':
        case ' ':
            if (currentVideoIndex < videos.length - 1) {
                loadVideo(currentVideoIndex + 1);
            }
            break;
    }
});
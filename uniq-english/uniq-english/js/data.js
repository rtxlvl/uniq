// ============================================
// Uniq English - Utility Functions
// ============================================

// Note: Core data functions are in firebase-data.js
// This file contains utility functions only

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// Format Currency
function formatCurrency(amount) {
    return '$' + amount.toLocaleString();
}

// Get Embed URL
function getEmbedUrl(url) {
    // YouTube parameters: disablekb=1 disables keyboard, rel=0 no related videos, modestbranding=1 minimal branding
    // Adding controls=1 to show controls but we'll block PiP with CSS
    const youtubeParams = '?rel=0&modestbranding=1&controls=1';

    if (url.includes('youtube.com/watch')) {
        const parts = url.split('v=');
        if (parts.length > 1) {
            const videoId = parts[1].split('&')[0];
            return `https://www.youtube.com/embed/${videoId}${youtubeParams}`;
        }
    }
    if (url.includes('youtu.be')) {
        const videoId = url.split('/').pop().split('?')[0];
        return `https://www.youtube.com/embed/${videoId}${youtubeParams}`;
    }
    if (url.includes('youtube.com/embed')) {
        // If already an embed URL, add parameters
        if (url.includes('?')) {
            return url + '&rel=0&modestbranding=1&controls=1';
        } else {
            return url + youtubeParams;
        }
    }
    if (url.includes('drive.google.com')) {
        const match = url.match(/[-\w]{25,}/);
        if (match && match.length > 0) {
            const fileId = match[0];
            return `https://drive.google.com/file/d/${fileId}/preview`;
        }
    }
    return url;
}

// Generate ID (Fallback if not provided by Firebase)
if (typeof window.generateId !== 'function') {
    window.generateId = function(prefix = 'id') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };
}

// Toast Notification
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Dashboard Stats (Utility function)
if (typeof window.getDashboardStats !== 'function') {
    window.getDashboardStats = async function() {
        const courses = await window.getCourses();
        const enrollments = await window.getEnrollments();
        const payments = (await window.getPayments()).filter(p => p.status === 'success');

        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
        const uniqueStudents = new Set(enrollments.map(e => e.userId)).size;

        return {
            totalCourses: courses.length,
            totalStudents: uniqueStudents,
            totalRevenue,
            averageWatchTime: '4h 32m'
        };
    };
}

console.log('Utility functions loaded');
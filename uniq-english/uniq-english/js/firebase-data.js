// Firebase Data Layer - Replaces localStorage with Firestore
import {
    db,
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy
} from './firebase-config.js';

// ============================================
// Helper Functions
// ============================================

// Generate unique ID
function generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// Users
// ============================================

async function getUsers() {
    try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        return usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting users:', error);
        return [];
    }
}

async function getUserById(userId) {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        return userDoc.exists() ? {
            id: userDoc.id,
            ...userDoc.data()
        } : null;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
}

async function addUser(user) {
    try {
        const userId = user.id || generateId('user');
        await setDoc(doc(db, 'users', userId), {
            ...user,
            id: userId
        });
        return userId;
    } catch (error) {
        console.error('Error adding user:', error);
        return null;
    }
}

async function updateUser(user) {
    try {
        await updateDoc(doc(db, 'users', user.id), user);
        return true;
    } catch (error) {
        console.error('Error updating user:', error);
        return false;
    }
}

// ============================================
// Courses
// ============================================

async function getCourses() {
    try {
        const coursesSnapshot = await getDocs(collection(db, 'courses'));
        return coursesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting courses:', error);
        return [];
    }
}

async function getCourseById(courseId) {
    try {
        const courseDoc = await getDoc(doc(db, 'courses', courseId));
        return courseDoc.exists() ? {
            id: courseDoc.id,
            ...courseDoc.data()
        } : null;
    } catch (error) {
        console.error('Error getting course:', error);
        return null;
    }
}

async function addCourse(course) {
    try {
        const courseId = course.id || generateId('course');
        await setDoc(doc(db, 'courses', courseId), {
            ...course,
            id: courseId
        });
        return courseId;
    } catch (error) {
        console.error('Error adding course:', error);
        return null;
    }
}

async function updateCourse(course) {
    try {
        await updateDoc(doc(db, 'courses', course.id), course);
        return true;
    } catch (error) {
        console.error('Error updating course:', error);
        return false;
    }
}

async function deleteCourse(courseId) {
    try {
        await deleteDoc(doc(db, 'courses', courseId));
        return true;
    } catch (error) {
        console.error('Error deleting course:', error);
        return false;
    }
}

// ============================================
// Enrollments
// ============================================

async function getEnrollments() {
    try {
        const enrollmentsSnapshot = await getDocs(collection(db, 'enrollments'));
        return enrollmentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting enrollments:', error);
        return [];
    }
}

async function getUserEnrollments(userId) {
    try {
        const q = query(collection(db, 'enrollments'), where('userId', '==', userId));
        const enrollmentsSnapshot = await getDocs(q);
        return enrollmentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting user enrollments:', error);
        return [];
    }
}

async function addEnrollment(enrollment) {
    try {
        const enrollmentId = enrollment.id || generateId('enrollment');
        await setDoc(doc(db, 'enrollments', enrollmentId), {
            ...enrollment,
            id: enrollmentId
        });
        return enrollmentId;
    } catch (error) {
        console.error('Error adding enrollment:', error);
        return null;
    }
}

async function updateEnrollment(enrollment) {
    try {
        await updateDoc(doc(db, 'enrollments', enrollment.id), enrollment);
        return true;
    } catch (error) {
        console.error('Error updating enrollment:', error);
        return false;
    }
}

async function isEnrolled(userId, courseId) {
    try {
        const q = query(
            collection(db, 'enrollments'),
            where('userId', '==', userId),
            where('courseId', '==', courseId)
        );
        const enrollmentsSnapshot = await getDocs(q);
        return !enrollmentsSnapshot.empty;
    } catch (error) {
        console.error('Error checking enrollment:', error);
        return false;
    }
}

// ============================================
// Payments
// ============================================

async function getPayments() {
    try {
        const paymentsSnapshot = await getDocs(collection(db, 'payments'));
        return paymentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting payments:', error);
        return [];
    }
}

async function getUserPayments(userId) {
    try {
        const q = query(collection(db, 'payments'), where('userId', '==', userId));
        const paymentsSnapshot = await getDocs(q);
        return paymentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting user payments:', error);
        return [];
    }
}

async function addPayment(payment) {
    try {
        const paymentId = payment.id || generateId('payment');
        await setDoc(doc(db, 'payments', paymentId), {
            ...payment,
            id: paymentId
        });
        return paymentId;
    } catch (error) {
        console.error('Error adding payment:', error);
        return null;
    }
}

// ============================================
// Current User (Session Management - still uses localStorage)
// ============================================

function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        localStorage.removeItem('currentUser');
    }
}

// ============================================
// Export all functions
// ============================================

window.generateId = generateId;
window.getUsers = getUsers;
window.getUserById = getUserById;
window.addUser = addUser;
window.updateUser = updateUser;
window.getCourses = getCourses;
window.getCourseById = getCourseById;
window.addCourse = addCourse;
window.updateCourse = updateCourse;
window.deleteCourse = deleteCourse;
window.getEnrollments = getEnrollments;
window.getUserEnrollments = getUserEnrollments;
window.addEnrollment = addEnrollment;
window.updateEnrollment = updateEnrollment;
window.isEnrolled = isEnrolled;
window.getPayments = getPayments;
window.getUserPayments = getUserPayments;
window.addPayment = addPayment;
window.getCurrentUser = getCurrentUser;
window.setCurrentUser = setCurrentUser;

// ============================================
// Initialize Default Data (if needed)
// ============================================

async function initializeDefaultData() {
    try {
        // Check if courses exist
        const courses = await getCourses();
        if (courses.length === 0) {
            console.log('No courses found, adding default courses...');

            // Add default courses
            const defaultCourses = [{
                    id: 'course-1',
                    title: 'English Grammar Fundamentals',
                    description: 'Master the essential grammar rules for clear and effective communication. Perfect for beginners who want to build a strong foundation.',
                    instructor: 'Sarah Johnson',
                    thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop',
                    category: 'Grammar',
                    level: 'beginner',
                    priceType: 'free',
                    price: 0,
                    videos: [{
                            id: 'v1',
                            title: 'Introduction to Grammar',
                            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                            duration: '10 min',
                            order: 1
                        },
                        {
                            id: 'v2',
                            title: 'Parts of Speech',
                            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                            duration: '15 min',
                            order: 2
                        }
                    ],
                    duration: '4 weeks',
                    rating: 4.8,
                    studentCount: 1250,
                    status: 'active',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'course-2',
                    title: 'Business English Mastery',
                    description: 'Learn professional English for the workplace. Covering emails, meetings, presentations, and negotiations.',
                    instructor: 'Michael Chen',
                    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
                    category: 'Business',
                    level: 'intermediate',
                    priceType: 'paid',
                    price: 99,
                    videos: [{
                        id: 'v3',
                        title: 'Business Communication Basics',
                        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        duration: '20 min',
                        order: 1
                    }],
                    duration: '6 weeks',
                    rating: 4.9,
                    studentCount: 850,
                    status: 'active',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'course-3',
                    title: 'Conversational English',
                    description: 'Improve your speaking skills through interactive lessons and real-life conversation practice.',
                    instructor: 'David Park',
                    thumbnail: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop',
                    category: 'Speaking',
                    level: 'beginner',
                    priceType: 'free',
                    price: 0,
                    videos: [{
                        id: 'v7',
                        title: 'Greetings and Introductions',
                        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        duration: '12 min',
                        order: 1
                    }],
                    duration: '3 weeks',
                    rating: 4.6,
                    studentCount: 3200,
                    status: 'active',
                    createdAt: new Date().toISOString()
                }
            ];

            for (const course of defaultCourses) {
                await addCourse(course);
            }

            console.log('Default courses added successfully');
        }

        // Check if users exist
        const users = await getUsers();
        if (users.length === 0) {
            console.log('No users found, adding default users...');

            await addUser({
                id: 'admin-1',
                name: 'Admin',
                email: 'admin@gmail.com',
                password: 'admin123',
                role: 'admin',
                avatar: '',
                phone: '',
                bio: '',
                createdAt: new Date().toISOString()
            });

            await addUser({
                id: 'student-1',
                name: 'Test Student',
                email: 'student@gmail.com',
                password: 'student123',
                role: 'student',
                avatar: '',
                phone: '+1234567890',
                bio: 'English learner',
                createdAt: new Date().toISOString()
            });

            console.log('Default users added successfully');
        }
    } catch (error) {
        console.error('Error initializing default data:', error);
    }
}

// Initialize default data when Firebase is ready
initializeDefaultData();

console.log('Firebase data layer loaded');
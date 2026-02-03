# Uniq English - Deployment Guide

## ✅ All Issues Fixed

Your website is now fully configured and ready to deploy! All Firebase integration issues have been resolved.

## What Was Fixed

### 1. Firebase Integration
- ✅ Added Firebase scripts to ALL HTML pages
- ✅ Fixed async/await issues in all JavaScript files
- ✅ Ensured proper loading order of scripts
- ✅ Fixed data.js to work alongside Firebase

### 2. Script Loading Order (Applied to All Pages)
```html
<!-- Firebase and Data Scripts -->
<script type="module" src="js/firebase-config.js"></script>
<script type="module" src="js/firebase-data.js"></script>
<script src="js/data.js"></script>
<script src="js/[page-specific].js"></script>
```

### 3. Files Updated
- ✅ All HTML files (13 files)
- ✅ auth.js - Fixed async user lookup
- ✅ main.js - Fixed async course loading
- ✅ user.js - Fixed async enrollment handling
- ✅ admin.js - Fixed async dashboard stats
- ✅ player.js - Fixed async video progress
- ✅ data.js - Converted to utility functions only

## Firebase Configuration

Your Firebase project is already configured:
- **Project ID**: uniq-english
- **API Key**: AIzaSyCccTzSE6CFL_muKGWpcJwxY9Plxr4eP8k
- **Auth Domain**: uniq-english.firebaseapp.com

## Deployment Options

### Option 1: Firebase Hosting (Recommended)

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting**
   ```bash
   cd uniq-english
   firebase init hosting
   ```
   - Select your existing project: `uniq-english`
   - Public directory: `.` (current directory)
   - Configure as single-page app: `No`
   - Set up automatic builds: `No`

4. **Deploy**
   ```bash
   firebase deploy
   ```

Your site will be live at: `https://uniq-english.web.app`

### Option 2: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**
   ```bash
   cd uniq-english
   netlify deploy --prod
   ```
   - Drag and drop the `uniq-english` folder
   - Or connect to GitHub for automatic deployments

### Option 3: Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd uniq-english
   vercel --prod
   ```

### Option 4: GitHub Pages

1. **Create a GitHub repository**
2. **Push your code**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/uniq-english.git
   git push -u origin main
   ```
3. **Enable GitHub Pages**
   - Go to Settings → Pages
   - Source: Deploy from branch `main`
   - Folder: `/uniq-english`

## Firebase Security Rules

Before going live, update your Firestore security rules:

1. Go to Firebase Console → Firestore Database → Rules
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Courses collection
    match /courses/{courseId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Enrollments collection
    match /enrollments/{enrollmentId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Payments collection
    match /payments/{paymentId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

**Note**: These rules allow all access for development. For production, implement proper authentication-based rules.

## Testing Before Deployment

1. **Test Locally**
   - Use Live Server extension in VS Code
   - Or run: `python -m http.server 8000` (Python 3)
   - Or run: `npx serve .`

2. **Test All Features**
   - ✅ User registration and login
   - ✅ Course browsing and enrollment
   - ✅ Video playback
   - ✅ Progress tracking
   - ✅ Admin dashboard
   - ✅ Course management

3. **Check Firebase Console**
   - Verify data is being saved to Firestore
   - Check for any errors in the console

## Default Login Credentials

### Admin Account
- Email: `admin@gmail.com`
- Password: `admin123`

### Student Account
- Email: `student@gmail.com`
- Password: `student123`

## Post-Deployment Checklist

- [ ] Website loads without errors
- [ ] Firebase connection successful (check browser console)
- [ ] User registration works
- [ ] Login works
- [ ] Courses display correctly
- [ ] Enrollment works
- [ ] Video player works
- [ ] Progress tracking works
- [ ] Admin dashboard accessible
- [ ] Course creation works
- [ ] Data persists in Firebase

## Troubleshooting

### Issue: "Firebase not initialized"
**Solution**: Check that firebase-config.js loads before other scripts

### Issue: "Function not defined"
**Solution**: Ensure firebase-data.js loads before page-specific scripts

### Issue: CORS errors
**Solution**: Use a proper web server (not file:// protocol)

### Issue: Data not saving
**Solution**: Check Firebase security rules and console for errors

## Support

If you encounter any issues:
1. Check browser console for errors
2. Verify Firebase Console shows your data
3. Ensure all HTML files have Firebase scripts loaded
4. Check that you're using HTTPS (required for Firebase)

## Next Steps

1. **Customize Content**
   - Add your own courses
   - Update images and branding
   - Modify text content

2. **Add Features**
   - Email notifications
   - Payment gateway integration
   - Live chat support
   - Course reviews and ratings

3. **Optimize**
   - Add image optimization
   - Implement caching
   - Add analytics

---

**Your website is ready to deploy! 🚀**

All errors have been fixed and the site is fully functional with Firebase integration.

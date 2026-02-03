# Test Admin Add Course - Step by Step

## Before Testing

1. Open browser console (F12)
2. Clear any errors
3. Make sure you're logged in as admin

## Step 1: Login as Admin

1. Go to `login.html`
2. Enter credentials:
   - Email: `admin@gmail.com`
   - Password: `admin123`
3. Click "Sign In"
4. Should redirect to admin dashboard

**Check Console**: Should see "Firebase initialized successfully" and "Firebase data layer loaded"

## Step 2: Navigate to Add Course

1. Click "Add Course" in sidebar
2. Page should load: `admin-add-course.html`
3. Form should be visible with 3 tabs: Basic Info, Videos, Pricing

**Check Console**: Should see no errors

## Step 3: Fill Basic Info

1. **Course Title**: Enter "Test Course 123"
2. **Description**: Enter "This is a test course"
3. **Instructor Name**: Enter "Test Instructor"
4. **Category**: Select "Grammar"
5. **Level**: Select "beginner"
6. **Duration**: Enter "2 weeks"

**Check**: All fields should accept input

## Step 4: Add Thumbnail

### Option A: Upload File
1. Click on the upload preview area
2. Select an image file from your computer
3. Image should appear in preview
4. Delete button (trash icon) should appear

### Option B: Use URL
1. Paste this URL in "Or paste image URL" field:
   ```
   https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop
   ```
2. Click "Load" button
3. Image should appear in preview
4. Delete button should appear

**Check Console**: Should see "Image loaded successfully" toast

## Step 5: Add Videos

1. Click "Videos" tab
2. **Video Title**: Enter "Introduction"
3. **Video URL**: Paste:
   ```
   https://www.youtube.com/watch?v=dQw4w9WgXcQ
   ```
4. **Duration**: Should auto-fill to "10 min" (you can edit it)
5. Click the "+" button
6. Video should appear in the list below

**Repeat** to add 2-3 videos

**Check**: 
- Video count in tab should update (Videos (3))
- Each video should have play and delete buttons

## Step 6: Set Pricing

1. Click "Pricing" tab
2. **Price Type**: Select "Free" or "Paid"
3. If "Paid", enter price: `49`

**Check**: Price field should show/hide based on selection

## Step 7: Submit Form

1. Click "Create Course" button
2. Button should show "Creating..." with spinner
3. Should see "Course created successfully!" toast
4. Should redirect to `admin-courses.html` after 1.5 seconds

**Check Console**: Should see:
```
Form submitted
Creating course: {id: "course-...", title: "Test Course 123", ...}
Course created successfully!
```

## Step 8: Verify Course Created

1. Should be on "Manage Courses" page
2. Your new course "Test Course 123" should be in the table
3. Click "Edit" button to test edit mode
4. Form should load with all your data

## Step 9: Check Homepage

1. Go to `index.html`
2. Scroll to "Our Courses" section
3. Your new course should appear in the grid

## Troubleshooting

### If thumbnail doesn't load:
- Check image URL is valid
- Check browser console for CORS errors
- Try a different image URL

### If videos don't add:
- Check console for errors
- Make sure title and URL are filled
- Try clicking the + button again

### If form doesn't submit:
- Check console for errors
- Make sure all required fields are filled (title, description, instructor)
- Make sure at least 1 video is added

### If "Firebase not initialized" error:
- Refresh the page
- Check that firebase-config.js loads first
- Check internet connection

### Common Console Errors and Fixes:

**Error**: `getCourseById is not a function`
**Fix**: Refresh page, Firebase scripts need to load

**Error**: `generateId is not defined`
**Fix**: Use `window.generateId` instead

**Error**: `Cannot read property 'value' of null`
**Fix**: Make sure you're on the add course page

## Expected Console Output (Success)

```
Firebase initialized successfully
Firebase data layer loaded
Form submitted
Creating course: {
  id: "course-1707000000000-abc123",
  title: "Test Course 123",
  description: "This is a test course",
  instructor: "Test Instructor",
  thumbnail: "https://images.unsplash.com/...",
  category: "Grammar",
  level: "beginner",
  priceType: "free",
  price: 0,
  videos: [
    {id: "video-...", title: "Introduction", url: "...", duration: "10 min", order: 1}
  ],
  duration: "2 weeks",
  status: "active",
  rating: 0,
  studentCount: 0,
  createdAt: "2026-02-03T..."
}
Course created successfully!
```

## Success Criteria

✅ Can login as admin
✅ Can navigate to add course page
✅ Can fill all form fields
✅ Can upload/load thumbnail image
✅ Can add multiple videos
✅ Can set pricing
✅ Form submits without errors
✅ Course appears in Firebase
✅ Course appears in courses list
✅ Course appears on homepage
✅ Can edit the course

---

**If all steps pass**: Admin course creation is working! ✅
**If any step fails**: Check the specific troubleshooting section above

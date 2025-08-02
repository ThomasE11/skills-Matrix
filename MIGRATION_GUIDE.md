# Matrix Management System - Mastery Feature Migration Guide

This guide helps you apply the new mastery tracking features to your existing Matrix Management System.

## Database Schema Changes

### 1. Apply Enhanced Schema

Replace your current `prisma/schema.prisma` with the enhanced version from `prisma/schema-enhanced.prisma`:

```bash
cp prisma/schema-enhanced.prisma prisma/schema.prisma
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Apply Database Migration

```bash
npx prisma db push
```

**Note**: This will add the new tables and fields. Existing data will be preserved.

## New Database Models Added

### SkillAttempt
- Tracks individual skill practice attempts
- Records completion status (complete vs incomplete)
- Tracks time spent, steps completed, quiz completion
- Handles pause/resume functionality

### SkillAttemptPause
- Logs all pause events (manual, inactivity, system)
- Tracks pause duration and reasons

### MasteryRequest
- Student requests for skill mastery assessment
- Instructor review and approval workflow
- Tracks practice statistics and progress

### Enhanced StudentProgress
- Additional fields for detailed time tracking
- Session management (active, paused states)
- Separate complete/incomplete attempt counters

## New API Endpoints

### Skill Tracking
- `POST /api/skill-attempts` - Start new attempt
- `PUT /api/skill-attempts` - Update attempt progress  
- `PATCH /api/skill-attempts` - Complete attempt
- `GET /api/skill-attempts` - Get attempt history

### Session Management
- `POST /api/session-management` - Handle pause/resume/inactivity
- `GET /api/session-management` - Get session status

### Mastery System
- `POST /api/mastery-requests` - Submit mastery request
- `GET /api/mastery-requests` - View requests (student/instructor views)
- `PATCH /api/mastery-requests` - Approve/reject requests

### Instructor Tools
- `GET /api/instructor/dashboard` - Comprehensive instructor overview
- `GET /api/instructor/notifications` - Manage instructor notifications
- `PATCH /api/instructor/notifications` - Mark notifications as read
- `DELETE /api/instructor/notifications` - Delete notifications

### Student Features  
- `GET /api/student/mastery` - Student mastery status and progress

## Key Features Implemented

### 1. Detailed Attempt Tracking
- **Complete attempts**: Steps completed + quiz passed
- **Incomplete attempts**: Steps completed without quiz or abandoned
- **Time tracking**: Accurate time measurement with pause handling
- **Inactivity detection**: 1-minute timeout with auto-pause

### 2. Mastery Request System
- Students can request competency assessment
- Requires at least one complete practice attempt
- Instructor notifications for pending requests
- Approval workflow with feedback

### 3. Instructor Dashboard
- Pending mastery requests overview
- Student progress monitoring
- Notification management
- Decision tracking and statistics

### 4. Enhanced Progress Tracking
- Separate complete/incomplete time tracking
- Session state management
- Pause/resume capability
- Activity monitoring

## Frontend Integration

### Student Interface Updates
1. Add "Request Mastery" buttons to skill cards
2. Create "Skills Mastered" section
3. Show mastery request status
4. Display detailed attempt history

### Instructor Interface Updates
1. Create instructor dashboard page
2. Add mastery request review interface
3. Implement notification management
4. Add bulk approval tools

## Configuration

### Environment Variables
Ensure your `.env` file includes:
```
DATABASE_URL="your_postgresql_connection_string"
NEXTAUTH_SECRET="your_secret_key"
NEXTAUTH_URL="http://localhost:3000"
```

### User Roles
The system works with existing roles:
- `STUDENT`: Can practice skills and request mastery
- `LECTURER`: Can review and approve mastery requests
- `ADMIN`: Full access to all features

## Testing Checklist

### Student Flow
- [ ] Start skill practice session
- [ ] Complete steps and quiz (complete attempt)
- [ ] Abandon session (incomplete attempt)  
- [ ] Experience inactivity timeout
- [ ] Request mastery assessment
- [ ] View mastery request status
- [ ] See approved skills in "mastered" section

### Instructor Flow
- [ ] Receive mastery request notifications
- [ ] View instructor dashboard
- [ ] Review student progress and statistics
- [ ] Approve/reject mastery requests
- [ ] Add instructor feedback
- [ ] View notification history

### System Integration
- [ ] Database schema applied successfully
- [ ] All API endpoints respond correctly
- [ ] Notifications are created properly
- [ ] Time tracking is accurate
- [ ] Session management works with browser refresh
- [ ] Mastery status updates student progress

## Troubleshooting

### Common Issues

**Database Connection Errors**:
- Verify PostgreSQL is running
- Check DATABASE_URL environment variable
- Ensure database user has proper permissions

**Prisma Client Errors**:
- Run `npx prisma generate` after schema changes
- Clear node_modules and reinstall if needed

**Authentication Issues**:
- Verify NEXTAUTH configuration
- Check user roles in database
- Ensure session is properly configured

**API Errors**:
- Check server logs for detailed error messages
- Verify request format matches API expectations
- Ensure user has proper permissions

## Support

For issues with the mastery system implementation:
1. Check the API endpoint documentation in each route file
2. Verify database schema matches enhanced version
3. Test with minimal data to isolate issues
4. Check browser console for frontend errors

## Next Steps

After successful migration:
1. Train instructors on the new mastery workflow  
2. Communicate changes to students
3. Monitor system performance with new tracking
4. Collect feedback for future improvements
5. Consider adding batch operations for instructors
6. Implement advanced analytics and reporting
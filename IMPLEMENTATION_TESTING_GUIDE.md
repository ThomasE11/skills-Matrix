# Implementation Testing Guide - Subject-Based Skills System

This guide provides step-by-step instructions for testing the complete subject-based skills system implementation.

## Prerequisites

Ensure you have completed the setup:

1. **Database Schema Applied**:
   ```bash
   cd /Users/eliastlcthomas/Downloads/Matrix_Management_System/paramedic_matrix_system/app
   cp prisma/schema-enhanced.prisma prisma/schema.prisma
   npx prisma generate
   npx prisma db push
   ```

2. **Skills Mapping Data Seeded**:
   ```bash
   npm run seed:skills
   # OR manually:
   npx tsx scripts/seed-skills-mapping.ts
   ```

## Test Plan Overview

### Phase 1: Database & Seeding ✅
- [x] Verify schema application
- [x] Test skills mapping seeding
- [x] Validate subject-skill relationships

### Phase 2: Subject Management 🧪
- [ ] Create/view subjects
- [ ] Manage subject-skill mappings
- [ ] Test subject hierarchy

### Phase 3: Student Enrollment 🧪
- [ ] Enroll students in subjects
- [ ] Verify automatic skill access
- [ ] Test enrollment notifications

### Phase 4: Skills Practice & Tracking 🧪
- [ ] Student skill practice with new tracking
- [ ] Inactivity detection
- [ ] Complete vs incomplete attempts

### Phase 5: Mastery System 🧪
- [ ] Student mastery requests
- [ ] Instructor notifications
- [ ] Mastery approval workflow

## Detailed Testing Steps

### 1. Database Verification

**Check Schema Application:**
```sql
-- Connect to your PostgreSQL database and verify tables exist:
\dt

-- Should show tables including:
-- subjects, subject_skills, skill_attempts, skill_attempt_pauses, mastery_requests
```

**Verify Seeded Data:**
```sql
-- Check subjects (should be 7)
SELECT id, code, name, level FROM subjects ORDER BY level, code;

-- Check skills (should be 44)
SELECT id, name, difficulty_level, category_id FROM skills ORDER BY name;

-- Check subject-skill mappings
SELECT s.code, sk.name, ss.is_core 
FROM subject_skills ss
JOIN subjects s ON ss.subject_id = s.id
JOIN skills sk ON ss.skill_id = sk.id
ORDER BY s.code, sk.name;
```

### 2. API Testing

**Test Subject Management:**
```bash
# Get all subjects
curl -X GET "http://localhost:3000/api/admin/subjects?includeStats=true" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get subject-skill mappings
curl -X GET "http://localhost:3000/api/admin/subject-skills" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get skills for specific subject (HEM1103)
curl -X GET "http://localhost:3000/api/admin/subject-skills?subjectId=1&includeStats=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Test Student Management:**
```bash
# Get all students
curl -X GET "http://localhost:3000/api/admin/students?includeEnrollments=true" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Search students
curl -X GET "http://localhost:3000/api/admin/students?search=john" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Enrollment Testing

**Test Student Enrollment:**
```bash
# Enroll student in EMT-Basic (subject ID 1)
curl -X POST "http://localhost:3000/api/admin/subject-enrollment" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "studentId": "STUDENT_ID",
    "subjectId": 1,
    "action": "enroll"
  }'

# Expected response should include:
# - enrollment record
# - skillsEnrolled: 17 (for HEM1103)
# - notification created
```

**Verify Automatic Skill Access:**
```bash
# Check student's enrolled skills
curl -X GET "http://localhost:3000/api/student/enrolled-skills" \
  -H "Authorization: Bearer STUDENT_TOKEN"

# Should return:
# - subjects: array with HEM1103
# - skills: array with 17 EMT-Basic skills
# - Each skill should have progress record with status: "NOT_STARTED"
```

**Test Bulk Enrollment:**
```bash
# Bulk enroll multiple students
curl -X PATCH "http://localhost:3000/api/admin/subject-enrollment" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "operation": "bulk_enroll",
    "studentIds": ["STUDENT_ID_1", "STUDENT_ID_2"],
    "subjectIds": [1, 2]
  }'
```

### 4. Skills Practice Testing

**Test Skill Attempt Tracking:**
```bash
# Start skill practice session
curl -X POST "http://localhost:3000/api/skill-attempts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -d '{
    "skillId": 1
  }'

# Update progress (step completion)
curl -X PUT "http://localhost:3000/api/skill-attempts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -d '{
    "attemptId": "ATTEMPT_ID",
    "stepCompleted": 1,
    "activityUpdate": true
  }'

# Complete attempt (with quiz)
curl -X PATCH "http://localhost:3000/api/skill-attempts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -d '{
    "attemptId": "ATTEMPT_ID",
    "completionType": "COMPLETE_WITH_QUIZ",
    "finalQuizScore": 85
  }'
```

**Test Inactivity Detection:**
```bash
# Simulate inactivity check
curl -X POST "http://localhost:3000/api/session-management" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -d '{
    "action": "check_inactivity",
    "attemptId": "ATTEMPT_ID",
    "skillId": 1
  }'

# Should return isInactive: true if >60 seconds since last activity
```

### 5. Mastery System Testing

**Test Mastery Request:**
```bash
# Student requests mastery (after completing practice)
curl -X POST "http://localhost:3000/api/mastery-requests" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -d '{
    "skillId": 1,
    "requestMessage": "I have completed sufficient practice and feel ready for assessment.",
    "studentNotes": "Completed 3 practice sessions with average score of 87%"
  }'

# Should create:
# - MasteryRequest record
# - Notifications for all instructors
```

**Test Instructor Notifications:**
```bash
# Get instructor notifications
curl -X GET "http://localhost:3000/api/instructor/notifications?type=MASTERY_REQUEST" \
  -H "Authorization: Bearer INSTRUCTOR_TOKEN"

# Get instructor dashboard
curl -X GET "http://localhost:3000/api/instructor/dashboard" \
  -H "Authorization: Bearer INSTRUCTOR_TOKEN"
```

**Test Mastery Approval:**
```bash
# Instructor approves mastery
curl -X PATCH "http://localhost:3000/api/mastery-requests" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer INSTRUCTOR_TOKEN" \
  -d '{
    "masteryRequestId": "REQUEST_ID",
    "decision": "MASTERED",
    "instructorNotes": "Excellent demonstration of skill competency."
  }'

# Should:
# - Update MasteryRequest status to APPROVED
# - Update StudentProgress status to MASTERED
# - Create notification for student
```

### 6. Frontend Testing

**Admin Interface:**
1. Navigate to `/admin/subject-enrollment`
2. Test enrollment interface:
   - Select student and subject
   - Click "Enroll Student"
   - Verify success message shows skills count
3. Test search and filtering
4. Test unenrollment

**Student Interface:**
1. Navigate to `/student/skills`
2. Verify skills from enrolled subjects appear
3. Test skill practice:
   - Click "Start Practice" on a skill
   - Complete steps and quiz
   - Verify tracking works

4. Navigate to `/student/mastery`
5. Test mastery request:
   - Find completed skill in "Ready for Mastery" tab
   - Click "Request Mastery Assessment"
   - Verify request appears in "My Requests" tab

**Instructor Interface:**
1. Navigate to instructor dashboard
2. Verify mastery requests appear
3. Test approval workflow
4. Check notification management

## Expected Data Flow

### Enrollment Flow:
1. **Admin enrolls student** → UserSubject record created
2. **Auto-enrollment triggers** → StudentProgress records created for all subject skills
3. **Student notification** → Student informed of new skill access
4. **Skills appear** → Student can see and practice enrolled skills

### Practice Flow:
1. **Student starts practice** → SkillAttempt record created
2. **Progress tracking** → Steps completed, time tracked
3. **Inactivity detection** → Auto-pause after 1 minute
4. **Completion tracking** → Complete vs incomplete attempts recorded

### Mastery Flow:
1. **Student requests mastery** → MasteryRequest created
2. **Instructor notifications** → All instructors notified
3. **Instructor review** → Progress and statistics available
4. **Decision made** → Student notified, progress updated

## Common Issues & Solutions

### Database Issues:
**Problem**: Seeding fails with foreign key errors
**Solution**: Ensure schema is properly applied, check existing data conflicts

**Problem**: Duplicate skill entries
**Solution**: Clear existing data or modify seeding script to handle duplicates

### API Issues:
**Problem**: 401 Unauthorized errors
**Solution**: Verify authentication tokens and user roles

**Problem**: Skills not appearing for student
**Solution**: Check UserSubject enrollment and StudentProgress records

### Frontend Issues:
**Problem**: Skills not loading
**Solution**: Check API endpoints and network requests in browser dev tools

**Problem**: Enrollment not working
**Solution**: Verify admin permissions and API responses

## Performance Testing

### Load Testing:
- Test with 100+ students enrolled in multiple subjects
- Verify API response times remain <500ms
- Check database query performance

### Data Validation:
- Verify referential integrity across all tables
- Check that skill progress is properly isolated per student
- Confirm mastery requests don't create duplicates

## Success Criteria

✅ **Database Setup**: All tables created, seeded with 44 skills across 7 subjects
✅ **Subject Management**: Can view, create, and manage subject-skill mappings
✅ **Student Enrollment**: Students automatically get skill access when enrolled
✅ **Skills Practice**: Complete tracking with inactivity detection works
✅ **Mastery System**: Full workflow from request to approval functions
✅ **Notifications**: All stakeholders receive appropriate notifications
✅ **Frontend**: All interfaces are functional and user-friendly

## Next Steps After Testing

1. **Performance Optimization**: Based on load testing results
2. **User Training**: Create guides for administrators and instructors
3. **Backup Strategy**: Implement regular database backups
4. **Monitoring**: Set up application monitoring and alerting
5. **Documentation**: Update user documentation with new features
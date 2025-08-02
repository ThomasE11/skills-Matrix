
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestLecturer() {
  console.log('🧑‍🏫 Creating test lecturer account...');
  
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('johndoe123', 12);
    
    // Create or update the test lecturer
    const lecturer = await prisma.user.upsert({
      where: { email: 'john@doe.com' },
      update: {
        name: 'John Doe',
        password: hashedPassword,
        role: 'LECTURER'
      },
      create: {
        email: 'john@doe.com',
        name: 'John Doe',
        password: hashedPassword,
        role: 'LECTURER'
      }
    });
    
    console.log('✅ Test lecturer created:', lecturer.email);
    
    // Also create a test student for analytics data
    const hashedStudentPassword = await bcrypt.hash('password123', 12);
    
    const student = await prisma.user.upsert({
      where: { email: 'student@test.com' },
      update: {
        name: 'Test Student',
        password: hashedStudentPassword,
        role: 'STUDENT'
      },
      create: {
        email: 'student@test.com',
        name: 'Test Student',
        password: hashedStudentPassword,
        role: 'STUDENT',
        studentId: 'STU001'
      }
    });
    
    console.log('✅ Test student created:', student.email);
    
    // Create some sample progress data for analytics
    const skills = await prisma.skill.findMany({ take: 10 });
    
    for (const skill of skills) {
      await prisma.studentProgress.upsert({
        where: {
          userId_skillId: {
            userId: student.id,
            skillId: skill.id
          }
        },
        update: {},
        create: {
          userId: student.id,
          skillId: skill.id,
          status: Math.random() > 0.5 ? 'COMPLETED' : 'IN_PROGRESS',
          attempts: Math.floor(Math.random() * 5) + 1,
          timeSpentMinutes: Math.floor(Math.random() * 60) + 10,
          completedSteps: [1, 2, 3],
          lastAttemptDate: new Date()
        }
      });
    }
    
    console.log('✅ Sample progress data created');
    
  } catch (error) {
    console.error('❌ Error creating test accounts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestLecturer().catch((error) => {
  console.error(error);
  process.exit(1);
});

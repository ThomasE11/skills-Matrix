
import { prisma } from '../lib/db';
import bcrypt from 'bcryptjs';

async function createTestStudent() {
  try {
    const hashedPassword = await bcrypt.hash('student123', 12);
    
    const student = await prisma.user.create({
      data: {
        name: 'Test Student',
        email: 'test@student.com',
        password: hashedPassword,
        role: 'STUDENT',
        studentId: 'TEST001',
      },
    });
    
    console.log('Test student created successfully:');
    console.log('Email: test@student.com');
    console.log('Password: student123');
    console.log('Student ID:', student.studentId);
    console.log('Role:', student.role);
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log('Test student already exists');
    } else {
      console.error('Error creating test student:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestStudent();

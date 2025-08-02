
import { prisma } from '../lib/db';

async function checkUsers() {
  try {
    console.log('Checking database connection...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studentId: true,
        createdAt: true,
      },
    });

    console.log('\n=== DATABASE USERS ===');
    console.log(`Total users found: ${users.length}`);
    
    if (users.length === 0) {
      console.log('No users found in database');
    } else {
      console.log('\nUser details:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Student ID: ${user.studentId || 'None'}`);
        console.log(`   Created: ${user.createdAt.toISOString()}`);
        console.log('   ---');
      });
    }

    // Count by role
    const roleCount = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n=== ROLE DISTRIBUTION ===');
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`${role}: ${count}`);
    });

    console.log('\n=== TESTING DATABASE CONNECTION ===');
    const dbTest = await prisma.$queryRaw`SELECT NOW() as current_time`;
    console.log('Database connection successful:', dbTest);

  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();

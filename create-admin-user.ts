import { prisma } from '../lib/db';
import bcrypt from 'bcryptjs';

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...');

    const email = 'john@doe.com';
    const password = 'johndoe123';
    const name = 'John Doe';
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log(`👤 User with email ${email} already exists`);
      console.log(`   Current role: ${existingUser.role}`);
      
      // Update to admin if not already admin
      if (existingUser.role !== 'ADMIN') {
        const updatedUser = await prisma.user.update({
          where: { email },
          data: { role: 'ADMIN' }
        });
        console.log(`✅ Updated user role to ADMIN`);
        return updatedUser;
      } else {
        console.log(`✅ User is already an ADMIN`);
        return existingUser;
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new admin user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log(`   Name: ${newUser.name}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Role: ${newUser.role}`);
    console.log(`   ID: ${newUser.id}`);

    // Test login credentials
    const passwordMatch = await bcrypt.compare(password, newUser.password);
    console.log(`🔑 Password verification: ${passwordMatch ? 'PASS' : 'FAIL'}`);

    return newUser;

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('\n🎉 Admin user setup complete!');
    console.log('\n📋 Login credentials:');
    console.log('   Email: john@doe.com');
    console.log('   Password: johndoe123');
    console.log('   Role: ADMIN');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
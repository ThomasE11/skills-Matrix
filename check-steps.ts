
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSteps() {
  try {
    const stepCount = await prisma.skillStep.count();
    console.log(`Total skill steps in database: ${stepCount}`);
    
    const skillsWithSteps = await prisma.skill.findMany({
      include: {
        steps: true,
        _count: {
          select: {
            steps: true
          }
        }
      }
    });
    
    console.log('\nSkills with steps:');
    skillsWithSteps.forEach(skill => {
      if (skill._count.steps > 0) {
        console.log(`- ${skill.name}: ${skill._count.steps} steps`);
      }
    });
    
    const skillsWithoutSteps = skillsWithSteps.filter(skill => skill._count.steps === 0);
    console.log(`\nSkills without steps: ${skillsWithoutSteps.length}`);
    
  } catch (error) {
    console.error('Error checking steps:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSteps();

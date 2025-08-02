
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixStepNumbering() {
  console.log('🔧 FIXING STEP NUMBERING ISSUES');
  console.log('='.repeat(50));

  try {
    // Get all skills with steps
    const skillsWithSteps = await prisma.skill.findMany({
      where: {
        steps: {
          some: {}
        }
      },
      include: {
        steps: {
          orderBy: {
            id: 'asc' // Order by creation time to maintain logical sequence
          }
        }
      }
    });

    let fixedCount = 0;

    for (const skill of skillsWithSteps) {
      console.log(`\n🔍 Checking: ${skill.name}`);
      console.log(`   Current steps: ${skill.steps.length}`);

      // Check if steps need renumbering
      let needsRenumbering = false;
      for (let i = 0; i < skill.steps.length; i++) {
        if (skill.steps[i].stepNumber !== i + 1) {
          needsRenumbering = true;
          break;
        }
      }

      if (needsRenumbering) {
        console.log(`❌ Step numbering issues detected - fixing...`);
        
        // Renumber the steps in order
        for (let i = 0; i < skill.steps.length; i++) {
          await prisma.skillStep.update({
            where: {
              id: skill.steps[i].id
            },
            data: {
              stepNumber: i + 1
            }
          });
        }

        console.log(`✅ Fixed step numbering for ${skill.name}`);
        fixedCount++;
      } else {
        console.log(`✅ Step numbering is correct`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎯 STEP NUMBERING FIX COMPLETE');
    console.log('='.repeat(50));
    console.log(`✅ Fixed ${fixedCount} skills`);
    console.log(`📊 Total skills checked: ${skillsWithSteps.length}`);

  } catch (error) {
    console.error('❌ Error fixing step numbering:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixStepNumbering();

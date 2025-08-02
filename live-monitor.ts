
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function liveMonitor() {
  console.clear();
  console.log('🔴 LIVE EXTRACTION MONITOR');
  console.log('='.repeat(60));
  console.log(`⏰ ${new Date().toLocaleString()}\n`);

  try {
    // Get current skill counts
    const skillsWithSteps = await prisma.skill.count({
      where: {
        steps: {
          some: {}
        }
      }
    });

    const totalSkills = await prisma.skill.count();
    const completionPercentage = ((skillsWithSteps / totalSkills) * 100).toFixed(1);

    console.log('📊 CURRENT PROGRESS');
    console.log('-'.repeat(30));
    console.log(`Skills with steps: ${skillsWithSteps}/${totalSkills} (${completionPercentage}%)`);
    console.log(`Remaining: ${totalSkills - skillsWithSteps}`);

    // Check extraction log
    if (fs.existsSync('step-extraction.log')) {
      const logContent = fs.readFileSync('step-extraction.log', 'utf-8');
      const lines = logContent.split('\n');
      const lastFewLines = lines.slice(-10).filter(line => line.trim());
      
      console.log('\n📋 RECENT EXTRACTION ACTIVITY');
      console.log('-'.repeat(30));
      lastFewLines.forEach(line => {
        if (line.includes('Processing:')) {
          console.log(`🔄 ${line}`);
        } else if (line.includes('Successfully saved')) {
          console.log(`✅ ${line}`);
        } else if (line.includes('Failed to') || line.includes('❌')) {
          console.log(`❌ ${line}`);
        }
      });
    }

    // Get recently completed skills
    const recentSkills = await prisma.skill.findMany({
      where: {
        steps: {
          some: {}
        }
      },
      include: {
        steps: true,
        category: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 5
    });

    if (recentSkills.length > 0) {
      console.log('\n🎯 RECENTLY COMPLETED SKILLS');
      console.log('-'.repeat(30));
      recentSkills.forEach((skill, index) => {
        console.log(`${index + 1}. ${skill.name} (${skill.steps.length} steps)`);
      });
    }

    // Critical skills progress
    const criticalComplete = await prisma.skill.count({
      where: {
        isCritical: true,
        steps: {
          some: {}
        }
      }
    });

    const criticalTotal = await prisma.skill.count({
      where: {
        isCritical: true
      }
    });

    console.log('\n🚨 CRITICAL SKILLS STATUS');
    console.log('-'.repeat(30));
    console.log(`Complete: ${criticalComplete}/${criticalTotal}`);

    console.log('\n⟳ Refreshing every 30 seconds... (Ctrl+C to exit)');

  } catch (error) {
    console.error('❌ Monitor error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run monitor in loop
async function startMonitor() {
  while (true) {
    await liveMonitor();
    await new Promise(resolve => setTimeout(resolve, 30000)); // 30 second refresh
  }
}

if (require.main === module) {
  startMonitor();
}

export { liveMonitor };

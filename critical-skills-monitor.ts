
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CriticalSkill {
  id: number;
  name: string;
  category: string;
  difficulty: string;
  stepCount: number;
  quizCount: number;
  status: 'complete' | 'incomplete';
  priority: 'high' | 'medium' | 'low';
}

async function monitorCriticalSkills() {
  console.log('🚨 CRITICAL SKILLS PRIORITY MONITOR');
  console.log('='.repeat(60));
  console.log(`⏰ ${new Date().toLocaleString()}\n`);

  try {
    const criticalSkills = await prisma.skill.findMany({
      where: {
        isCritical: true
      },
      include: {
        steps: true,
        quizQuestions: true,
        category: true
      },
      orderBy: [
        { category: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    const skillsData: CriticalSkill[] = criticalSkills.map(skill => {
      const stepCount = skill.steps.length;
      const quizCount = skill.quizQuestions.length;
      const status = stepCount > 0 ? 'complete' : 'incomplete';
      
      // Determine priority based on category and current status
      let priority: CriticalSkill['priority'] = 'medium';
      if (skill.category?.name === 'Basic Life Support (BLS)' && status === 'incomplete') {
        priority = 'high';
      } else if (skill.category?.name === 'Advanced Life Support (ALS)' && status === 'incomplete') {
        priority = 'high';
      } else if (status === 'complete' && quizCount === 0) {
        priority = 'medium';
      } else if (status === 'complete') {
        priority = 'low';
      }

      return {
        id: skill.id,
        name: skill.name,
        category: skill.category?.name || 'Unknown',
        difficulty: 'Unknown', // Remove difficulty access that doesn't exist
        stepCount,
        quizCount,
        status,
        priority
      };
    });

    const totalCritical = skillsData.length;
    const completeCritical = skillsData.filter(s => s.status === 'complete').length;
    const incompleteCritical = skillsData.filter(s => s.status === 'incomplete').length;
    const completionPercentage = (completeCritical / totalCritical) * 100;

    console.log('📊 CRITICAL SKILLS SUMMARY');
    console.log('-'.repeat(40));
    console.log(`Total Critical Skills: ${totalCritical}`);
    console.log(`✅ Complete: ${completeCritical} (${completionPercentage.toFixed(1)}%)`);
    console.log(`❌ Incomplete: ${incompleteCritical} (${(100 - completionPercentage).toFixed(1)}%)`);
    console.log(`🎯 Target for Deployment: 90% (${Math.ceil(totalCritical * 0.9)} skills)`);
    console.log(`📈 Remaining Needed: ${Math.max(0, Math.ceil(totalCritical * 0.9) - completeCritical)} skills`);

    // Group by priority
    const highPriority = skillsData.filter(s => s.priority === 'high');
    const mediumPriority = skillsData.filter(s => s.priority === 'medium');
    const lowPriority = skillsData.filter(s => s.priority === 'low');

    console.log('\n🔥 HIGH PRIORITY CRITICAL SKILLS (URGENT)');
    console.log('-'.repeat(50));
    if (highPriority.length === 0) {
      console.log('🎉 No high priority critical skills remaining!');
    } else {
      highPriority.forEach((skill, index) => {
        const statusIcon = skill.status === 'complete' ? '✅' : '❌';
        const quizIcon = skill.quizCount > 0 ? '🧠' : '❓';
        console.log(`${index + 1}. ${statusIcon} ${skill.name}`);
        console.log(`   📂 ${skill.category} | 🎯 ${skill.difficulty} | ${skill.stepCount} steps | ${quizIcon} ${skill.quizCount} quiz`);
      });
    }

    console.log('\n⚠️ MEDIUM PRIORITY CRITICAL SKILLS');
    console.log('-'.repeat(40));
    mediumPriority.forEach((skill, index) => {
      const statusIcon = skill.status === 'complete' ? '✅' : '❌';
      const quizIcon = skill.quizCount > 0 ? '🧠' : '❓';
      console.log(`${index + 1}. ${statusIcon} ${skill.name}`);
      console.log(`   📂 ${skill.category} | ${skill.stepCount} steps | ${quizIcon} ${skill.quizCount} quiz`);
    });

    if (lowPriority.length > 0) {
      console.log('\n✅ LOW PRIORITY CRITICAL SKILLS (COMPLETE)');
      console.log('-'.repeat(45));
      lowPriority.forEach((skill, index) => {
        const quizIcon = skill.quizCount > 0 ? '🧠' : '❓';
        console.log(`${index + 1}. ✅ ${skill.name}`);
        console.log(`   📂 ${skill.category} | ${skill.stepCount} steps | ${quizIcon} ${skill.quizCount} quiz`);
      });
    }

    // Progress toward deployment readiness
    console.log('\n🎯 DEPLOYMENT READINESS PROGRESS');
    console.log('-'.repeat(40));
    const targetSkills = Math.ceil(totalCritical * 0.9);
    const progressBar = Math.round((completeCritical / targetSkills) * 30);
    const bar = '█'.repeat(Math.min(progressBar, 30)) + '░'.repeat(Math.max(0, 30 - progressBar));
    console.log(`Critical Skills: [${bar}] ${completeCritical}/${targetSkills}`);
    
    if (completeCritical >= targetSkills) {
      console.log('🎉 CRITICAL SKILLS TARGET ACHIEVED! System ready for deployment.');
    } else {
      const remaining = targetSkills - completeCritical;
      console.log(`📋 ${remaining} more critical skills needed for deployment readiness`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🚨 CRITICAL SKILLS MONITOR COMPLETE');
    console.log('='.repeat(60));

    return {
      totalCritical,
      completeCritical,
      incompleteCritical,
      completionPercentage,
      highPriority: highPriority.length,
      targetAchieved: completeCritical >= targetSkills
    };

  } catch (error) {
    console.error('❌ Critical skills monitoring error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  monitorCriticalSkills();
}

export { monitorCriticalSkills };

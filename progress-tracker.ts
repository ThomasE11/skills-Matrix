
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SkillProgress {
  id: number;
  name: string;
  category: string;
  difficulty: string;
  isCritical: boolean;
  stepCount: number;
  status: 'complete' | 'incomplete';
  hasQuizQuestions: boolean;
}

async function generateProgressReport() {
  console.log('📊 PARAMEDIC SKILLS MATRIX - COMPREHENSIVE PROGRESS REPORT');
  console.log('='.repeat(80));
  console.log(`Generated: ${new Date().toLocaleString()}\n`);

  try {
    // Get all skills with their steps and quiz questions
    const skills = await prisma.skill.findMany({
      include: {
        steps: true,
        category: true,
        quizQuestions: true
      },
      orderBy: [
        { category: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    const skillProgress: SkillProgress[] = skills.map(skill => ({
      id: skill.id,
      name: skill.name,
      category: skill.category?.name || 'Unknown',
      difficulty: 'Unknown', // Remove difficulty access that doesn't exist
      isCritical: skill.isCritical,
      stepCount: skill.steps.length,
      status: skill.steps.length > 0 ? 'complete' : 'incomplete',
      hasQuizQuestions: skill.quizQuestions.length > 0
    }));

    // Generate statistics
    const totalSkills = skillProgress.length;
    const completeSkills = skillProgress.filter(s => s.status === 'complete').length;
    const incompleteSkills = skillProgress.filter(s => s.status === 'incomplete').length;
    const skillsWithQuizzes = skillProgress.filter(s => s.hasQuizQuestions).length;
    const criticalSkillsComplete = skillProgress.filter(s => s.isCritical && s.status === 'complete').length;
    const criticalSkillsTotal = skillProgress.filter(s => s.isCritical).length;

    // Display summary statistics
    console.log('📈 SUMMARY STATISTICS');
    console.log('='.repeat(40));
    console.log(`Total Skills: ${totalSkills}`);
    console.log(`✅ Complete: ${completeSkills} (${((completeSkills/totalSkills)*100).toFixed(1)}%)`);
    console.log(`❌ Incomplete: ${incompleteSkills} (${((incompleteSkills/totalSkills)*100).toFixed(1)}%)`);
    console.log(`🧠 With Quiz Questions: ${skillsWithQuizzes} (${((skillsWithQuizzes/totalSkills)*100).toFixed(1)}%)`);
    console.log(`🚨 Critical Skills Complete: ${criticalSkillsComplete}/${criticalSkillsTotal} (${((criticalSkillsComplete/criticalSkillsTotal)*100).toFixed(1)}%)`);

    // Group by category
    const categorySummary = skillProgress.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = { total: 0, complete: 0, withQuiz: 0 };
      }
      acc[skill.category].total++;
      if (skill.status === 'complete') acc[skill.category].complete++;
      if (skill.hasQuizQuestions) acc[skill.category].withQuiz++;
      return acc;
    }, {} as Record<string, { total: number; complete: number; withQuiz: number }>);

    console.log('\n📂 PROGRESS BY CATEGORY');
    console.log('='.repeat(80));
    Object.entries(categorySummary).forEach(([category, stats]) => {
      const completion = ((stats.complete / stats.total) * 100).toFixed(1);
      const quizCoverage = ((stats.withQuiz / stats.total) * 100).toFixed(1);
      console.log(`${category}:`);
      console.log(`  Steps: ${stats.complete}/${stats.total} (${completion}%) | Quiz: ${stats.withQuiz}/${stats.total} (${quizCoverage}%)`);
    });

    // Complete skills list
    const completeSkillsList = skillProgress.filter(s => s.status === 'complete');
    if (completeSkillsList.length > 0) {
      console.log('\n✅ SKILLS WITH COMPLETE STEPS');
      console.log('='.repeat(80));
      completeSkillsList.forEach((skill, index) => {
        const quizStatus = skill.hasQuizQuestions ? '🧠' : '❓';
        const criticalStatus = skill.isCritical ? '🚨' : '📋';
        console.log(`${index + 1}. ${skill.name}`);
        console.log(`   ${criticalStatus} ${skill.difficulty} | ${skill.stepCount} steps | ${quizStatus} Quiz | ${skill.category}`);
      });
    }

    // Incomplete skills list
    const incompleteSkillsList = skillProgress.filter(s => s.status === 'incomplete');
    if (incompleteSkillsList.length > 0) {
      console.log('\n❌ SKILLS NEEDING STEP EXTRACTION');
      console.log('='.repeat(80));
      incompleteSkillsList.forEach((skill, index) => {
        const quizStatus = skill.hasQuizQuestions ? '🧠' : '❓';
        const criticalStatus = skill.isCritical ? '🚨' : '📋';
        console.log(`${index + 1}. ${skill.name}`);
        console.log(`   ${criticalStatus} ${skill.difficulty} | ${quizStatus} Quiz | ${skill.category}`);
      });
    }

    // Critical skills priority list
    const criticalIncomplete = skillProgress.filter(s => s.isCritical && s.status === 'incomplete');
    if (criticalIncomplete.length > 0) {
      console.log('\n🚨 CRITICAL SKILLS PRIORITY LIST');
      console.log('='.repeat(80));
      criticalIncomplete.forEach((skill, index) => {
        console.log(`${index + 1}. ${skill.name} (${skill.category})`);
      });
    }

    // Quiz coverage analysis
    console.log('\n🧠 QUIZ INTEGRATION STATUS');
    console.log('='.repeat(80));
    const skillsNeedingQuizzes = skillProgress.filter(s => s.status === 'complete' && !s.hasQuizQuestions);
    console.log(`Skills with steps but no quiz questions: ${skillsNeedingQuizzes.length}`);
    
    if (skillsNeedingQuizzes.length > 0) {
      console.log('\nSkills needing quiz questions:');
      skillsNeedingQuizzes.forEach((skill, index) => {
        console.log(`${index + 1}. ${skill.name} (${skill.stepCount} steps)`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 PROGRESS REPORT COMPLETE');
    console.log('='.repeat(80));

    return {
      totalSkills,
      completeSkills,
      incompleteSkills,
      skillsWithQuizzes,
      criticalSkillsComplete,
      criticalSkillsTotal,
      skillProgress
    };

  } catch (error) {
    console.error('❌ Error generating progress report:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  generateProgressReport();
}

export { generateProgressReport, type SkillProgress };

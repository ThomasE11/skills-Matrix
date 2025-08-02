import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function auditSkillsSteps() {
  console.log('🔍 Auditing all skills for step completeness...\n');

  try {
    // Get all skills with their steps
    const skills = await prisma.skill.findMany({
      include: {
        steps: {
          orderBy: {
            stepNumber: 'asc'
          }
        },
        category: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`📊 Total Skills in Database: ${skills.length}\n`);

    const skillsWithSteps = skills.filter(skill => skill.steps.length > 0);
    const skillsWithoutSteps = skills.filter(skill => skill.steps.length === 0);
    const skillsWithIncompleteSteps = skills.filter(skill => {
      if (skill.steps.length === 0) return false;
      return skill.steps.some(step => 
        !step.title || 
        !step.description || 
        step.title.trim() === '' || 
        step.description.trim() === ''
      );
    });

    console.log('='.repeat(80));
    console.log('📈 SUMMARY STATISTICS');
    console.log('='.repeat(80));
    console.log(`✅ Skills with steps: ${skillsWithSteps.length}`);
    console.log(`❌ Skills without steps: ${skillsWithoutSteps.length}`);
    console.log(`⚠️  Skills with incomplete steps: ${skillsWithIncompleteSteps.length}`);
    console.log(`🎯 Skills needing attention: ${skillsWithoutSteps.length + skillsWithIncompleteSteps.length}`);
    console.log('');

    if (skillsWithoutSteps.length > 0) {
      console.log('='.repeat(80));
      console.log('❌ SKILLS WITHOUT ANY STEPS');
      console.log('='.repeat(80));
      skillsWithoutSteps.forEach((skill, index) => {
        console.log(`${index + 1}. ${skill.name}`);
        console.log(`   Category: ${skill.category.name}`);
        console.log(`   Critical: ${skill.isCritical ? 'Yes' : 'No'}`);
        console.log(`   Difficulty: ${skill.difficultyLevel}`);
        console.log('');
      });
    }

    if (skillsWithIncompleteSteps.length > 0) {
      console.log('='.repeat(80));
      console.log('⚠️  SKILLS WITH INCOMPLETE STEPS');
      console.log('='.repeat(80));
      skillsWithIncompleteSteps.forEach((skill, index) => {
        console.log(`${index + 1}. ${skill.name} (${skill.steps.length} steps)`);
        console.log(`   Category: ${skill.category.name}`);
        
        skill.steps.forEach((step, stepIndex) => {
          const issues = [];
          if (!step.title || step.title.trim() === '') issues.push('missing title');
          if (!step.description || step.description.trim() === '') issues.push('missing description');
          
          if (issues.length > 0) {
            console.log(`   Step ${stepIndex + 1}: ${issues.join(', ')}`);
          }
        });
        console.log('');
      });
    }

    console.log('='.repeat(80));
    console.log('📋 SKILLS WITH COMPLETE STEPS');
    console.log('='.repeat(80));
    const skillsWithCompleteSteps = skillsWithSteps.filter(skill => 
      !skillsWithIncompleteSteps.includes(skill)
    );

    skillsWithCompleteSteps.forEach((skill, index) => {
      console.log(`${index + 1}. ${skill.name} (${skill.steps.length} steps)`);
      console.log(`   Category: ${skill.category.name}`);
      console.log(`   Critical: ${skill.isCritical ? 'Yes' : 'No'}`);
      console.log('');
    });

    console.log('='.repeat(80));
    console.log('🎯 SKILLS REQUIRING STEP EXTRACTION');
    console.log('='.repeat(80));
    const skillsNeedingExtraction = [...skillsWithoutSteps, ...skillsWithIncompleteSteps];
    
    console.log(`Total skills needing step extraction: ${skillsNeedingExtraction.length}`);
    console.log('');
    
    skillsNeedingExtraction.forEach((skill, index) => {
      console.log(`${index + 1}. "${skill.name}"`);
    });

    console.log('\n📁 Next: Check skill_documents directory for available Word documents to extract steps from.');

  } catch (error) {
    console.error('❌ Error auditing skills:', error);
  } finally {
    await prisma.$disconnect();
  }
}

auditSkillsSteps();

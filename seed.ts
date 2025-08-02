
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Load the extracted skills data
const extractedSkillsPath = path.join(__dirname, '../data/extracted_paramedic_skills.json');
const extractedSkills = JSON.parse(fs.readFileSync(extractedSkillsPath, 'utf8'));

// Category mapping to match database
const categoryMapping: { [key: string]: string } = {
  'Basic Life Support (BLS)': 'Basic Life Support (BLS)',
  'Advanced Life Support (ALS)': 'Advanced Life Support (ALS)',
  'Medical Emergencies': 'Medical Emergencies',
  'Trauma Care': 'Trauma Care',
  'Special Populations': 'Special Populations'
};

// Difficulty level mapping
const difficultyMapping: { [key: string]: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' } = {
  'BEGINNER': 'BEGINNER',
  'INTERMEDIATE': 'INTERMEDIATE',
  'ADVANCED': 'ADVANCED'
};

async function clearExistingSkills() {
  console.log('🧹 Clearing existing skills data...');
  
  // Delete in correct order to avoid foreign key constraints
  await prisma.quizAttempt.deleteMany({});
  await prisma.quizQuestion.deleteMany({});
  await prisma.reflectionNote.deleteMany({});
  await prisma.studentProgress.deleteMany({});
  await prisma.skillPrerequisite.deleteMany({});
  await prisma.assessmentCriteria.deleteMany({});
  await prisma.skillStep.deleteMany({});
  await prisma.skill.deleteMany({});
  
  console.log('✅ Existing skills data cleared');
}

async function ensureCategories() {
  console.log('📝 Ensuring categories exist...');
  
  const categories = [
    {
      name: 'Basic Life Support (BLS)',
      description: 'Essential life-saving skills for emergency situations',
      colorCode: '#60B5FF'
    },
    {
      name: 'Advanced Life Support (ALS)',
      description: 'Advanced medical interventions for critical care',
      colorCode: '#FF9149'
    },
    {
      name: 'Medical Emergencies',
      description: 'Skills for handling various medical emergency conditions',
      colorCode: '#FF9898'
    },
    {
      name: 'Trauma Care',
      description: 'Specialized skills for trauma patient management',
      colorCode: '#FF90BB'
    },
    {
      name: 'Special Populations',
      description: 'Specialized care for pediatric, geriatric, and special needs patients',
      colorCode: '#80D8C3'
    }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: category,
      create: category
    });
  }
  
  console.log('✅ Categories ensured');
}

async function createSkills() {
  console.log('🎯 Creating skills from extracted data...');
  
  // Get category IDs
  const categories = await prisma.category.findMany();
  const categoryIdMap = categories.reduce((acc, cat) => {
    acc[cat.name] = cat.id;
    return acc;
  }, {} as { [key: string]: number });

  let skillCount = 0;
  
  for (const extractedSkill of extractedSkills) {
    try {
      // Map category name
      const categoryName = categoryMapping[extractedSkill.category];
      if (!categoryName) {
        console.warn(`⚠️ Unknown category: ${extractedSkill.category}`);
        continue;
      }
      
      const categoryId = categoryIdMap[categoryName];
      if (!categoryId) {
        console.warn(`⚠️ Category ID not found for: ${categoryName}`);
        continue;
      }

      // Map difficulty level
      const difficultyLevel = difficultyMapping[extractedSkill.difficulty_level] || 'BEGINNER';

      // Create the skill
      const skill = await prisma.skill.create({
        data: {
          name: extractedSkill.name,
          categoryId: categoryId,
          difficultyLevel: difficultyLevel,
          description: extractedSkill.description || '',
          prerequisites: extractedSkill.prerequisites || [],
          estimatedTimeMinutes: extractedSkill.estimated_time_minutes || 30,
          isCritical: extractedSkill.is_critical || false,
          objectives: extractedSkill.objectives || [],
          indications: extractedSkill.indications || [],
          contraindications: extractedSkill.contraindications || [],
          equipment: extractedSkill.equipment || [],
          commonErrors: extractedSkill.common_errors || [],
          documentationReqs: extractedSkill.documentation_reqs || [],
          minimumPracticeCount: 1
        }
      });

      // Create assessment criteria if available
      if (extractedSkill.assessment_criteria && Array.isArray(extractedSkill.assessment_criteria)) {
        for (const criteria of extractedSkill.assessment_criteria) {
          await prisma.assessmentCriteria.create({
            data: {
              skillId: skill.id,
              criteriaName: criteria.criteria_name || 'Assessment Criteria',
              description: criteria.description || '',
              weight: criteria.weight || 1.0,
              isMandatory: criteria.is_mandatory !== false,
              evaluationPoints: criteria.evaluation_points || []
            }
          });
        }
      }

      skillCount++;
      console.log(`✅ Created skill: ${skill.name} (${categoryName})`);
      
    } catch (error) {
      console.error(`❌ Error creating skill "${extractedSkill.name}":`, error);
    }
  }
  
  console.log(`🎉 Successfully created ${skillCount} skills`);
}

async function createSampleQuizQuestions() {
  console.log('📚 Creating sample quiz questions...');
  
  const skills = await prisma.skill.findMany({
    take: 10 // Add quiz questions for first 10 skills
  });
  
  for (const skill of skills) {
    await prisma.quizQuestion.create({
      data: {
        skillId: skill.id,
        question: `What is the primary objective of the ${skill.name} procedure?`,
        options: [
          'To ensure patient safety',
          'To complete the procedure quickly',
          'To use minimal equipment',
          'To avoid documentation'
        ],
        correctAnswer: 0,
        explanation: 'Patient safety is always the primary objective in any medical procedure.',
        difficulty: skill.difficultyLevel
      }
    });
  }
  
  console.log('✅ Sample quiz questions created');
}

async function printSummary() {
  console.log('\n📊 DATABASE SUMMARY:');
  console.log('='.repeat(50));
  
  const skillsCount = await prisma.skill.count();
  const categoriesCount = await prisma.category.count();
  const assessmentCriteriaCount = await prisma.assessmentCriteria.count();
  const quizQuestionsCount = await prisma.quizQuestion.count();
  
  console.log(`Total Skills: ${skillsCount}`);
  console.log(`Total Categories: ${categoriesCount}`);
  console.log(`Total Assessment Criteria: ${assessmentCriteriaCount}`);
  console.log(`Total Quiz Questions: ${quizQuestionsCount}`);
  
  // Show skills per category
  const categories = await prisma.category.findMany({
    include: {
      skills: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
  
  console.log('\nSkills per Category:');
  categories.forEach(cat => {
    console.log(`- ${cat.name}: ${cat.skills.length} skills`);
  });
}

async function main() {
  try {
    console.log('🚀 Starting database seeding with 62 real paramedic skills...');
    
    await clearExistingSkills();
    await ensureCategories();
    await createSkills();
    await createSampleQuizQuestions();
    await printSummary();
    
    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

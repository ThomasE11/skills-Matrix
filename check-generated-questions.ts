
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkGeneratedQuestions() {
  try {
    console.log('🔍 Checking newly generated skill-specific questions...\n');
    
    // Get skills with their questions
    const skillsWithQuestions = await prisma.skill.findMany({
      where: {
        quizQuestions: {
          some: {}
        }
      },
      include: {
        quizQuestions: true
      },
      take: 10
    });
    
    console.log(`📊 Found ${skillsWithQuestions.length} skills with questions\n`);
    
    for (const skill of skillsWithQuestions) {
      // Get category info
      const category = await prisma.category.findUnique({
        where: { id: skill.categoryId }
      });
      
      console.log(`🎯 SKILL: ${skill.name} (${category?.name || 'Unknown'})`);
      console.log(`   Difficulty: ${skill.difficultyLevel}`);
      console.log(`   Questions: ${skill.quizQuestions.length}\n`);
      
      skill.quizQuestions.forEach((question, index) => {
        console.log(`   📝 Question ${index + 1}:`);
        console.log(`   ${question.question}\n`);
        
        question.options.forEach((option, optIndex) => {
          const marker = optIndex === question.correctAnswer ? '✅' : '  ';
          console.log(`   ${marker} ${String.fromCharCode(65 + optIndex)}. ${option}`);
        });
        
        console.log(`\n   💡 Explanation: ${question.explanation}\n`);
        console.log('   ' + '-'.repeat(80) + '\n');
      });
      
      console.log('=' .repeat(100) + '\n');
    }
    
    // Summary statistics
    const totalQuestions = await prisma.quizQuestion.count();
    const questionsByDifficulty = await prisma.quizQuestion.groupBy({
      by: ['difficulty'],
      _count: {
        id: true
      }
    });
    
    console.log('📈 SUMMARY STATISTICS:');
    console.log(`Total questions in database: ${totalQuestions}`);
    console.log('Questions by difficulty:');
    questionsByDifficulty.forEach(group => {
      console.log(`  ${group.difficulty}: ${group._count.id}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking questions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGeneratedQuestions();

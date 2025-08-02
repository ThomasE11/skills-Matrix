
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkQuizQuestions() {
  try {
    // Check total quiz questions
    const totalQuestions = await prisma.quizQuestion.count();
    console.log(`Total quiz questions in database: ${totalQuestions}`);

    if (totalQuestions > 0) {
      // Get questions by skill
      const questionsBySkill = await prisma.quizQuestion.groupBy({
        by: ['skillId'],
        _count: {
          id: true,
        },
        orderBy: {
          skillId: 'asc',
        },
      });

      console.log('\nQuestions per skill:');
      for (const group of questionsBySkill) {
        const skill = await prisma.skill.findUnique({
          where: { id: group.skillId },
          select: { name: true },
        });
        console.log(`Skill ${group.skillId} (${skill?.name || 'Unknown'}): ${group._count.id} questions`);
      }

      // Show a sample question
      const sampleQuestion = await prisma.quizQuestion.findFirst({
        include: {
          skill: {
            select: { name: true },
          },
        },
      });

      if (sampleQuestion) {
        console.log('\nSample question:');
        console.log(`Skill: ${sampleQuestion.skill.name}`);
        console.log(`Question: ${sampleQuestion.question}`);
        console.log(`Options: ${JSON.stringify(sampleQuestion.options)}`);
        console.log(`Correct Answer: ${sampleQuestion.correctAnswer}`);
        console.log(`Explanation: ${sampleQuestion.explanation}`);
      }
    } else {
      console.log('No quiz questions found in the database.');
    }

    // Check quiz attempts
    const totalAttempts = await prisma.quizAttempt.count();
    console.log(`\nTotal quiz attempts recorded: ${totalAttempts}`);

  } catch (error) {
    console.error('Error checking quiz questions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkQuizQuestions();


import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface SkillQuizSet {
  skillName: string;
  questions: QuizQuestion[];
}

async function generateSkillSpecificQuestions(skill: any): Promise<QuizQuestion[] | null> {
  // Create a detailed prompt based on the skill's actual steps
  const stepsContent = skill.steps.map((step: any, index: number) => 
    `Step ${index + 1}: ${step.title}\n${step.description}\nKey Points: ${step.keyPoints.join(', ')}`
  ).join('\n\n');

  const prompt = `You are a medical education expert creating quiz questions for paramedic training. 

SKILL: ${skill.name}
CATEGORY: ${skill.category?.name || 'Medical Procedure'}
DIFFICULTY: ${skill.difficulty}
CRITICAL SKILL: ${skill.isCritical ? 'Yes' : 'No'}

ACTUAL PROCEDURE STEPS:
${stepsContent}

Create 3-5 high-quality, skill-specific quiz questions that test understanding of this EXACT procedure. Questions should:

1. Test specific knowledge from the actual steps provided
2. Include technical details and critical decision points
3. Test safety considerations and proper sequence
4. Include common mistakes or contraindications
5. Be challenging but fair for paramedic students

Return as JSON with this structure:
{
  "questions": [
    {
      "question": "Specific question about the procedure steps",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation why this answer is correct and others are wrong"
    }
  ]
}

Make questions specific to the steps provided - not generic medical questions. Focus on the actual procedure details, sequence, and critical points.

Respond with raw JSON only. Do not include code blocks, markdown, or any other formatting.`;

  try {
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 2000,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      console.error(`LLM API error for ${skill.name}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      console.error(`No content received for ${skill.name}`);
      return null;
    }

    const result = JSON.parse(content);
    return result.questions || [];
    
  } catch (error) {
    console.error(`Error generating questions for ${skill.name}:`, error);
    return null;
  }
}

async function generateComprehensiveQuizQuestions() {
  console.log('🧠 GENERATING COMPREHENSIVE SKILL-SPECIFIC QUIZ QUESTIONS');
  console.log('='.repeat(80));

  try {
    // Get all skills that have steps but may need better quiz questions
    const skillsWithSteps = await prisma.skill.findMany({
      where: {
        steps: {
          some: {}
        }
      },
      include: {
        steps: true,
        category: true,
        quizQuestions: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`🎯 Found ${skillsWithSteps.length} skills with steps`);
    console.log(`📝 Generating skill-specific quiz questions...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < skillsWithSteps.length; i++) {
      const skill = skillsWithSteps[i];
      
      console.log(`[${i + 1}/${skillsWithSteps.length}] Processing: ${skill.name}`);
      console.log(`   Steps: ${skill.steps.length} | Current Questions: ${skill.quizQuestions.length}`);

      // Generate new questions
      const questions = await generateSkillSpecificQuestions(skill);
      
      if (!questions || questions.length === 0) {
        console.log(`❌ Failed to generate questions for ${skill.name}`);
        errorCount++;
        continue;
      }

      console.log(`✅ Generated ${questions.length} questions`);

      // Clear existing questions and add new ones
      await prisma.quizQuestion.deleteMany({
        where: { skillId: skill.id }
      });

      // Insert new questions
      for (const question of questions) {
        await prisma.quizQuestion.create({
          data: {
            skillId: skill.id,
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation
          }
        });
      }

      console.log(`💾 Saved ${questions.length} questions to database`);
      successCount++;

      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎯 QUIZ GENERATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Successfully processed: ${successCount} skills`);
    console.log(`❌ Failed to process: ${errorCount} skills`);
    
    // Verify final quiz coverage
    const finalQuizCount = await prisma.quizQuestion.count();
    console.log(`📊 Total quiz questions in database: ${finalQuizCount}`);

    const skillsWithQuestions = await prisma.skill.count({
      where: {
        quizQuestions: {
          some: {}
        }
      }
    });

    console.log(`🧠 Skills with quiz questions: ${skillsWithQuestions}`);
    console.log(`📈 Quiz coverage: ${((skillsWithQuestions / skillsWithSteps.length) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Fatal error during quiz generation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateComprehensiveQuizQuestions();

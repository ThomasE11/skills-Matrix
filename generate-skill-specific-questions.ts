
import { PrismaClient } from '@prisma/client';
import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface SkillQuestionRequest {
  skillId: number;
  skillName: string;
  category: string;
  difficulty: string;
  objectives: string[];
  indications: string[];
  contraindications: string[];
  equipment: any[];
  commonErrors: string[];
  steps: any[];
  documentContent: string;
}

interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

async function extractDocumentContent(skillName: string): Promise<string> {
  try {
    const documentsDir = path.join(__dirname, '../data/skill_documents');
    const files = fs.readdirSync(documentsDir);
    
    // Find matching document
    const matchingFile = files.find(file => 
      file.toLowerCase().includes(skillName.toLowerCase().substring(0, 15)) ||
      skillName.toLowerCase().includes(file.toLowerCase().substring(0, 15))
    );
    
    if (!matchingFile) {
      console.log(`📄 No document found for skill: ${skillName}`);
      return '';
    }
    
    const filePath = path.join(documentsDir, matchingFile);
    console.log(`📖 Reading document: ${matchingFile}`);
    
    const buffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
    
  } catch (error) {
    console.error(`❌ Error reading document for ${skillName}:`, error);
    return '';
  }
}

async function generateSkillSpecificQuestions(skillData: SkillQuestionRequest): Promise<GeneratedQuestion[]> {
  try {
    const prompt = `You are a medical education expert creating quiz questions for paramedic skills training. Generate 3 high-quality, skill-specific multiple-choice questions for the following paramedic skill.

SKILL: ${skillData.skillName}
CATEGORY: ${skillData.category}
DIFFICULTY: ${skillData.difficulty}

OBJECTIVES:
${skillData.objectives.map(obj => `- ${obj}`).join('\n')}

INDICATIONS:
${skillData.indications.map(ind => `- ${ind}`).join('\n')}

CONTRAINDICATIONS:
${skillData.contraindications.map(contra => `- ${contra}`).join('\n')}

COMMON ERRORS:
${skillData.commonErrors.map(error => `- ${error}`).join('\n')}

DETAILED SKILL STEPS:
${skillData.steps.map(step => `${step.step_number}. ${step.title}: ${step.description}`).join('\n')}

DOCUMENT CONTENT (Key Procedures and Guidelines):
${skillData.documentContent.substring(0, 2000)}

Requirements:
1. Create questions that test actual knowledge of this specific skill, not generic medical concepts
2. Focus on: indications, contraindications, specific techniques, anatomical landmarks, equipment, complications, critical steps
3. Make options challenging but fair - avoid obviously wrong answers
4. Ensure medical accuracy based on the provided content
5. Vary question types: indications, technique, troubleshooting, complications, equipment

Please respond in JSON format with exactly this structure:
{
  "questions": [
    {
      "question": "Specific question about the skill",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Clear medical explanation",
      "difficulty": "BEGINNER"
    }
  ]
}

Respond with raw JSON only. Do not include code blocks, markdown, or any other formatting.`;

    console.log(`🤖 Generating questions for: ${skillData.skillName}`);
    
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 4000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from API');
    }

    const parsedResponse = JSON.parse(content);
    return parsedResponse.questions || [];
    
  } catch (error) {
    console.error(`❌ Error generating questions for ${skillData.skillName}:`, error);
    return [];
  }
}

async function updateSkillQuestions(skillId: number, questions: GeneratedQuestion[]) {
  try {
    // Delete existing questions for this skill
    await prisma.quizQuestion.deleteMany({
      where: { skillId }
    });
    
    // Insert new questions
    for (const question of questions) {
      await prisma.quizQuestion.create({
        data: {
          skillId,
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          difficulty: question.difficulty
        }
      });
    }
    
    console.log(`✅ Updated ${questions.length} questions for skill ID: ${skillId}`);
    
  } catch (error) {
    console.error(`❌ Error updating questions for skill ID ${skillId}:`, error);
  }
}

async function main() {
  try {
    console.log('🚀 Starting skill-specific question generation...');
    
    // Get all skills with their details
    const skills = await prisma.skill.findMany({
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' }
        }
      }
    });
    
    console.log(`📚 Found ${skills.length} skills to process`);
    
    let processedCount = 0;
    let successCount = 0;
    
    for (const skill of skills) {
      try {
        console.log(`\n🔄 Processing skill ${processedCount + 1}/${skills.length}: ${skill.name}`);
        
        // Extract document content
        const documentContent = await extractDocumentContent(skill.name);
        
        // Get category info
        const category = await prisma.category.findUnique({
          where: { id: skill.categoryId }
        });

        // Prepare skill data for question generation
        const skillData: SkillQuestionRequest = {
          skillId: skill.id,
          skillName: skill.name,
          category: category?.name || 'Unknown',
          difficulty: skill.difficultyLevel,
          objectives: skill.objectives,
          indications: skill.indications,
          contraindications: skill.contraindications,
          equipment: Array.isArray(skill.equipment) ? skill.equipment : [],
          commonErrors: skill.commonErrors,
          steps: skill.steps,
          documentContent
        };
        
        // Generate questions using LLM
        const questions = await generateSkillSpecificQuestions(skillData);
        
        if (questions.length > 0) {
          // Update database with new questions
          await updateSkillQuestions(skill.id, questions);
          successCount++;
          console.log(`✅ Successfully processed: ${skill.name}`);
        } else {
          console.log(`⚠️ No questions generated for: ${skill.name}`);
        }
        
        processedCount++;
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error processing skill "${skill.name}":`, error);
        processedCount++;
      }
    }
    
    console.log('\n📊 GENERATION SUMMARY:');
    console.log('='.repeat(50));
    console.log(`Total skills processed: ${processedCount}`);
    console.log(`Successfully updated: ${successCount}`);
    console.log(`Failed: ${processedCount - successCount}`);
    
    // Show final database state
    const totalQuestions = await prisma.quizQuestion.count();
    console.log(`Total questions in database: ${totalQuestions}`);
    
    console.log('🎉 Question generation completed!');
    
  } catch (error) {
    console.error('❌ Fatal error during question generation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

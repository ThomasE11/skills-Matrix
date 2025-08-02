import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import mammoth from 'mammoth';

const prisma = new PrismaClient();

interface ExtractedStep {
  stepNumber: number;
  title: string;
  description: string;
  keyPoints: string[];
  isCritical: boolean;
  timeEstimate: number;
}

interface StepExtractionResult {
  skillName: string;
  steps: ExtractedStep[];
}

async function extractTextFromDocx(filePath: string): Promise<string> {
  try {
    const buffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error(`Error extracting text from ${filePath}:`, error);
    return '';
  }
}

async function extractStepsFromContent(content: string, fileName: string): Promise<StepExtractionResult | null> {
  const prompt = `You are a medical education expert. Extract step-by-step procedures from this paramedic skill document.

Document: "${fileName}"
Content: "${content}"

Please extract the step-by-step procedure and return it as a JSON object with this exact structure:
{
  "skillName": "Clean, clear skill name",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Brief step title (max 50 characters)",
      "description": "Detailed step description with clear instructions",
      "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
      "isCritical": true,
      "timeEstimate": 30
    }
  ]
}

Rules:
1. Extract 5-15 logical, sequential steps
2. Each step should be actionable and clear
3. Include 2-5 key points per step highlighting critical aspects
4. Mark steps as critical if they're safety-critical or essential for success
5. Estimate time in seconds for each step (realistic timing)
6. Use clear, professional medical language
7. Focus on practical procedure steps, not just theory
8. Ensure steps are in logical chronological order

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
        max_tokens: 4000,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      console.error(`LLM API error for ${fileName}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const content_result = data.choices[0]?.message?.content;
    
    if (!content_result) {
      console.error(`No content received for ${fileName}`);
      return null;
    }

    return JSON.parse(content_result);
  } catch (error) {
    console.error(`Error processing ${fileName}:`, error);
    return null;
  }
}

function findBestSkillMatch(skillName: string, availableSkills: any[]): any | null {
  // Normalize names for matching
  const normalize = (str: string) => str.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const normalizedSkillName = normalize(skillName);

  // Try exact match first
  let match = availableSkills.find(skill => 
    normalize(skill.name) === normalizedSkillName
  );

  if (match) return match;

  // Try partial matches
  match = availableSkills.find(skill => {
    const normalizedDbName = normalize(skill.name);
    return normalizedDbName.includes(normalizedSkillName) || 
           normalizedSkillName.includes(normalizedDbName);
  });

  if (match) return match;

  // Try key word matching
  const skillWords = normalizedSkillName.split(' ').filter(word => word.length > 3);
  match = availableSkills.find(skill => {
    const dbWords = normalize(skill.name).split(' ');
    return skillWords.some(word => dbWords.some(dbWord => 
      dbWord.includes(word) || word.includes(dbWord)
    ));
  });

  return match;
}

async function extractAllSkillSteps() {
  console.log('🚀 Starting comprehensive skill step extraction...\n');

  try {
    // Get all skills from database
    const skills = await prisma.skill.findMany({
      include: {
        steps: true,
        category: true
      }
    });

    console.log(`📊 Found ${skills.length} skills in database`);

    // Get all available documents
    const documentsPath = path.join(process.cwd(), 'data', 'skill_documents');
    const documentFiles = fs.readdirSync(documentsPath)
      .filter(file => file.endsWith('.docx'))
      .sort();

    console.log(`📁 Found ${documentFiles.length} Word documents\n`);

    let successCount = 0;
    let errorCount = 0;
    const processedSkills = new Set<number>();

    // Process each document
    for (let i = 0; i < documentFiles.length; i++) {
      const fileName = documentFiles[i];
      const filePath = path.join(documentsPath, fileName);
      
      console.log(`\n[${i + 1}/${documentFiles.length}] Processing: ${fileName}`);
      
      // Extract text from document
      const content = await extractTextFromDocx(filePath);
      
      if (!content || content.length < 100) {
        console.log(`⚠️  Skipping ${fileName} - insufficient content`);
        errorCount++;
        continue;
      }

      console.log(`📄 Extracted ${content.length} characters`);

      // Extract steps using LLM
      const result = await extractStepsFromContent(content, fileName);
      
      if (!result) {
        console.log(`❌ Failed to extract steps from ${fileName}`);
        errorCount++;
        continue;
      }

      console.log(`✅ Extracted ${result.steps.length} steps for: ${result.skillName}`);

      // Find matching skill in database
      const matchedSkill = findBestSkillMatch(result.skillName, skills);
      
      if (!matchedSkill) {
        console.log(`⚠️  No matching skill found for: ${result.skillName}`);
        errorCount++;
        continue;
      }

      if (processedSkills.has(matchedSkill.id)) {
        console.log(`⚠️  Skill ${matchedSkill.name} already processed, skipping`);
        continue;
      }

      console.log(`🎯 Matched to skill: ${matchedSkill.name}`);

      // Delete existing steps if any
      await prisma.skillStep.deleteMany({
        where: { skillId: matchedSkill.id }
      });

      // Insert new steps
      for (const step of result.steps) {
        await prisma.skillStep.create({
          data: {
            skillId: matchedSkill.id,
            stepNumber: step.stepNumber,
            title: step.title.substring(0, 255), // Ensure it fits in DB
            description: step.description,
            keyPoints: step.keyPoints,
            isCritical: step.isCritical,
            timeEstimate: step.timeEstimate
          }
        });
      }

      processedSkills.add(matchedSkill.id);
      successCount++;
      
      console.log(`💾 Successfully saved ${result.steps.length} steps to database`);
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n' + '='.repeat(80));
    console.log('📈 EXTRACTION SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Successfully processed: ${successCount} skills`);
    console.log(`❌ Failed to process: ${errorCount} documents`);
    console.log(`🎯 Skills with steps: ${processedSkills.size}`);
    console.log(`📋 Remaining skills without steps: ${skills.length - processedSkills.size}`);

    // Show skills that still need steps
    const skillsWithoutSteps = skills.filter(skill => !processedSkills.has(skill.id));
    if (skillsWithoutSteps.length > 0) {
      console.log('\n⚠️  Skills still needing step extraction:');
      skillsWithoutSteps.forEach((skill, index) => {
        console.log(`${index + 1}. ${skill.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Fatal error during extraction:', error);
  } finally {
    await prisma.$disconnect();
  }
}

extractAllSkillSteps();

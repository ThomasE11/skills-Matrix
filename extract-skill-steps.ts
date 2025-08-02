
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SkillStep {
  stepNumber: number;
  title: string;
  description: string;
  keyPoints: string[];
  isCritical: boolean;
  timeEstimate: number;
}

interface ExtractedSkillData {
  skillName: string;
  steps: SkillStep[];
}

async function extractTextFromDocx(filePath: string): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error(`Error extracting text from ${filePath}:`, error);
    return '';
  }
}

async function extractStepsFromContent(skillName: string, content: string): Promise<SkillStep[]> {
  const prompt = `
You are an expert at extracting step-by-step procedures from medical/paramedic skill documents. 

Extract detailed, checkable steps from the following paramedic skill document for "${skillName}". 

Each step should be:
1. A clear, actionable instruction that can be checked off
2. Specific enough to be performed as a single action
3. Ordered sequentially for the procedure

Extract the steps in the following JSON format:
{
  "steps": [
    {
      "stepNumber": 1,
      "title": "Clear, concise step title",
      "description": "Detailed description of what to do",
      "keyPoints": ["Key safety point", "Important technique detail"],
      "isCritical": true/false,
      "timeEstimate": 30
    }
  ]
}

Guidelines:
- Break complex procedures into individual, checkable steps
- Include preparation, execution, and completion steps
- Mark safety-critical steps as "isCritical": true
- Estimate time in seconds for each step
- Extract key points that highlight important details or safety considerations
- Focus on actionable procedures, not just theory

Document content:
${content}

Respond with clean JSON only. Do not include code blocks, markdown, or any other formatting.
`;

  try {
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
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const extractedData = JSON.parse(data.choices[0].message.content);
    
    return extractedData.steps || [];
  } catch (error) {
    console.error(`Error extracting steps for ${skillName}:`, error);
    return [];
  }
}

async function findSkillByName(skillName: string): Promise<number | null> {
  try {
    // Clean the skill name for better matching
    const cleanSkillName = skillName
      .replace(/\.docx$/, '')
      .replace(/[тАУ]/g, '-')
      .replace(/[^\w\s-]/g, '')
      .trim();

    // Try exact match first
    let skill = await prisma.skill.findFirst({
      where: {
        name: {
          contains: cleanSkillName,
          mode: 'insensitive'
        }
      }
    });

    // If not found, try partial matching
    if (!skill) {
      const words = cleanSkillName.split(/\s+/);
      const searchTerms = words.filter(word => word.length > 3);
      
      for (const term of searchTerms) {
        skill = await prisma.skill.findFirst({
          where: {
            name: {
              contains: term,
              mode: 'insensitive'
            }
          }
        });
        if (skill) break;
      }
    }

    return skill?.id || null;
  } catch (error) {
    console.error(`Error finding skill by name ${skillName}:`, error);
    return null;
  }
}

async function saveStepsToDatabase(skillId: number, steps: SkillStep[]): Promise<void> {
  try {
    // First, delete existing steps for this skill
    await prisma.skillStep.deleteMany({
      where: { skillId }
    });

    // Insert new steps
    for (const step of steps) {
      await prisma.skillStep.create({
        data: {
          skillId,
          stepNumber: step.stepNumber,
          title: step.title,
          description: step.description,
          keyPoints: step.keyPoints,
          isCritical: step.isCritical,
          timeEstimate: step.timeEstimate
        }
      });
    }

    console.log(`✓ Saved ${steps.length} steps for skill ID ${skillId}`);
  } catch (error) {
    console.error(`Error saving steps for skill ID ${skillId}:`, error);
  }
}

async function processAllSkillDocuments(): Promise<void> {
  const documentsDir = path.join(__dirname, '..', 'data', 'skill_documents');
  
  try {
    const files = fs.readdirSync(documentsDir);
    const docxFiles = files.filter(file => file.endsWith('.docx'));
    
    console.log(`Found ${docxFiles.length} DOCX files to process`);
    
    for (let i = 0; i < docxFiles.length; i++) {
      const file = docxFiles[i];
      const filePath = path.join(documentsDir, file);
      
      console.log(`\n[${i + 1}/${docxFiles.length}] Processing: ${file}`);
      
      // Extract skill name from filename
      const skillName = file.replace('.docx', '');
      
      // Find corresponding skill in database
      const skillId = await findSkillByName(skillName);
      
      if (!skillId) {
        console.log(`⚠️  No matching skill found for: ${skillName}`);
        continue;
      }
      
      // Extract text content from DOCX
      console.log(`📄 Extracting text from: ${file}`);
      const content = await extractTextFromDocx(filePath);
      
      if (!content.trim()) {
        console.log(`⚠️  No content extracted from: ${file}`);
        continue;
      }
      
      // Extract steps using LLM API
      console.log(`🤖 Extracting steps using LLM API...`);
      const steps = await extractStepsFromContent(skillName, content);
      
      if (steps.length === 0) {
        console.log(`⚠️  No steps extracted for: ${skillName}`);
        continue;
      }
      
      // Save steps to database
      await saveStepsToDatabase(skillId, steps);
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n✅ Processing complete!');
    
  } catch (error) {
    console.error('Error processing skill documents:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting skill step extraction process...');
  await processAllSkillDocuments();
}

main().catch(console.error);

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import mammoth from 'mammoth';

const prisma = new PrismaClient();

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

async function extractStepsFromContent(content: string, fileName: string): Promise<any> {
  const prompt = `Extract step-by-step procedure from this paramedic skill document.

Document: "${fileName}"
Content: "${content.substring(0, 3000)}"

Return JSON:
{
  "skillName": "Clean skill name",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Step title",
      "description": "Detailed description",
      "keyPoints": ["Point 1", "Point 2"],
      "isCritical": true,
      "timeEstimate": 30
    }
  ]
}

Extract 5-12 logical steps with clear titles and descriptions.`;

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
        max_tokens: 3000,
        temperature: 0.1
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0]?.message?.content || '{}');
  } catch (error) {
    console.error(`Error processing ${fileName}:`, error);
    return null;
  }
}

async function findSkillMatch(skillName: string): Promise<any> {
  const skills = await prisma.skill.findMany({
    include: { steps: true }
  });

  const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const normalizedSkillName = normalize(skillName);

  return skills.find(skill => {
    if (skill.steps.length > 0) return false; // Skip if already has steps
    const normalizedDbName = normalize(skill.name);
    return normalizedDbName.includes(normalizedSkillName) || normalizedSkillName.includes(normalizedDbName);
  });
}

async function processBatch() {
  const documentsPath = path.join(process.cwd(), 'data', 'skill_documents');
  const documentFiles = fs.readdirSync(documentsPath).filter(file => file.endsWith('.docx')).slice(6, 11); // Process 5 documents

  console.log(`Processing ${documentFiles.length} documents in this batch...`);

  for (const fileName of documentFiles) {
    console.log(`\nProcessing: ${fileName}`);
    
    const filePath = path.join(documentsPath, fileName);
    const content = await extractTextFromDocx(filePath);
    
    if (content.length < 100) continue;

    const result = await extractStepsFromContent(content, fileName);
    if (!result?.steps) continue;

    const skill = await findSkillMatch(result.skillName);
    if (!skill) continue;

    console.log(`Matched to: ${skill.name}`);

    for (const step of result.steps) {
      await prisma.skillStep.create({
        data: {
          skillId: skill.id,
          stepNumber: step.stepNumber,
          title: step.title.substring(0, 255),
          description: step.description,
          keyPoints: step.keyPoints || [],
          isCritical: step.isCritical || false,
          timeEstimate: step.timeEstimate || 30
        }
      });
    }

    console.log(`✅ Saved ${result.steps.length} steps`);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await prisma.$disconnect();
}

processBatch();

// Comprehensive paramedic skills with detailed steps from official skill documents
// Extracted from individual skill sheet .docx files in skills_documents directory

import extractedSkills from '@/data/extracted_paramedic_skills.json';
import extractedSkillSteps from '@/data/extracted_skill_steps.json';

export interface SkillStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  isRequired: boolean;
  keyPoints?: string[];
  timeEstimate?: number;
  isCritical?: boolean;
}

export interface AssessmentCriterion {
  id: string;
  skillId: string;
  criterion: string;
  maxPoints: number;
  isRequired: boolean;
}

export interface Category {
  id: string;
  name: string;
  colorCode: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  isActive: boolean;
  minimumRequirement: number;
  timeEstimateMinutes: number;
  difficultyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  createdAt: string;
  updatedAt: string;
  category: Category;
  steps: SkillStep[];
  assessmentCriteria: AssessmentCriterion[];
  equipment?: string[];
  isCritical?: boolean;
  objectives?: string[];
  indications?: string[];
  contraindications?: string[];
  commonErrors?: string[];
}

// Enhanced category mapping based on paramedic training standards
const categories: { [key: string]: Category } = {
  'bls': {
    id: 'bls',
    name: 'Basic Life Support (BLS)',
    colorCode: '#3B82F6',
  },
  'als': {
    id: 'als',
    name: 'Advanced Life Support (ALS)',
    colorCode: '#EF4444',
  },
  'pediatric': {
    id: 'pediatric',
    name: 'Pediatric Care',
    colorCode: '#10B981',
  },
  'obstetric': {
    id: 'obstetric',
    name: 'Obstetric Care',
    colorCode: '#F59E0B',
  },
  'trauma': {
    id: 'trauma',
    name: 'Trauma Management',
    colorCode: '#8B5CF6',
  },
  'medical': {
    id: 'medical',
    name: 'Medical Procedures',
    colorCode: '#06B6D4',
  },
  'airway': {
    id: 'airway',
    name: 'Airway Management',
    colorCode: '#EC4899',
  },
  'assessment': {
    id: 'assessment',
    name: 'Patient Assessment',
    colorCode: '#84CC16',
  },
  'pharmacology': {
    id: 'pharmacology',
    name: 'Pharmacology',
    colorCode: '#F97316',
  },
  'cardiac': {
    id: 'cardiac',
    name: 'Cardiac Care',
    colorCode: '#DC2626',
  }
};

// Advanced skill categorization function
function mapSkillToCategory(skillName: string): string {
  const name = skillName.toLowerCase();
  
  // BLS Skills
  if (name.includes('cpr') || name.includes('choking') || name.includes('recovery') || 
      name.includes('hand wash') || name.includes('bleeding control') || name.includes('shock')) {
    return 'bls';
  }
  
  // Pediatric/Neonatal Skills
  if (name.includes('pediatric') || name.includes('infant') || name.includes('paediatric') || 
      name.includes('neonatal') || name.includes('child')) {
    return 'pediatric';
  }
  
  // Obstetric Skills
  if (name.includes('childbirth') || name.includes('delivery') || name.includes('umbilical') || 
      name.includes('prolapsed') || name.includes('vaginal') || name.includes('cord')) {
    return 'obstetric';
  }
  
  // Airway Management Skills
  if (name.includes('airway') || name.includes('intubation') || name.includes('ventilation') || 
      name.includes('suction') || name.includes('laryngeal') || name.includes('endotracheal') || 
      name.includes('bag valve') || name.includes('cpap') || name.includes('cricothyroidotomy') ||
      name.includes('oropharyngeal') || name.includes('nasopharyngeal') || name.includes('supraglottic')) {
    return 'airway';
  }
  
  // Trauma Skills
  if (name.includes('fracture') || name.includes('splint') || name.includes('wound') || 
      name.includes('bandage') || name.includes('immobilization') || name.includes('traction') ||
      name.includes('spine') || name.includes('cervical')) {
    return 'trauma';
  }
  
  // Assessment Skills
  if (name.includes('ecg') || name.includes('hgt') || name.includes('vital') || 
      name.includes('handover') || name.includes('assessment') || name.includes('prediction') || 
      name.includes('etco2') || name.includes('glucose') || name.includes('ashice')) {
    return 'assessment';
  }
  
  // Pharmacology Skills
  if (name.includes('drug') || name.includes('injection') || name.includes('medication') || 
      name.includes('nebulization') || name.includes('administration')) {
    return 'pharmacology';
  }
  
  // Cardiac Skills
  if (name.includes('cardioversion') || name.includes('pacing') || name.includes('carotid') || 
      name.includes('valsalva') || name.includes('defibrillator')) {
    return 'cardiac';
  }
  
  // ALS Skills (IV, IO, advanced procedures)
  if (name.includes('iv') || name.includes('intravenous') || name.includes('cannulation') || 
      name.includes('io') || name.includes('intraosseous') || name.includes('thoracentesis') ||
      name.includes('ventilator') || name.includes('jugular') || name.includes('femoral')) {
    return 'als';
  }
  
  // Medical Procedures (default for complex procedures)
  if (name.includes('oxygen') || name.includes('cylinder') || name.includes('tube insertion') ||
      name.includes('obstruction') || name.includes('phonetic') || name.includes('alphabet')) {
    return 'medical';
  }
  
  return 'medical'; // default category
}

// Enhanced difficulty mapping
function mapDifficultyLevel(level: string, skillName: string): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' {
  if (level) {
    switch (level.toUpperCase()) {
      case 'BEGINNER':
        return 'BEGINNER';
      case 'INTERMEDIATE':
        return 'INTERMEDIATE';
      case 'ADVANCED':
        return 'ADVANCED';
    }
  }
  
  // Infer difficulty from skill complexity
  const name = skillName.toLowerCase();
  
  // Advanced skills
  if (name.includes('intubation') || name.includes('cricothyroidotomy') || 
      name.includes('thoracentesis') || name.includes('cardioversion') ||
      name.includes('femoral') || name.includes('jugular') || name.includes('prediction')) {
    return 'ADVANCED';
  }
  
  // Beginner skills
  if (name.includes('hand wash') || name.includes('oxygen') || name.includes('vital') ||
      name.includes('recovery') || name.includes('bandage') || name.includes('phonetic')) {
    return 'BEGINNER';
  }
  
  return 'INTERMEDIATE'; // default
}

// Convert extracted skill steps to our format
function convertExtractedSteps(extractedSteps: any[], skillId: string): SkillStep[] {
  if (!extractedSteps || extractedSteps.length === 0) {
    return [];
  }
  
  return extractedSteps.map((step: any) => ({
    id: `${skillId}-step-${step.stepNumber}`,
    stepNumber: step.stepNumber,
    title: step.title || `Step ${step.stepNumber}`,
    description: step.description,
    isRequired: step.isCritical !== false,
    keyPoints: step.keyPoints || [],
    timeEstimate: step.timeEstimate || 60,
    isCritical: step.isCritical !== false,
  }));
}

// Enhanced assessment criteria creation
function createAssessmentCriteria(skill: any, skillId: string): AssessmentCriterion[] {
  const criteria: AssessmentCriterion[] = [];
  
  // Add criteria from objectives
  if (skill.objectives) {
    skill.objectives.slice(0, 3).forEach((objective: string, index: number) => {
      criteria.push({
        id: `${skillId}-criteria-${index + 1}`,
        skillId,
        criterion: objective.length > 60 ? objective.substring(0, 60) + '...' : objective,
        maxPoints: 10,
        isRequired: true,
      });
    });
  }

  // Add safety criteria
  criteria.push({
    id: `${skillId}-criteria-safety`,
    skillId,
    criterion: 'Safety awareness and infection control',
    maxPoints: 15,
    isRequired: true,
  });

  // Add technique criteria
  criteria.push({
    id: `${skillId}-criteria-technique`,
    skillId,
    criterion: 'Proper technique and procedure adherence',
    maxPoints: 15,
    isRequired: true,
  });

  return criteria;
}

// Remove duplicates based on skill name
function removeDuplicates(skills: any[]): any[] {
  const seen = new Set();
  return skills.filter(skill => {
    const name = skill.name.trim().toLowerCase();
    if (seen.has(name)) {
      return false;
    }
    seen.add(name);
    return true;
  });
}

// Find matching skill from extracted skill steps by name similarity
function findMatchingSkillSteps(skillName: string): any[] {
  const skillSteps = extractedSkillSteps.skillSteps as { [key: string]: any };
  
  // First try exact match
  if (skillSteps[skillName]) {
    return skillSteps[skillName].steps || [];
  }
  
  // Try case-insensitive match
  const skillNames = Object.keys(skillSteps);
  const exactMatch = skillNames.find(name => 
    name.toLowerCase() === skillName.toLowerCase()
  );
  
  if (exactMatch && skillSteps[exactMatch]) {
    return skillSteps[exactMatch].steps || [];
  }
  
  // Special case mappings for common mismatches
  const specialMappings: { [key: string]: string } = {
    'hgt': 'HAEMO-GLUCO-TEST (HGT)',
    'haemo-gluco-test': 'HAEMO-GLUCO-TEST (HGT)',
    'blood glucose': 'HAEMO-GLUCO-TEST (HGT)',
    'glucose test': 'HAEMO-GLUCO-TEST (HGT)',
  };
  
  const lowerSkillName = skillName.toLowerCase();
  const specialMatch = specialMappings[lowerSkillName];
  if (specialMatch && skillSteps[specialMatch]) {
    return skillSteps[specialMatch].steps || [];
  }
  
  // Try partial match with improved algorithm
  const partialMatch = skillNames.find(name => {
    const nameWords = name.toLowerCase().split(/[\s\-\(\)]+/).filter(w => w.length > 2);
    const skillWords = skillName.toLowerCase().split(/[\s\-\(\)]+/).filter(w => w.length > 2);
    
    // Check for abbreviation matches (like HGT)
    if (skillWords.some(word => word.length <= 3)) {
      const abbrevMatch = nameWords.some(nameWord => 
        skillWords.some(skillWord => 
          nameWord.includes(skillWord) || skillWord.includes(nameWord)
        )
      );
      if (abbrevMatch) return true;
    }
    
    // Check if at least 60% of meaningful words match
    const matchingWords = skillWords.filter(word => 
      nameWords.some(nameWord => 
        nameWord.includes(word) || word.includes(nameWord) ||
        (word.length > 3 && nameWord.length > 3 && 
         (word.substring(0, 4) === nameWord.substring(0, 4)))
      )
    );
    
    return matchingWords.length >= Math.ceil(skillWords.length * 0.6);
  });
  
  if (partialMatch && skillSteps[partialMatch]) {
    return skillSteps[partialMatch].steps || [];
  }
  
  return [];
}

// Process all skills data with extracted steps
const uniqueExtractedSkills = removeDuplicates(extractedSkills);

export const allProcessedSkills: Skill[] = uniqueExtractedSkills.map((extractedSkill, index) => {
  const skillId = `skill-${(index + 1).toString().padStart(3, '0')}`;
  const categoryId = mapSkillToCategory(extractedSkill.name);
  
  // Find matching steps from extracted skill documents
  const extractedSteps = findMatchingSkillSteps(extractedSkill.name);
  
  let steps: SkillStep[];
  if (extractedSteps.length > 0) {
    // Use extracted steps from skill documents
    steps = convertExtractedSteps(extractedSteps, skillId);
  } else {
    // Fallback to basic steps from objectives if no extracted steps found
    const basicSteps = extractedSkill.objectives || [
      'Prepare equipment and assess patient/situation',
      'Perform the skill according to protocol',
      'Verify successful completion and document'
    ];
    
    steps = basicSteps.map((objective: string, stepIndex: number) => ({
      id: `${skillId}-step-${stepIndex + 1}`,
      stepNumber: stepIndex + 1,
      title: `Step ${stepIndex + 1}`,
      description: objective,
      isRequired: true,
      timeEstimate: 60,
      isCritical: true,
    }));
  }

  const assessmentCriteria = createAssessmentCriteria(extractedSkill, skillId);

  return {
    id: skillId,
    name: extractedSkill.name,
    description: extractedSkill.description || `Complete ${extractedSkill.name} procedure according to protocol`,
    categoryId,
    isActive: true,
    minimumRequirement: steps.length > 10 ? 5 : 3,
    timeEstimateMinutes: steps.length * 2, // 2 minutes per step estimate
    difficultyLevel: mapDifficultyLevel(extractedSkill.difficulty_level, extractedSkill.name),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: categories[categoryId],
    steps,
    assessmentCriteria,
    equipment: extractedSkill.equipment?.map((eq: any) => typeof eq === 'string' ? eq : eq.item) || [],
    isCritical: extractedSkill.is_critical || false,
    objectives: extractedSkill.objectives || [],
    indications: extractedSkill.indications || [],
    contraindications: extractedSkill.contraindications || [],
    commonErrors: extractedSkill.common_errors || [],
  };
});

// Export all categories
export const skillCategories = Object.values(categories);

// Export skills by category
export function getSkillsByCategory(categoryId?: string): Skill[] {
  if (!categoryId) return allProcessedSkills;
  return allProcessedSkills.filter(skill => skill.categoryId === categoryId);
}

// Export skill by ID
export function getSkillById(skillId: string): Skill | undefined {
  return allProcessedSkills.find(skill => skill.id === skillId);
}

// Export skills count
export const totalSkillsCount = allProcessedSkills.length;

// Export categories with skill counts
export const categoriesWithCounts = skillCategories.map(category => ({
  ...category,
  skillCount: allProcessedSkills.filter(skill => skill.categoryId === category.id).length,
}));

// Calculate total steps across all skills
export const totalStepsCount = allProcessedSkills.reduce((total, skill) => total + skill.steps.length, 0);

console.log(`Loaded ${totalSkillsCount} unique skills with ${totalStepsCount} total steps from skill documents`);
console.log(`Skills with detailed steps: ${allProcessedSkills.filter(skill => skill.steps.length > 5).length}`);

export { allProcessedSkills as processedSkills };
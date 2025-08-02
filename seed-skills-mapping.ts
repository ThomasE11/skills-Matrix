import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Load the skills mapping data
const skillsMappingPath = path.join(process.cwd(), '..', '..', 'skills_mapping.json');
const skillsMapping = JSON.parse(fs.readFileSync(skillsMappingPath, 'utf8'));

// Default categories for skills
const skillCategories = {
  'Airway Management': {
    description: 'Skills related to airway management and breathing support',
    colorCode: '#3B82F6'
  },
  'Life Support': {
    description: 'Basic and advanced life support procedures',
    colorCode: '#EF4444'
  },
  'Vascular Access': {
    description: 'IV cannulation and vascular access procedures',
    colorCode: '#10B981'
  },
  'Trauma Care': {
    description: 'Trauma assessment and management skills',
    colorCode: '#F59E0B'
  },
  'Assessment': {
    description: 'Patient assessment and monitoring skills',
    colorCode: '#8B5CF6'
  },
  'Procedures': {
    description: 'General medical procedures and interventions',
    colorCode: '#06B6D4'
  },
  'Communication': {
    description: 'Communication and documentation skills',
    colorCode: '#84CC16'
  }
};

// Skill categorization mapping
const skillCategoryMapping: { [key: string]: string } = {
  // Airway Management
  'Basic Airway Maneuver': 'Airway Management',
  'Oropharyngeal Suctioning': 'Airway Management',
  'Bag Valve Mask (BVM) Ventilation': 'Airway Management',
  'OP Airway Insertion': 'Airway Management',
  'NP Airway Insertion': 'Airway Management',
  'Supraglottic Airway Insertion (LMA/iGEL)': 'Airway Management',
  'Suctioning – ETT or SGA': 'Airway Management',
  'Predicting Difficult BVM Ventilations': 'Airway Management',
  'Predicting Difficult Intubation': 'Airway Management',
  'Intubation – Adult': 'Airway Management',
  'Surgical Cricothyroidotomy (Front of Neck Access)': 'Airway Management',
  'CPAP': 'Airway Management',
  'Transport Ventilator': 'Airway Management',
  'Ventilator Alarm Troubleshooting': 'Airway Management',
  
  // Life Support
  'Choking – Adult': 'Life Support',
  'Basic Life Support with AED': 'Life Support',
  'Intermediate Life Support – Adult': 'Life Support',
  'Advanced Life Support Adult': 'Life Support',
  'Advanced Life Support Infant': 'Life Support',
  'Advanced Life Support Child': 'Life Support',
  'Recovery Position': 'Life Support',
  
  // Vascular Access
  'Intravenous Cannulation (IV)': 'Vascular Access',
  'External Jugular Vein Cannulation (EJVC)': 'Vascular Access',
  'Intraosseous Access': 'Vascular Access',
  
  // Trauma Care
  'Needle Thoracocentesis (Chest Decompression)': 'Trauma Care',
  'Cervical Spine Clearance': 'Trauma Care',
  'Traction Splint': 'Trauma Care',
  'Pelvic Binder Application': 'Trauma Care',
  'Bandage Application': 'Trauma Care',
  'Splinting a Fracture': 'Trauma Care',
  'Triangular Bandage Use': 'Trauma Care',
  'Exsanguinating Hemorrhage': 'Trauma Care',
  
  // Assessment
  'Baseline Observations': 'Assessment',
  'Hemoglucose Test (HGT)': 'Assessment',
  'EtCO2': 'Assessment',
  
  // Procedures
  'Nebulization': 'Procedures',
  'Drug Administration': 'Procedures',
  'Orogastric & Nasogastric tube insertion': 'Procedures',
  'Carotid Sinus Massage': 'Procedures',
  'Valsalva Maneuver': 'Procedures',
  'Synchronized Cardioversion': 'Procedures',
  'Transcutaneous Pacing': 'Procedures',
  'Handwashing': 'Procedures',
  
  // Communication
  'Pre-Alert (ASHICE)': 'Communication'
};

// Difficulty level mapping
const skillDifficultyMapping: { [key: string]: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' } = {
  // EMT-Basic skills - BEGINNER
  'Handwashing': 'BEGINNER',
  'Basic Airway Maneuver': 'BEGINNER',
  'Oropharyngeal Suctioning': 'BEGINNER',
  'Bag Valve Mask (BVM) Ventilation': 'BEGINNER',
  'OP Airway Insertion': 'BEGINNER',
  'NP Airway Insertion': 'BEGINNER',
  'Choking – Adult': 'BEGINNER',
  'Basic Life Support with AED': 'BEGINNER',
  'Recovery Position': 'BEGINNER',
  'Nebulization': 'BEGINNER',
  'Baseline Observations': 'BEGINNER',
  'Hemoglucose Test (HGT)': 'BEGINNER',
  'Pre-Alert (ASHICE)': 'BEGINNER',
  'Bandage Application': 'BEGINNER',
  'Splinting a Fracture': 'BEGINNER',
  'Triangular Bandage Use': 'BEGINNER',
  'Exsanguinating Hemorrhage': 'BEGINNER',
  
  // Paramedic skills - INTERMEDIATE
  'Supraglottic Airway Insertion (LMA/iGEL)': 'INTERMEDIATE',
  'Suctioning – ETT or SGA': 'INTERMEDIATE',
  'Intermediate Life Support – Adult': 'INTERMEDIATE',
  'Intravenous Cannulation (IV)': 'INTERMEDIATE',
  'Needle Thoracocentesis (Chest Decompression)': 'INTERMEDIATE',
  'Cervical Spine Clearance': 'INTERMEDIATE',
  'Traction Splint': 'INTERMEDIATE',
  'Pelvic Binder Application': 'INTERMEDIATE',
  'Drug Administration': 'INTERMEDIATE',
  
  // Advanced Paramedic skills - ADVANCED
  'Predicting Difficult BVM Ventilations': 'ADVANCED',
  'Predicting Difficult Intubation': 'ADVANCED',
  'Intubation – Adult': 'ADVANCED',
  'Orogastric & Nasogastric tube insertion': 'ADVANCED',
  'Surgical Cricothyroidotomy (Front of Neck Access)': 'ADVANCED',
  'External Jugular Vein Cannulation (EJVC)': 'ADVANCED',
  'Advanced Life Support Adult': 'ADVANCED',
  'Advanced Life Support Infant': 'ADVANCED',
  'Advanced Life Support Child': 'ADVANCED',
  'Intraosseous Access': 'ADVANCED',
  'Carotid Sinus Massage': 'ADVANCED',
  'Valsalva Maneuver': 'ADVANCED',
  'Synchronized Cardioversion': 'ADVANCED',
  'Transcutaneous Pacing': 'ADVANCED',
  'CPAP': 'ADVANCED',
  'EtCO2': 'ADVANCED',
  'Transport Ventilator': 'ADVANCED',
  'Ventilator Alarm Troubleshooting': 'ADVANCED'
};

// Estimated time mapping (in minutes)
const skillTimeMapping: { [key: string]: number } = {
  'Handwashing': 5,
  'Basic Airway Maneuver': 15,
  'Oropharyngeal Suctioning': 10,
  'Bag Valve Mask (BVM) Ventilation': 20,
  'OP Airway Insertion': 10,
  'NP Airway Insertion': 15,
  'Choking – Adult': 10,
  'Basic Life Support with AED': 30,
  'Recovery Position': 5,
  'Nebulization': 15,
  'Baseline Observations': 20,
  'Hemoglucose Test (HGT)': 10,
  'Pre-Alert (ASHICE)': 15,
  'Bandage Application': 20,
  'Splinting a Fracture': 25,
  'Triangular Bandage Use': 15,
  'Exsanguinating Hemorrhage': 20,
  'Supraglottic Airway Insertion (LMA/iGEL)': 25,
  'Suctioning – ETT or SGA': 15,
  'Intermediate Life Support – Adult': 45,
  'Intravenous Cannulation (IV)': 20,
  'Needle Thoracocentesis (Chest Decompression)': 15,
  'Cervical Spine Clearance': 30,
  'Traction Splint': 20,
  'Pelvic Binder Application': 15,
  'Drug Administration': 25,
  'Predicting Difficult BVM Ventilations': 30,
  'Predicting Difficult Intubation': 30,
  'Intubation – Adult': 45,
  'Orogastric & Nasogastric tube insertion': 20,
  'Surgical Cricothyroidotomy (Front of Neck Access)': 30,
  'External Jugular Vein Cannulation (EJVC)': 25,
  'Advanced Life Support Adult': 60,
  'Advanced Life Support Infant': 60,
  'Advanced Life Support Child': 60,
  'Intraosseous Access': 20,
  'Carotid Sinus Massage': 15,
  'Valsalva Maneuver': 10,
  'Synchronized Cardioversion': 30,
  'Transcutaneous Pacing': 25,
  'CPAP': 30,
  'EtCO2': 20,
  'Transport Ventilator': 45,
  'Ventilator Alarm Troubleshooting': 30
};

async function seedDatabase() {
  console.log('🌱 Starting database seeding with skills mapping...');

  try {
    // 1. Create categories
    console.log('📁 Creating skill categories...');
    const categoryMap = new Map<string, number>();
    
    for (const [categoryName, categoryData] of Object.entries(skillCategories)) {
      const category = await prisma.category.upsert({
        where: { name: categoryName },
        update: {
          description: categoryData.description,
          colorCode: categoryData.colorCode
        },
        create: {
          name: categoryName,
          description: categoryData.description,
          colorCode: categoryData.colorCode
        }
      });
      categoryMap.set(categoryName, category.id);
      console.log(`  ✅ Category: ${categoryName}`);
    }

    // 2. Create subjects
    console.log('📚 Creating subjects...');
    const subjectMap = new Map<string, number>();
    
    for (const subject of skillsMapping.subjects) {
      if (subject.codes) {
        // Handle multiple codes (Paramedic and Advanced Paramedic)
        for (const code of subject.codes) {
          const createdSubject = await prisma.subject.upsert({
            where: { code: code },
            update: {
              name: subject.description,
              level: subject.level,
              description: `${subject.level} - ${subject.description}`,
              isActive: true
            },
            create: {
              code: code,
              name: subject.description,
              level: subject.level,
              description: `${subject.level} - ${subject.description}`,
              isActive: true
            }
          });
          subjectMap.set(code, createdSubject.id);
          console.log(`  ✅ Subject: ${code} - ${subject.level}`);
        }
      } else {
        // Handle single code (EMT-Basic)
        const createdSubject = await prisma.subject.upsert({
          where: { code: subject.code },
          update: {
            name: subject.description,
            level: subject.level,
            description: `${subject.level} - ${subject.description}`,
            isActive: true
          },
          create: {
            code: subject.code,
            name: subject.description,
            level: subject.level,
            description: `${subject.level} - ${subject.description}`,
            isActive: true
          }
        });
        subjectMap.set(subject.code, createdSubject.id);
        console.log(`  ✅ Subject: ${subject.code} - ${subject.level}`);
      }
    }

    // 3. Create skills
    console.log('🎯 Creating skills...');
    const skillMap = new Map<string, number>();
    
    // Get all unique skills from the mapping
    const allSkills = new Set<string>();
    Object.values(skillsMapping.subject_skill_mapping).forEach((skills: any) => {
      skills.forEach((skill: string) => allSkills.add(skill));
    });

    for (const skillName of allSkills) {
      const categoryName = skillCategoryMapping[skillName] || 'Procedures';
      const categoryId = categoryMap.get(categoryName);
      const difficulty = skillDifficultyMapping[skillName] || 'INTERMEDIATE';
      const estimatedTime = skillTimeMapping[skillName] || 30;
      const isCritical = difficulty === 'ADVANCED' || skillName.includes('Life Support');

      if (!categoryId) {
        console.warn(`⚠️  Category not found for skill: ${skillName}`);
        continue;
      }

      const skill = await prisma.skill.create({
        data: {
          name: skillName,
          categoryId: categoryId,
          difficultyLevel: difficulty,
          description: `${skillName} - ${difficulty.toLowerCase()} level skill for paramedic training`,
          prerequisites: [],
          estimatedTimeMinutes: estimatedTime,
          isCritical: isCritical,
          objectives: [
            `Demonstrate competency in ${skillName}`,
            `Apply appropriate safety measures`,
            `Execute procedure according to protocol`
          ],
          indications: [`When ${skillName.toLowerCase()} is clinically indicated`],
          contraindications: [`When ${skillName.toLowerCase()} is contraindicated or inappropriate`],
          equipment: {},
          commonErrors: [
            'Inadequate preparation',
            'Poor technique execution',
            'Failure to follow safety protocols'
          ],
          documentationReqs: [
            'Procedure performed',
            'Patient response',
            'Any complications'
          ],
          minimumPracticeCount: difficulty === 'BEGINNER' ? 1 : difficulty === 'INTERMEDIATE' ? 2 : 3
        }
      });

      skillMap.set(skillName, skill.id);
      console.log(`  ✅ Skill: ${skillName} (${difficulty})`);
    }

    // 4. Create subject-skill relationships
    console.log('🔗 Creating subject-skill relationships...');
    
    for (const [subjectCode, skills] of Object.entries(skillsMapping.subject_skill_mapping)) {
      const subjectId = subjectMap.get(subjectCode);
      
      if (!subjectId) {
        console.warn(`⚠️  Subject not found: ${subjectCode}`);
        continue;
      }

      for (const skillName of skills as string[]) {
        const skillId = skillMap.get(skillName);
        
        if (!skillId) {
          console.warn(`⚠️  Skill not found: ${skillName}`);
          continue;
        }

        // Determine if skill is core based on level
        const isCore = true; // All mapped skills are considered core for their subjects

        await prisma.subjectSkill.upsert({
          where: {
            subjectId_skillId: {
              subjectId: subjectId,
              skillId: skillId
            }
          },
          update: {
            isCore: isCore
          },
          create: {
            subjectId: subjectId,
            skillId: skillId,
            isCore: isCore
          }
        });
      }
      
      console.log(`  ✅ Subject-Skills: ${subjectCode} (${(skills as string[]).length} skills)`);
    }

    // 5. Create skill steps for each skill (basic structure)
    console.log('📋 Creating basic skill steps...');
    
    for (const [skillName, skillId] of skillMap) {
      // Create basic steps for each skill
      const basicSteps = [
        {
          stepNumber: 1,
          title: 'Preparation and Safety',
          description: 'Gather equipment, ensure safety, and prepare patient',
          keyPoints: ['Check equipment', 'Ensure safety', 'Patient consent'],
          isCritical: true,
          timeEstimate: 5
        },
        {
          stepNumber: 2,
          title: 'Procedure Execution',
          description: `Perform ${skillName} according to protocol`,
          keyPoints: ['Follow protocol', 'Monitor patient', 'Maintain sterility'],
          isCritical: true,
          timeEstimate: 15
        },
        {
          stepNumber: 3,
          title: 'Post-Procedure Care',
          description: 'Complete procedure, document, and monitor patient',
          keyPoints: ['Document procedure', 'Monitor vital signs', 'Patient comfort'],
          isCritical: false,
          timeEstimate: 10
        }
      ];

      for (const step of basicSteps) {
        await prisma.skillStep.create({
          data: {
            skillId: skillId,
            stepNumber: step.stepNumber,
            title: step.title,
            description: step.description,
            keyPoints: step.keyPoints,
            isCritical: step.isCritical,
            timeEstimate: step.timeEstimate
          }
        });
      }
    }

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Summary:
    - Categories: ${skillCategories ? Object.keys(skillCategories).length : 0}
    - Subjects: ${skillsMapping.summary.total_subjects}
    - Skills: ${skillsMapping.summary.total_skills}
    - Subject-Skill mappings: ${Object.keys(skillsMapping.subject_skill_mapping).length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Auto-enrollment function for students
export async function autoEnrollStudentSkills(userId: string, subjectId: number) {
  try {
    // Get all skills for this subject
    const subjectSkills = await prisma.subjectSkill.findMany({
      where: { subjectId },
      include: { skill: true }
    });

    // Create student progress entries for each skill
    for (const subjectSkill of subjectSkills) {
      await prisma.studentProgress.upsert({
        where: {
          userId_skillId: {
            userId: userId,
            skillId: subjectSkill.skillId
          }
        },
        update: {
          // Don't overwrite existing progress
        },
        create: {
          userId: userId,
          skillId: subjectSkill.skillId,
          status: 'NOT_STARTED',
          totalAttempts: 0,
          completeAttempts: 0,
          incompleteAttempts: 0,
          completedSteps: [],
          totalTimeSpentMinutes: 0,
          completeTimeMinutes: 0,
          incompleteTimeMinutes: 0
        }
      });
    }

    console.log(`✅ Auto-enrolled student ${userId} in ${subjectSkills.length} skills for subject ${subjectId}`);
    return { success: true, skillsEnrolled: subjectSkills.length };
  } catch (error) {
    console.error('❌ Error auto-enrolling student skills:', error);
    throw error;
  }
}

// Run seeding if this script is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };
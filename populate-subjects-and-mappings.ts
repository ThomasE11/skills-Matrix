
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

// Subject definitions from PDF
const subjects = [
  {
    code: "HEM1103",
    name: "Emergency Medical Technician - Basic Level",
    level: "EMT-Basic",
    description: "Foundational emergency medical technician skills and procedures"
  },
  {
    code: "HEM2105",
    name: "Intermediate Paramedic Level (Airway Management)",
    level: "Paramedic",
    description: "Intermediate paramedic skills focusing on airway management techniques"
  },
  {
    code: "HEM2024",
    name: "Intermediate Paramedic Level (IV Access & Emergency Procedures)",
    level: "Paramedic",
    description: "Intermediate paramedic skills for IV access and emergency procedures"
  },
  {
    code: "HEM2033",
    name: "Intermediate Paramedic Level (Equipment & Drug Administration)",
    level: "Paramedic",
    description: "Intermediate paramedic skills for equipment use and drug administration"
  },
  {
    code: "HEM3006",
    name: "Advanced Paramedic Level (Advanced Airway Management)",
    level: "Advanced Paramedic",
    description: "Advanced airway management techniques and procedures"
  },
  {
    code: "HEM3106",
    name: "Advanced Paramedic Level (Advanced Life Support)",
    level: "Advanced Paramedic",
    description: "Advanced life support procedures for complex emergency situations"
  },
  {
    code: "HEM4106",
    name: "Advanced Paramedic Level (Advanced Cardiac & Respiratory Support)",
    level: "Advanced Paramedic",
    description: "Advanced cardiac and respiratory support techniques"
  }
]

async function populateSubjectsAndMappings() {
  try {
    console.log('🚀 Starting subject population and skill mapping...\n')

    // Read the mapping results
    const mappingResults = JSON.parse(
      fs.readFileSync('./data/improved-skill-mapping-results.json', 'utf8')
    )

    // Step 1: Create subjects
    console.log('📚 Creating subjects...')
    const createdSubjects = []
    
    for (const subject of subjects) {
      try {
        const createdSubject = await prisma.subject.upsert({
          where: { code: subject.code },
          update: {
            name: subject.name,
            level: subject.level,
            description: subject.description
          },
          create: {
            code: subject.code,
            name: subject.name,
            level: subject.level,
            description: subject.description
          }
        })
        createdSubjects.push(createdSubject)
        console.log(`  ✅ ${subject.code}: ${subject.name}`)
      } catch (error) {
        console.error(`  ❌ Error creating subject ${subject.code}:`, error)
      }
    }

    // Step 2: Create missing skill - "Pelvic Binder Application"
    console.log('\n🔧 Creating missing skill...')
    
    // First, get the Medical Emergencies category ID
    const medicalEmergenciesCategory = await prisma.category.findFirst({
      where: { name: { contains: "Medical" } }
    })
    
    if (!medicalEmergenciesCategory) {
      throw new Error('Medical Emergencies category not found')
    }

    // Check if skill already exists
    let pelvicBinderSkill = await prisma.skill.findFirst({
      where: { name: "Pelvic Binder Application" }
    })

    if (!pelvicBinderSkill) {
      pelvicBinderSkill = await prisma.skill.create({
        data: {
          name: "Pelvic Binder Application",
          categoryId: medicalEmergenciesCategory.id,
          difficultyLevel: "INTERMEDIATE",
          description: "Application of pelvic binder for suspected pelvic fractures to provide stabilization and reduce internal bleeding",
          prerequisites: ["Basic trauma assessment", "Patient positioning"],
          estimatedTimeMinutes: 15,
          isCritical: true,
          objectives: [
            "Recognize indications for pelvic binder application",
            "Apply pelvic binder correctly and efficiently",
            "Monitor patient response post-application"
          ],
          indications: [
            "Suspected pelvic fracture",
            "Mechanism suggesting pelvic injury",
            "Hemodynamic instability with pelvic tenderness"
          ],
          contraindications: [
            "Open pelvic fracture with exposed bowel",
            "Obvious hip dislocation"
          ],
          equipment: {
            "primary": ["Pelvic binder device", "Scissors"],
            "monitoring": ["Pulse oximeter", "Blood pressure cuff"],
            "safety": ["Gloves", "Eye protection"]
          },
          commonErrors: [
            "Incorrect placement level",
            "Insufficient tightening",
            "Delay in application"
          ],
          documentationReqs: [
            "Time of application",
            "Patient response",
            "Vital signs pre/post application"
          ]
        }
      })
      console.log(`  ✅ Created new skill: ${pelvicBinderSkill.name} (ID: ${pelvicBinderSkill.id})`)
    } else {
      console.log(`  ℹ️  Skill already exists: ${pelvicBinderSkill.name} (ID: ${pelvicBinderSkill.id})`)
    }

    // Step 3: Create subject-skill mappings
    console.log('\n🔗 Creating subject-skill mappings...')
    
    for (const [hemCode, mappingData] of Object.entries(mappingResults.subjectSkillMapping)) {
      const subject = createdSubjects.find(s => s.code === hemCode)
      if (!subject) {
        console.log(`  ⚠️  Subject ${hemCode} not found, skipping...`)
        continue
      }

      const mappingDataTyped = mappingData as { matched: any[], unmatched: any[] }
      console.log(`\n  📋 Processing ${hemCode} (${mappingDataTyped.matched.length} skills):`)
      
      // Map matched skills
      for (const matchedSkill of mappingDataTyped.matched) {
        try {
          await prisma.subjectSkill.upsert({
            where: {
              subjectId_skillId: {
                subjectId: subject.id,
                skillId: matchedSkill.dbSkillId
              }
            },
            update: { isCore: true },
            create: {
              subjectId: subject.id,
              skillId: matchedSkill.dbSkillId,
              isCore: true
            }
          })
          console.log(`    ✅ ${matchedSkill.pdfSkill} → ${matchedSkill.dbSkillName}`)
        } catch (error) {
          console.error(`    ❌ Error mapping skill ${matchedSkill.pdfSkill}:`, error)
        }
      }

      // Handle unmatched skills (like Pelvic Binder Application for HEM2033)
      if (mappingDataTyped.unmatched.length > 0) {
        console.log(`\n    📝 Processing unmatched skills for ${hemCode}:`)
        for (const unmatchedSkill of mappingDataTyped.unmatched) {
          if (unmatchedSkill === "Pelvic Binder Application" && hemCode === "HEM2033") {
            try {
              await prisma.subjectSkill.create({
                data: {
                  subjectId: subject.id,
                  skillId: pelvicBinderSkill.id,
                  isCore: true
                }
              })
              console.log(`    ✅ ${unmatchedSkill} → Newly created skill (ID: ${pelvicBinderSkill.id})`)
            } catch (error) {
              console.error(`    ❌ Error mapping new skill ${unmatchedSkill}:`, error)
            }
          } else {
            console.log(`    ⚠️  Skill "${unmatchedSkill}" not handled - may need manual creation`)
          }
        }
      }
    }

    // Step 4: Create test enrollments (enroll john@doe.com in all subjects for testing)
    console.log('\n👤 Creating test user enrollments...')
    
    const testUser = await prisma.user.findFirst({
      where: { email: "john@doe.com" }
    })

    if (testUser) {
      console.log(`  Found test user: ${testUser.name} (${testUser.email})`)
      
      for (const subject of createdSubjects) {
        try {
          await prisma.userSubject.upsert({
            where: {
              userId_subjectId: {
                userId: testUser.id,
                subjectId: subject.id
              }
            },
            update: { isActive: true },
            create: {
              userId: testUser.id,
              subjectId: subject.id,
              isActive: true
            }
          })
          console.log(`    ✅ Enrolled in ${subject.code}`)
        } catch (error) {
          console.error(`    ❌ Error enrolling in ${subject.code}:`, error)
        }
      }
    } else {
      console.log('  ⚠️  Test user john@doe.com not found - skipping enrollments')
    }

    // Step 5: Generate summary report
    console.log('\n📊 MIGRATION SUMMARY:')
    console.log('==========================================')
    
    const subjectCounts = await Promise.all(
      createdSubjects.map(async (subject) => {
        const skillCount = await prisma.subjectSkill.count({
          where: { subjectId: subject.id }
        })
        return { ...subject, skillCount }
      })
    )

    subjectCounts.forEach(subject => {
      console.log(`  ${subject.code}: ${subject.skillCount} skills - ${subject.name}`)
    })

    const totalMappings = await prisma.subjectSkill.count()
    const totalSkills = await prisma.skill.count()
    const totalSubjects = await prisma.subject.count()

    console.log(`\n📈 Database Statistics:`)
    console.log(`  📚 Subjects: ${totalSubjects}`)
    console.log(`  🎯 Skills: ${totalSkills}`)
    console.log(`  🔗 Subject-Skill mappings: ${totalMappings}`)
    console.log(`  👥 Test enrollments: ${testUser ? totalSubjects : 0}`)

    console.log('\n🎉 Subject population and mapping completed successfully!')

  } catch (error) {
    console.error('❌ Error during migration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

populateSubjectsAndMappings()

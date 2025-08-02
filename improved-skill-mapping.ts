
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

// PDF skills organized by HEM subjects
const pdfSkillMapping = {
  "HEM1103": [
    "Handwashing", "Basic Airway Maneuver", "Oropharyngeal Suctioning",
    "Bag Valve Mask (BVM) Ventilation", "OP Airway Insertion", "NP Airway Insertion",
    "Choking – Adult", "Basic Life Support with AED", "Recovery Position",
    "Nebulization", "Baseline Observations", "Hemoglucose Test (HGT)",
    "Pre-Alert (ASHICE)", "Bandage Application", "Splinting a Fracture",
    "Triangular Bandage Use", "Exsanguinating Hemorrhage"
  ],
  "HEM2105": [
    "Supraglottic Airway Insertion (LMA/iGEL)", "Suctioning – ETT or SGA",
    "Intermediate Life Support – Adult"
  ],
  "HEM2024": [
    "Intravenous Cannulation (IV)", "Needle Thoracocentesis (Chest Decompression)",
    "Cervical Spine Clearance"
  ],
  "HEM2033": [
    "Traction Splint", "Pelvic Binder Application", "Drug Administration"
  ],
  "HEM3006": [
    "Predicting Difficult BVM Ventilations", "Predicting Difficult Intubation",
    "Intubation – Adult", "Orogastric & Nasogastric tube insertion",
    "Surgical Cricothyroidotomy (Front of Neck Access)", "External Jugular Vein Cannulation (EJVC)"
  ],
  "HEM3106": [
    "Advanced Life Support Adult", "Advanced Life Support Infant",
    "Advanced Life Support Child", "Intraosseous Access", "Carotid Sinus Massage",
    "Valsalva Maneuver"
  ],
  "HEM4106": [
    "Synchronized Cardioversion", "Transcutaneous Pacing", "CPAP",
    "EtCO2", "Transport Ventilator", "Ventilator Alarm Troubleshooting"
  ]
}

// Define explicit skill mappings for better accuracy
const explicitMappings = [
  { pdf: "Handwashing", db: "Hand Washing" },
  { pdf: "Basic Airway Maneuver", db: "Basic Airway Maneuver" },
  { pdf: "Oropharyngeal Suctioning", db: "Oropharyngeal Suctioning" },
  { pdf: "Bag Valve Mask (BVM) Ventilation", db: "Bag Valve Mask Reservoir Ventilation – apneic patient" },
  { pdf: "OP Airway Insertion", db: "Oropharyngeal Tube Insertion" },
  { pdf: "NP Airway Insertion", db: "Insertion of Nasopharyngeal Airway" },
  { pdf: "Choking – Adult", db: "Adult Choking without the use of equipment" },
  { pdf: "Basic Life Support with AED", db: "Adult CPR with Manual defibrillator" },
  { pdf: "Recovery Position", db: "Recovery Position" },
  { pdf: "Nebulization", db: "Nebulization of Medication" },
  { pdf: "Baseline Observations", db: "Hgt" }, // May need verification
  { pdf: "Hemoglucose Test (HGT)", db: "Hgt" },
  { pdf: "Pre-Alert (ASHICE)", db: "Pre Hospital Update" }, // May need verification
  { pdf: "Bandage Application", db: "Application of a bandage" },
  { pdf: "Splinting a Fracture", db: "Splinting a fracture" },
  { pdf: "Triangular Bandage Use", db: "Application of a Triangular Bandage" },
  { pdf: "Exsanguinating Hemorrhage", db: "BLEEDING CONTROL/SHOCK MANAGEMENT" },
  { pdf: "Supraglottic Airway Insertion (LMA/iGEL)", db: "Supraglottic Airway Insertion" },
  { pdf: "Suctioning – ETT or SGA", db: "Suctioning of the Endotracheal Tube" },
  { pdf: "Intermediate Life Support – Adult", db: "Adult CPR with Manual defibrillator" }, // May need verification
  { pdf: "Intravenous Cannulation (IV)", db: "Intravenous Cannulation" },
  { pdf: "Needle Thoracocentesis (Chest Decompression)", db: "Needle Thoracentesis" },
  { pdf: "Cervical Spine Clearance", db: "C Spine Clearance" },
  { pdf: "Traction Splint", db: "Traction Splint" },
  { pdf: "Drug Administration", db: "Drug Administration" },
  { pdf: "Predicting Difficult BVM Ventilations", db: "Prediction of difficult bag valve mask ventilations" },
  { pdf: "Predicting Difficult Intubation", db: "Prediction of difficult direct endotracheal intubation" },
  { pdf: "Intubation – Adult", db: "Adult Endotracheal Intubation (ETT)" },
  { pdf: "Orogastric & Nasogastric tube insertion", db: "Orogastric and Nasogastric Tube Insertion" },
  { pdf: "Surgical Cricothyroidotomy (Front of Neck Access)", db: "Surgical Crichothyroidotomy" },
  { pdf: "External Jugular Vein Cannulation (EJVC)", db: "External Jugular Vein Cannulation (EJVC)" },
  { pdf: "Advanced Life Support Adult", db: "Adult CPR with Manual defibrillator" }, // Multiple ALS skills exist
  { pdf: "Advanced Life Support Infant", db: "INFANT CPR WITH MANUAL DEFIBRILLATOR" },
  { pdf: "Advanced Life Support Child", db: "PAEDIATRIC CPR WITH MANUAL DEFIBRILLATOR" },
  { pdf: "Intraosseous Access", db: "EZ-IO® Distal Tibia Insertion Technique" },
  { pdf: "Carotid Sinus Massage", db: "CAROTID SINUS MASSAGE" },
  { pdf: "Valsalva Maneuver", db: "Modified Valsalva Maneuver" },
  { pdf: "Synchronized Cardioversion", db: "SYNCHRONISED CARDIOVERSION" },
  { pdf: "Transcutaneous Pacing", db: "TRANSCUT ANEOUS PACING" },
  { pdf: "CPAP", db: "CPAP" },
  { pdf: "EtCO2", db: "ETCO2 monitoring" },
  { pdf: "Transport Ventilator", db: "Use of a transport ventilator" },
  { pdf: "Ventilator Alarm Troubleshooting", db: "Troubleshooting ventilator alarms" }
]

function findSkillMatch(pdfSkillName: string, dbSkills: any[]): any | null {
  // Filter out empty skill names
  const validDbSkills = dbSkills.filter(skill => skill.name && skill.name.trim().length > 0)
  
  // Check explicit mappings first
  const explicitMapping = explicitMappings.find(mapping => 
    mapping.pdf.toLowerCase() === pdfSkillName.toLowerCase()
  )
  
  if (explicitMapping) {
    const match = validDbSkills.find(dbSkill => 
      dbSkill.name.toLowerCase() === explicitMapping.db.toLowerCase()
    )
    if (match) return match
  }

  // Exact match
  const exactMatch = validDbSkills.find(dbSkill => 
    dbSkill.name.toLowerCase() === pdfSkillName.toLowerCase()
  )
  if (exactMatch) return exactMatch

  // No partial matching to avoid false positives
  return null
}

async function analyzeSkillMapping() {
  try {
    console.log('🔍 Analyzing skill deduplication and mapping (improved version)...\n')
    
    // Get all current database skills (excluding empty names)
    const dbSkills = await prisma.skill.findMany({
      select: {
        id: true,
        name: true,
        category: {
          select: {
            name: true
          }
        }
      },
      where: {
        name: {
          not: ""
        }
      }
    })

    console.log(`📁 Found ${dbSkills.length} valid database skills (excluding empty names)\n`)

    const mappingResults = {
      matched: [] as any[],
      unmatched: [] as any[],
      subjectSkillMapping: {} as any,
      hemSubjects: [] as any[]
    }

    // Process each HEM subject
    for (const [hemCode, skills] of Object.entries(pdfSkillMapping)) {
      console.log(`\n📚 Processing ${hemCode}:`)
      mappingResults.subjectSkillMapping[hemCode] = {
        matched: [],
        unmatched: []
      }

      let matchedCount = 0
      let unmatchedCount = 0

      for (const pdfSkill of skills as string[]) {
        const match = findSkillMatch(pdfSkill, dbSkills)
        
        if (match) {
          console.log(`  ✅ "${pdfSkill}" → "${match.name}" (ID: ${match.id})`)
          mappingResults.matched.push({
            pdfSkill,
            dbSkill: match.name,
            dbSkillId: match.id,
            hemCode,
            category: match.category.name
          })
          mappingResults.subjectSkillMapping[hemCode].matched.push({
            pdfSkill,
            dbSkillId: match.id,
            dbSkillName: match.name
          })
          matchedCount++
        } else {
          console.log(`  ❌ "${pdfSkill}" → No match found`)
          mappingResults.unmatched.push({
            pdfSkill,
            hemCode
          })
          mappingResults.subjectSkillMapping[hemCode].unmatched.push(pdfSkill)
          unmatchedCount++
        }
      }
      
      console.log(`   📊 ${hemCode}: ${matchedCount} matched, ${unmatchedCount} unmatched`)
    }

    // Add subject information based on PDF data
    const subjectInfo = {
      "HEM1103": { level: "EMT-Basic", description: "Emergency Medical Technician - Basic Level" },
      "HEM2105": { level: "Paramedic", description: "Intermediate Paramedic Level (Airway Management)" },
      "HEM2024": { level: "Paramedic", description: "Intermediate Paramedic Level (IV Access & Emergency Procedures)" },
      "HEM2033": { level: "Paramedic", description: "Intermediate Paramedic Level (Equipment & Drug Administration)" },
      "HEM3006": { level: "Advanced Paramedic", description: "Advanced Paramedic Level (Advanced Airway Management)" },
      "HEM3106": { level: "Advanced Paramedic", description: "Advanced Paramedic Level (Advanced Life Support)" },
      "HEM4106": { level: "Advanced Paramedic", description: "Advanced Paramedic Level (Advanced Cardiac & Respiratory Support)" }
    }

    for (const [hemCode, info] of Object.entries(subjectInfo)) {
      const hemCodeTyped = hemCode as keyof typeof pdfSkillMapping
      mappingResults.hemSubjects.push({
        code: hemCode,
        level: info.level,
        description: info.description,
        skillCount: pdfSkillMapping[hemCodeTyped].length,
        matchedCount: mappingResults.subjectSkillMapping[hemCode].matched.length,
        unmatchedCount: mappingResults.subjectSkillMapping[hemCode].unmatched.length
      })
    }

    // Save mapping results
    fs.writeFileSync(
      './data/improved-skill-mapping-results.json', 
      JSON.stringify(mappingResults, null, 2)
    )

    // Summary
    console.log('\n📊 IMPROVED MAPPING SUMMARY:')
    console.log('==========================================')
    console.log(`✅ Total matched skills: ${mappingResults.matched.length}/44`)
    console.log(`❌ Total unmatched skills: ${mappingResults.unmatched.length}/44`)
    console.log(`📁 Valid database skills: ${dbSkills.length}`)
    console.log(`📚 HEM subjects: ${Object.keys(pdfSkillMapping).length}`)
    
    console.log('\n📋 Summary by HEM Subject:')
    mappingResults.hemSubjects.forEach(subject => {
      console.log(`  ${subject.code}: ${subject.matchedCount}/${subject.skillCount} matched - ${subject.description}`)
    })

    console.log('\n📝 Unmatched skills that need to be created:')
    if (mappingResults.unmatched.length === 0) {
      console.log('  🎉 All PDF skills have been matched to existing database skills!')
    } else {
      mappingResults.unmatched.forEach(item => {
        console.log(`  - ${item.pdfSkill} (${item.hemCode})`)
      })
    }

    console.log('\n💾 Results saved to: ./data/improved-skill-mapping-results.json')

  } catch (error) {
    console.error('Error analyzing skill mapping:', error)
  } finally {
    await prisma.$disconnect()
  }
}

analyzeSkillMapping()

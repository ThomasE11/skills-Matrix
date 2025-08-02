
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

// Flexible skill name matching function
function findSkillMatch(pdfSkillName: string, dbSkills: any[]): any | null {
  // Exact match first
  const exactMatch = dbSkills.find(dbSkill => 
    dbSkill.name.toLowerCase() === pdfSkillName.toLowerCase()
  )
  if (exactMatch) return exactMatch

  // Fuzzy matching for similar names
  const fuzzyMatches = [
    // Handwashing variations
    { pdf: "handwashing", db: "hand washing" },
    { pdf: "bag valve mask (bvm) ventilation", db: "bag valve mask reservoir ventilation" },
    { pdf: "op airway insertion", db: "oropharyngeal tube insertion" },
    { pdf: "np airway insertion", db: "insertion of nasopharyngeal airway" },
    { pdf: "choking – adult", db: "adult choking without the use of equipment" },
    { pdf: "basic life support with aed", db: "adult cpr with manual defibrillator" },
    { pdf: "nebulization", db: "nebulization of medication" },
    { pdf: "hemoglucose test (hgt)", db: "hgt" },
    { pdf: "baseline observations", db: "hgt" }, // May need manual verification
    { pdf: "pre-alert (ashice)", db: "pre hospital update" },
    { pdf: "bandage application", db: "application of a bandage" },
    { pdf: "splinting a fracture", db: "splinting a fracture" },
    { pdf: "triangular bandage use", db: "application of a triangular bandage" },
    { pdf: "exsanguinating hemorrhage", db: "bleeding control/shock management" },
    { pdf: "supraglottic airway insertion (lma/igel)", db: "supraglottic airway insertion" },
    { pdf: "suctioning – ett or sga", db: "suctioning of the endotracheal tube" },
    { pdf: "intermediate life support – adult", db: "adult cpr with manual defibrillator" },
    { pdf: "intravenous cannulation (iv)", db: "intravenous cannulation" },
    { pdf: "needle thoracocentesis (chest decompression)", db: "needle thoracentesis" },
    { pdf: "cervical spine clearance", db: "c spine clearance" },
    { pdf: "traction splint", db: "traction splint" },
    { pdf: "drug administration", db: "drug administration" },
    { pdf: "predicting difficult bvm ventilations", db: "prediction of difficult bag valve mask ventilations" },
    { pdf: "predicting difficult intubation", db: "prediction of difficult direct endotracheal intubation" },
    { pdf: "intubation – adult", db: "adult endotracheal intubation (ett)" },
    { pdf: "orogastric & nasogastric tube insertion", db: "orogastric and nasogastric tube insertion" },
    { pdf: "surgical cricothyroidotomy (front of neck access)", db: "surgical crichothyroidotomy" },
    { pdf: "external jugular vein cannulation (ejvc)", db: "external jugular vein cannulation (ejvc)" },
    { pdf: "advanced life support adult", db: "adult cpr with manual defibrillator" },
    { pdf: "advanced life support infant", db: "infant cpr with manual defibrillator" },
    { pdf: "advanced life support child", db: "paediatric cpr with manual defibrillator" },
    { pdf: "intraosseous access", db: "ez-io® distal tibia insertion technique" },
    { pdf: "carotid sinus massage", db: "carotid sinus massage" },
    { pdf: "valsalva maneuver", db: "modified valsalva maneuver" },
    { pdf: "synchronized cardioversion", db: "synchronised cardioversion" },
    { pdf: "transcutaneous pacing", db: "transcut aneous pacing" },
    { pdf: "cpap", db: "cpap" },
    { pdf: "etco2", db: "etco2 monitoring" },
    { pdf: "transport ventilator", db: "use of a transport ventilator" },
    { pdf: "ventilator alarm troubleshooting", db: "troubleshooting ventilator alarms" }
  ]

  const fuzzyMatch = fuzzyMatches.find(match => 
    match.pdf === pdfSkillName.toLowerCase()
  )
  
  if (fuzzyMatch) {
    const dbMatch = dbSkills.find(dbSkill => 
      dbSkill.name.toLowerCase().includes(fuzzyMatch.db.toLowerCase()) ||
      fuzzyMatch.db.toLowerCase().includes(dbSkill.name.toLowerCase())
    )
    if (dbMatch) return dbMatch
  }

  // Partial match as fallback
  const partialMatch = dbSkills.find(dbSkill => {
    const pdfWords = pdfSkillName.toLowerCase().split(/\s+|[–-]/)
    const dbWords = dbSkill.name.toLowerCase().split(/\s+|[–-]/)
    
    // Check if most significant words match
    const significantWords = pdfWords.filter(word => 
      word.length > 3 && !['with', 'without', 'the', 'and', 'for', 'of'].includes(word)
    )
    
    const matchCount = significantWords.filter(word => 
      dbWords.some((dbWord: string) => dbWord.includes(word) || word.includes(dbWord))
    ).length
    
    return matchCount >= Math.min(2, significantWords.length)
  })

  return partialMatch || null
}

async function analyzeSkillMapping() {
  try {
    console.log('🔍 Analyzing skill deduplication and mapping...\n')
    
    // Get all current database skills
    const dbSkills = await prisma.skill.findMany({
      select: {
        id: true,
        name: true,
        category: {
          select: {
            name: true
          }
        }
      }
    })

    const mappingResults = {
      matched: [] as any[],
      unmatched: [] as any[],
      duplicates: [] as any[],
      subjectSkillMapping: {} as any
    }

    // Process each HEM subject
    for (const [hemCode, skills] of Object.entries(pdfSkillMapping)) {
      console.log(`\n📚 Processing ${hemCode}:`)
      mappingResults.subjectSkillMapping[hemCode] = {
        matched: [],
        unmatched: []
      }

      for (const pdfSkill of skills) {
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
        } else {
          console.log(`  ❌ "${pdfSkill}" → No match found`)
          mappingResults.unmatched.push({
            pdfSkill,
            hemCode
          })
          mappingResults.subjectSkillMapping[hemCode].unmatched.push(pdfSkill)
        }
      }
    }

    // Save mapping results
    fs.writeFileSync(
      './data/skill-mapping-results.json', 
      JSON.stringify(mappingResults, null, 2)
    )

    // Summary
    console.log('\n📊 MAPPING SUMMARY:')
    console.log('==========================================')
    console.log(`✅ Matched skills: ${mappingResults.matched.length}/44`)
    console.log(`❌ Unmatched skills: ${mappingResults.unmatched.length}/44`)
    console.log(`📁 Database skills: ${dbSkills.length}`)
    
    console.log('\n📝 Unmatched skills that need to be created:')
    mappingResults.unmatched.forEach(item => {
      console.log(`  - ${item.pdfSkill} (${item.hemCode})`)
    })

    console.log('\n💾 Results saved to: ./data/skill-mapping-results.json')

  } catch (error) {
    console.error('Error analyzing skill mapping:', error)
  } finally {
    await prisma.$disconnect()
  }
}

analyzeSkillMapping()

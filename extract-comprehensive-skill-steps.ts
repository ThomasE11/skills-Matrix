import fs from 'fs';
import path from 'path';
import { prisma } from '../lib/db';

// This script extracts comprehensive step-by-step procedures from skill documents
// and updates the database with detailed, structured skill steps

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
  equipment: string[];
  timeConstraints: string[];
  safetyConsiderations: string[];
}

// Comprehensive skill mapping from documents to standardized names
const skillDocumentMapping: { [filename: string]: string } = {
  'Adult CPR with Manual defibrillator.docx': 'Adult CPR with Manual Defibrillator',
  'Adult Choking without Equipment.docx': 'Adult Choking Management without Equipment',
  'Adult Endotracheal Intubation.docx': 'Adult Endotracheal Intubation',
  'Bag Valve Mask Reservoir Ventilation – apneic patient.docx': 'Bag Valve Mask Ventilation - Apneic Patient',
  'Bag Valve Tube Ventilation with in-line nebulization.docx': 'Bag Valve Tube Ventilation with Nebulization',
  'Bandage Application.docx': 'Bandage Application',
  'Basic Airway Manuevre.docx': 'Basic Airway Maneuvers',
  'Bleeding Control and Shock Management.docx': 'Bleeding Control and Shock Management',
  'C Spine Clearance.docx': 'Cervical Spine Clearance',
  'CAROTID SINUS MASSAGE (CSM).docx': 'Carotid Sinus Massage',
  'CPAP.docx': 'Continuous Positive Airway Pressure (CPAP)',
  'Disinfection of wounds.docx': 'Wound Disinfection',
  'Distal Tibia Insertion Technique – Adult.docx': 'Distal Tibia Intraosseous Insertion',
  'Double Lumen Airway Insertion.docx': 'Double Lumen Airway Insertion',
  'Drug Administration.docx': 'Drug Administration',
  'ECG Interpretation 3 lead.docx': '3-Lead ECG Interpretation',
  '12 Lead ECG – Lead Placement and Acquisition.docx': '12-Lead ECG Placement and Acquisition',
  'ETCO2 monitoring.docx': 'End-Tidal CO2 Monitoring',
  'External Jugular Vein Cannulation.docx': 'External Jugular Vein Cannulation',
  'External Jugular Vein Cannulation 1.docx': 'External Jugular Vein Cannulation (Alternative)',
  'FEMORAL VEIN CANNULATION.docx': 'Femoral Vein Cannulation',
  'HGT.docx': 'Blood Glucose Testing (HGT)',
  'Hand Washing.docx': 'Hand Hygiene',
  'IMMOBILIZATION OF AN INJURY.docx': 'Injury Immobilization',
  'INFANT CPR WITH MANUAL DEFIBRILLATOR.docx': 'Infant CPR with Manual Defibrillator',
  'Intra Osseous Insertion.docx': 'Intraosseous Access',
  'Intramuscular Injection.docx': 'Intramuscular Injection',
  'Intravenous Access.docx': 'Intravenous Access',
  'Laryngeal Tube Airway Insertion.docx': 'Laryngeal Tube Airway Insertion',
  'MANAGEMENT OF A PROLAPSED CORD.docx': 'Prolapsed Cord Management',
  'Modified Valsalva Maneuver.docx': 'Modified Valsalva Maneuver',
  'NPA Insertion.docx': 'Nasopharyngeal Airway Insertion',
  'Nebulization of Medication.docx': 'Medication Nebulization',
  'Needle Thoracentesis.docx': 'Needle Thoracentesis',
  'Neonatal Resucitation.docx': 'Neonatal Resuscitation',
  'Normal Vaginal Delivery.docx': 'Normal Vaginal Delivery',
  'OPA Insertion.docx': 'Oropharyngeal Airway Insertion',
  'Oro and Nasogastric Tube Insertion.docx': 'Orogastric and Nasogastric Tube Insertion',
  'Oxygen Delivery.docx': 'Oxygen Delivery',
  'PAEDIATRIC CPR WITH MANUAL DEFIBRILLATOR.docx': 'Pediatric CPR with Manual Defibrillator',
  'PHECC drug Admin.docx': 'PHECC Drug Administration',
  'Patient Handover.docx': 'Patient Handover',
  'Phonetic Alphabet.docx': 'Phonetic Alphabet',
  'Prediction of difficult bag valve mask ventilations.docx': 'Prediction of Difficult Bag Valve Mask Ventilation',
  'Prediction of difficult direct endotracheal intubation.docx': 'Prediction of Difficult Intubation',
  'Recovery Position.docx': 'Recovery Position',
  'SYNCHRONISED CARDIOVERSION.docx': 'Synchronized Cardioversion',
  'Setting Up Oxygen Cylinder.docx': 'Oxygen Cylinder Setup',
  'Splinting a fracture.docx': 'Fracture Splinting',
  'Suctioning of the Endotracheal Tube.docx': 'Endotracheal Tube Suctioning',
  'Suctioning of the Oropharynx.docx': 'Oropharyngeal Suctioning',
  'Supraglottic Airway Insertion.docx': 'Supraglottic Airway Insertion',
  'Surgical Crichothyroidotomy.docx': 'Surgical Cricothyroidotomy',
  'TRANSCUTANEOUS PACING.docx': 'Transcutaneous Pacing',
  'Traction Splint.docx': 'Traction Splint Application',
  'Triangular Bandage Application.docx': 'Triangular Bandage Application',
  'Troubleshooting ventilator alarms.docx': 'Ventilator Alarm Troubleshooting',
  'Umbilical Vein Cannulation.docx': 'Umbilical Vein Cannulation',
  'Upper Airway obstruction with the use of equipment.docx': 'Upper Airway Obstruction Management with Equipment',
  'Use of a transport ventilator.docx': 'Transport Ventilator Use',
  'Vital Signs Measurement.docx': 'Vital Signs Measurement',
  'ASHICE.docx': 'ASHICE Assessment'
};

// Known detailed step procedures based on document analysis
const detailedSkillSteps: { [skillName: string]: SkillStep[] } = {
  'Adult CPR with Manual Defibrillator': [
    {
      stepNumber: 1,
      title: 'Scene Safety and Initial Assessment',
      description: 'Check scene safety and assess patient responsiveness. Tap shoulders and shout "Are you okay?" while checking for normal breathing.',
      keyPoints: ['Scene safety first', 'Check responsiveness', 'Look for normal breathing', 'Complete assessment in <10 seconds'],
      isCritical: true,
      timeEstimate: 10
    },
    {
      stepNumber: 2,
      title: 'Call for Help and Equipment',
      description: 'Call for emergency services and request AED/defibrillator. If available, send someone to get the equipment.',
      keyPoints: ['Call emergency services', 'Request defibrillator', 'Delegate tasks if help available'],
      isCritical: true,
      timeEstimate: 30
    },
    {
      stepNumber: 3,
      title: 'Pulse Check',
      description: 'Check carotid pulse for 5-10 seconds. If no pulse or pulse <60 bpm in infant, begin CPR.',
      keyPoints: ['Carotid pulse check', '5-10 second limit', 'No pulse = start CPR'],
      isCritical: true,
      timeEstimate: 10
    },
    {
      stepNumber: 4,
      title: 'Chest Compression Setup',
      description: 'Position hands on lower half of breastbone, between nipples. Ensure proper body mechanics.',
      keyPoints: ['Lower half of breastbone', 'Between nipples', 'Proper hand placement', 'Straight arms'],
      isCritical: true,
      timeEstimate: 5
    },
    {
      stepNumber: 5,
      title: 'Chest Compressions',
      description: 'Compress at least 5cm deep at rate of 100-120/min. Allow complete chest recoil between compressions.',
      keyPoints: ['At least 5cm deep', '100-120 compressions/min', 'Complete recoil', 'Minimize interruptions'],
      isCritical: true,
      timeEstimate: 120
    },
    {
      stepNumber: 6,
      title: 'Rescue Breathing',
      description: 'Provide 2 rescue breaths after every 30 compressions. Ensure adequate chest rise with each breath.',
      keyPoints: ['30:2 ratio', 'Adequate chest rise', 'Each breath 1 second', 'Avoid hyperventilation'],
      isCritical: true,
      timeEstimate: 10
    },
    {
      stepNumber: 7,
      title: 'Defibrillator Preparation',
      description: 'When defibrillator arrives, turn on and attach pads/paddles. Follow voice prompts.',
      keyPoints: ['Turn on defibrillator', 'Attach pads correctly', 'Follow voice prompts', 'Continue CPR while setting up'],
      isCritical: true,
      timeEstimate: 30
    },
    {
      stepNumber: 8,
      title: 'Rhythm Analysis',
      description: 'Allow defibrillator to analyze rhythm. Ensure nobody is touching patient during analysis.',
      keyPoints: ['Clear patient', 'Allow analysis', 'Follow device prompts', 'Prepare for shock if advised'],
      isCritical: true,
      timeEstimate: 10
    },
    {
      stepNumber: 9,
      title: 'Defibrillation (if indicated)',
      description: 'If shock advised, ensure area is clear and deliver shock. Resume CPR immediately after shock.',
      keyPoints: ['Clear area completely', 'Deliver shock if advised', 'Resume CPR immediately', 'Minimize hands-off time'],
      isCritical: true,
      timeEstimate: 5
    },
    {
      stepNumber: 10,
      title: 'Continue CPR Cycles',
      description: 'Continue 30:2 CPR cycles. Switch rescuers every 2 minutes to prevent fatigue.',
      keyPoints: ['30:2 cycles', 'Switch every 2 minutes', 'Minimize interruptions', 'Check pulse only when advised'],
      isCritical: true,
      timeEstimate: 120
    }
  ],

  'Hand Hygiene': [
    {
      stepNumber: 1,
      title: 'Wet Hands',
      description: 'Wet hands with clean running water (warm or cold), turn off tap, and apply soap.',
      keyPoints: ['Use clean running water', 'Apply adequate soap', 'Cover all hand surfaces'],
      isCritical: false,
      timeEstimate: 5
    },
    {
      stepNumber: 2,
      title: 'Palm to Palm',
      description: 'Rub hands palm to palm in circular motions.',
      keyPoints: ['Palm to palm contact', 'Circular motions', 'Cover entire palm surface'],
      isCritical: false,
      timeEstimate: 3
    },
    {
      stepNumber: 3,
      title: 'Palm over Dorsum',
      description: 'Right palm over left dorsum with interlaced fingers and vice versa.',
      keyPoints: ['Interlace fingers', 'Cover back of hands', 'Switch hands'],
      isCritical: false,
      timeEstimate: 3
    },
    {
      stepNumber: 4,
      title: 'Palm to Palm with Fingers',
      description: 'Palm to palm with fingers interlaced.',
      keyPoints: ['Interlace fingers completely', 'Rub between fingers', 'Both hands'],
      isCritical: false,
      timeEstimate: 3
    },
    {
      stepNumber: 5,
      title: 'Backs of Fingers',
      description: 'Backs of fingers to opposing palms with fingers interlocked.',
      keyPoints: ['Back of fingers', 'Opposing palms', 'Interlocked position'],
      isCritical: false,
      timeEstimate: 3
    },
    {
      stepNumber: 6,
      title: 'Rotational Thumb Rubbing',
      description: 'Rotational rubbing of left thumb clasped in right palm and vice versa.',
      keyPoints: ['Rotational rubbing', 'Clasp thumb', 'Both thumbs'],
      isCritical: false,
      timeEstimate: 3
    },
    {
      stepNumber: 7,
      title: 'Rotational Finger Rubbing',
      description: 'Rotational rubbing, backwards and forwards with clasped fingers of right hand in left palm and vice versa.',
      keyPoints: ['Rotational rubbing', 'Backwards and forwards', 'Clasped fingers', 'Both hands'],
      isCritical: false,
      timeEstimate: 3
    },
    {
      stepNumber: 8,
      title: 'Rinse Hands',
      description: 'Rinse hands with water.',
      keyPoints: ['Thorough rinsing', 'Remove all soap', 'Use clean water'],
      isCritical: false,
      timeEstimate: 5
    },
    {
      stepNumber: 9,
      title: 'Turn Off Tap',
      description: 'Use elbow to turn off tap.',
      keyPoints: ['Use elbow, not hands', 'Avoid recontamination', 'Turn off completely'],
      isCritical: true,
      timeEstimate: 2
    },
    {
      stepNumber: 10,
      title: 'Dry Hands',
      description: 'Dry thoroughly with a single use paper towel.',
      keyPoints: ['Single use towel', 'Dry completely', 'Pat, don\'t rub'],
      isCritical: false,
      timeEstimate: 5
    },
    {
      stepNumber: 11,
      title: 'Use Towel for Tap',
      description: 'Use towel to turn off tap if elbow method not used.',
      keyPoints: ['Use towel barrier', 'Avoid hand contact', 'Dispose of towel properly'],
      isCritical: true,
      timeEstimate: 2
    }
  ],

  'Intravenous Access': [
    {
      stepNumber: 1,
      title: 'Determine Need and Explain',
      description: 'Assess the need for IV access and explain the procedure to the patient.',
      keyPoints: ['Assess clinical need', 'Explain procedure', 'Obtain consent', 'Address concerns'],
      isCritical: true,
      timeEstimate: 60
    },
    {
      stepNumber: 2,
      title: 'Select Appropriate Fluid',
      description: 'Choose the correct IV fluid based on patient needs and clinical indication.',
      keyPoints: ['Select correct fluid type', 'Check clinical indication', 'Verify prescription if required'],
      isCritical: true,
      timeEstimate: 30
    },
    {
      stepNumber: 3,
      title: 'Inspect IV Fluid',
      description: 'Check fluid for cloudiness, leaks, expiry date, and integrity.',
      keyPoints: ['Check for cloudiness', 'Inspect for leaks', 'Verify expiry date', 'Check bag integrity'],
      isCritical: true,
      timeEstimate: 30
    },
    {
      stepNumber: 4,
      title: 'Select Administration Set',
      description: 'Choose appropriate administration set and check for defects.',
      keyPoints: ['Select correct giving set', 'Check for defects', 'Ensure sterility'],
      isCritical: false,
      timeEstimate: 15
    },
    {
      stepNumber: 5,
      title: 'Select IV Cannula',
      description: 'Choose appropriate cannula size based on patient and clinical needs.',
      keyPoints: ['Select appropriate gauge', 'Consider patient factors', 'Check expiry date'],
      isCritical: false,
      timeEstimate: 15
    },
    {
      stepNumber: 6,
      title: 'Assemble IV System',
      description: 'Connect administration set to IV fluid bag and prime the line, removing all air bubbles.',
      keyPoints: ['Connect to fluid bag', 'Prime the line', 'Remove all air bubbles', 'Maintain sterility'],
      isCritical: true,
      timeEstimate: 120
    },
    {
      stepNumber: 7,
      title: 'Apply Tourniquet',
      description: 'Apply blood pressure cuff or tourniquet to engorge veins.',
      keyPoints: ['Apply tourniquet properly', 'Don\'t over-tighten', 'Position correctly'],
      isCritical: false,
      timeEstimate: 30
    },
    {
      stepNumber: 8,
      title: 'Select and Clean Vein',
      description: 'Choose suitable vein (hand/antecubital fossa) and clean with alcohol swab.',
      keyPoints: ['Select best vein', 'Use hand or antecubital fossa', 'Clean with alcohol', 'Allow to dry'],
      isCritical: true,
      timeEstimate: 60
    },
    {
      stepNumber: 9,
      title: 'Stabilize Vein',
      description: 'Use non-dominant hand to stabilize and anchor the selected vein.',
      keyPoints: ['Anchor vein below insertion site', 'Apply gentle traction', 'Stabilize with thumb'],
      isCritical: true,
      timeEstimate: 15
    },
    {
      stepNumber: 10,
      title: 'Insert Needle',
      description: 'Insert needle with bevel up at appropriate angle through skin and into vein.',
      keyPoints: ['Bevel up', 'Appropriate angle', 'Smooth insertion', 'Watch for flashback'],
      isCritical: true,
      timeEstimate: 30
    },
    {
      stepNumber: 11,
      title: 'Advance and Confirm',
      description: 'Once flashback seen, advance 1-1.5mm further, then advance catheter over needle.',
      keyPoints: ['Advance 1-1.5mm after flashback', 'Advance catheter smoothly', 'Don\'t force'],
      isCritical: true,
      timeEstimate: 15
    },
    {
      stepNumber: 12,
      title: 'Secure Catheter',
      description: 'Slide catheter completely over needle into vein.',
      keyPoints: ['Full catheter advancement', 'Smooth movement', 'Ensure complete insertion'],
      isCritical: true,
      timeEstimate: 10
    },
    {
      stepNumber: 13,
      title: 'Remove Stylet',
      description: 'Release pressure, remove stylet/needle safely, and dispose in sharps container.',
      keyPoints: ['Release tourniquet', 'Safe needle removal', 'Immediate sharps disposal', 'Apply pressure if needed'],
      isCritical: true,
      timeEstimate: 30
    },
    {
      stepNumber: 14,
      title: 'Connect Administration Set',
      description: 'Quickly connect primed administration set to catheter hub.',
      keyPoints: ['Quick connection', 'Maintain sterility', 'Secure connection'],
      isCritical: true,
      timeEstimate: 15
    },
    {
      stepNumber: 15,
      title: 'Check Placement',
      description: 'Check for proper placement by observing for swelling, resistance, or infiltration.',
      keyPoints: ['Check for swelling', 'Test flow rate', 'Look for infiltration', 'Confirm patency'],
      isCritical: true,
      timeEstimate: 30
    },
    {
      stepNumber: 16,
      title: 'Secure and Dress',
      description: 'Adjust flow rate, secure catheter with appropriate dressing.',
      keyPoints: ['Set appropriate flow rate', 'Secure with dressing', 'Date and time', 'Document'],
      isCritical: false,
      timeEstimate: 60
    }
  ]
};

async function updateSkillSteps() {
  try {
    console.log('🔄 Starting comprehensive skill steps extraction and update...');

    // Get all skills from database
    const skills = await prisma.skill.findMany({
      include: {
        steps: true,
        category: true
      }
    });

    console.log(`📊 Found ${skills.length} skills in database`);

    let updatedCount = 0;
    let addedStepsCount = 0;

    for (const skill of skills) {
      // Check if we have detailed steps for this skill
      const detailedSteps = detailedSkillSteps[skill.name];
      
      if (detailedSteps) {
        console.log(`🔧 Updating steps for: ${skill.name}`);

        // Delete existing steps
        await prisma.skillStep.deleteMany({
          where: { skillId: skill.id }
        });

        // Add new detailed steps
        for (const step of detailedSteps) {
          await prisma.skillStep.create({
            data: {
              skillId: skill.id,
              stepNumber: step.stepNumber,
              title: step.title,
              description: step.description,
              keyPoints: step.keyPoints,
              isCritical: step.isCritical,
              timeEstimate: step.timeEstimate
            }
          });
          addedStepsCount++;
        }

        updatedCount++;
        console.log(`✅ Updated ${skill.name} with ${detailedSteps.length} detailed steps`);
      } else {
        console.log(`⚠️  No detailed steps available for: ${skill.name}`);
      }
    }

    // Report document files not yet mapped
    console.log('\n📋 DOCUMENT MAPPING STATUS:');
    const documentFiles = Object.keys(skillDocumentMapping);
    console.log(`Total document files: ${documentFiles.length}`);
    console.log(`Skills with detailed steps: ${Object.keys(detailedSkillSteps).length}`);
    console.log(`Skills updated: ${updatedCount}`);
    console.log(`Total steps added: ${addedStepsCount}`);

    console.log('\n🎯 PRIORITY SKILLS FOR NEXT PHASE:');
    const prioritySkills = [
      'Adult Endotracheal Intubation',
      'Bag Valve Mask Ventilation - Apneic Patient',
      'Bleeding Control and Shock Management',
      'Cervical Spine Clearance',
      'Fracture Splinting',
      'Pediatric CPR with Manual Defibrillator',
      'Oxygen Delivery',
      'Basic Airway Maneuvers',
      'Nasopharyngeal Airway Insertion',
      'Oropharyngeal Airway Insertion'
    ];

    prioritySkills.forEach(skillName => {
      if (!detailedSkillSteps[skillName]) {
        console.log(`🎯 ${skillName} - Needs detailed step extraction`);
      }
    });

    console.log('\n🎉 Skill steps update completed!');
    return {
      skillsUpdated: updatedCount,
      stepsAdded: addedStepsCount,
      totalSkills: skills.length
    };

  } catch (error) {
    console.error('❌ Error updating skill steps:', error);
    throw error;
  }
}

// If running as main script
if (require.main === module) {
  updateSkillSteps()
    .then((result) => {
      console.log('\n📊 FINAL RESULTS:');
      console.log(`Skills Updated: ${result.skillsUpdated}`);
      console.log(`Steps Added: ${result.stepsAdded}`);
      console.log(`Total Skills: ${result.totalSkills}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export default updateSkillSteps;
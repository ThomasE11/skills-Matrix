import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample quiz questions for various skills
const quizQuestions = [
  // Basic Handwashing
  {
    skillName: 'Handwashing',
    questions: [
      {
        question: 'What is the minimum recommended duration for handwashing in healthcare settings?',
        options: [
          '10 seconds',
          '20 seconds',
          '30 seconds',
          '45 seconds'
        ],
        correctAnswer: 1,
        explanation: 'The CDC recommends washing hands for at least 20 seconds to effectively remove germs and pathogens.',
        difficulty: 'BEGINNER'
      },
      {
        question: 'Which of the following is the most critical step in proper handwashing technique?',
        options: [
          'Using hot water',
          'Rubbing all surfaces of hands and fingers',
          'Using antibacterial soap only',
          'Drying with a paper towel'
        ],
        correctAnswer: 1,
        explanation: 'Rubbing all surfaces of hands and fingers ensures thorough cleaning of all areas where germs can hide.',
        difficulty: 'BEGINNER'
      }
    ]
  },
  // Basic Airway Maneuver
  {
    skillName: 'Basic Airway Maneuver',
    questions: [
      {
        question: 'What is the primary purpose of the head-tilt, chin-lift maneuver?',
        options: [
          'To check for breathing',
          'To open the airway by moving the tongue away from the back of the throat',
          'To position the patient for CPR',
          'To assess consciousness level'
        ],
        correctAnswer: 1,
        explanation: 'The head-tilt, chin-lift maneuver lifts the tongue away from the back of the throat, opening the airway.',
        difficulty: 'BEGINNER'
      },
      {
        question: 'When should you NOT use the head-tilt, chin-lift maneuver?',
        options: [
          'On unconscious patients',
          'When the patient is breathing normally',
          'When you suspect spinal injury',
          'On elderly patients'
        ],
        correctAnswer: 2,
        explanation: 'If spinal injury is suspected, use the jaw-thrust maneuver instead to avoid moving the neck.',
        difficulty: 'BEGINNER'
      }
    ]
  },
  // Bag Valve Mask Ventilation
  {
    skillName: 'Bag Valve Mask (BVM) Ventilation',
    questions: [
      {
        question: 'What is the recommended tidal volume for adult BVM ventilation?',
        options: [
          '400-500 mL',
          '600-700 mL',
          '800-900 mL',
          '1000-1200 mL'
        ],
        correctAnswer: 1,
        explanation: 'For adults, deliver approximately 600-700 mL (6-7 mL/kg) to avoid gastric insufflation and barotrauma.',
        difficulty: 'INTERMEDIATE'
      },
      {
        question: 'What indicates effective BVM ventilation?',
        options: [
          'Fast, forceful breaths',
          'Visible chest rise and fall with each ventilation',
          'High pressure on the bag',
          'Continuous ventilation without pauses'
        ],
        correctAnswer: 1,
        explanation: 'Visible chest rise and fall indicates that air is reaching the lungs effectively.',
        difficulty: 'INTERMEDIATE'
      }
    ]
  },
  // Basic Life Support with AED
  {
    skillName: 'Basic Life Support with AED',
    questions: [
      {
        question: 'What is the correct compression-to-ventilation ratio for adult CPR?',
        options: [
          '15:2',
          '30:2',
          '5:1',
          '10:2'
        ],
        correctAnswer: 1,
        explanation: 'For adult CPR, provide 30 chest compressions followed by 2 rescue breaths.',
        difficulty: 'BEGINNER'
      },
      {
        question: 'At what depth should chest compressions be performed on an adult?',
        options: [
          'At least 1 inch (2.5 cm)',
          'At least 2 inches (5 cm)',
          'At least 3 inches (7.5 cm)',
          'At least 4 inches (10 cm)'
        ],
        correctAnswer: 1,
        explanation: 'Adult chest compressions should be at least 2 inches (5 cm) deep but not exceed 2.4 inches (6 cm).',
        difficulty: 'BEGINNER'
      }
    ]
  },
  // Intravenous Cannulation
  {
    skillName: 'Intravenous Cannulation (IV)',
    questions: [
      {
        question: 'What is the most important consideration when selecting an IV site?',
        options: [
          'Largest available vein',
          'Patient comfort',
          'Vein visibility and palpability',
          'Proximity to the heart'
        ],
        correctAnswer: 2,
        explanation: 'A vein that can be both seen and felt (palpated) provides the best chance of successful cannulation.',
        difficulty: 'INTERMEDIATE'
      },
      {
        question: 'What angle should the needle enter the skin for IV cannulation?',
        options: [
          '15-30 degrees',
          '45-60 degrees',
          '60-90 degrees',
          '90 degrees (perpendicular)'
        ],
        correctAnswer: 0,
        explanation: 'Insert the needle at a 15-30 degree angle to enter the vein smoothly without going through it.',
        difficulty: 'INTERMEDIATE'
      }
    ]
  },
  // Advanced Life Support
  {
    skillName: 'Advanced Life Support Adult',
    questions: [
      {
        question: 'What is the first-line medication for cardiac arrest with VT/VF rhythm?',
        options: [
          'Atropine',
          'Epinephrine',
          'Amiodarone',
          'Lidocaine'
        ],
        correctAnswer: 1,
        explanation: 'Epinephrine 1mg IV/IO every 3-5 minutes is the first-line medication for all cardiac arrest rhythms.',
        difficulty: 'ADVANCED'
      },
      {
        question: 'In adult ALS, when should the first dose of epinephrine be given?',
        options: [
          'Immediately upon arrival',
          'After the first shock in shockable rhythms',
          'After 2-3 cycles of CPR in non-shockable rhythms',
          'Only if spontaneous circulation is not achieved'
        ],
        correctAnswer: 2,
        explanation: 'Give epinephrine after 2-3 cycles of CPR in non-shockable rhythms, or after failed defibrillation in shockable rhythms.',
        difficulty: 'ADVANCED'
      }
    ]
  }
];

async function seedQuizQuestions() {
  console.log('🧠 Starting quiz questions seeding...');

  try {
    let totalCreated = 0;

    for (const skillQuiz of quizQuestions) {
      // Find the skill by name
      const skill = await prisma.skill.findFirst({
        where: {
          name: {
            contains: skillQuiz.skillName,
            mode: 'insensitive'
          }
        }
      });

      if (!skill) {
        console.warn(`⚠️  Skill not found: ${skillQuiz.skillName}`);
        continue;
      }

      console.log(`📝 Adding questions for: ${skill.name}`);

      // Create questions for this skill
      for (const question of skillQuiz.questions) {
        try {
          await prisma.quizQuestion.create({
            data: {
              skillId: skill.id,
              question: question.question,
              options: question.options,
              correctAnswer: question.correctAnswer,
              explanation: question.explanation,
              difficulty: question.difficulty as any
            }
          });
          totalCreated++;
        } catch (error) {
          console.error(`Error creating question for ${skill.name}:`, error);
        }
      }
    }

    console.log(`✅ Quiz questions seeding completed!`);
    console.log(`📊 Summary: ${totalCreated} questions created across ${quizQuestions.length} skills`);

  } catch (error) {
    console.error('❌ Error seeding quiz questions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding if this script is executed directly
if (require.main === module) {
  seedQuizQuestions()
    .then(() => {
      console.log('🎉 Quiz questions seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Quiz questions seeding failed:', error);
      process.exit(1);
    });
}

export { seedQuizQuestions };
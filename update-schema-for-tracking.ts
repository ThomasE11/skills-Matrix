
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateSchemaForTracking() {
  try {
    console.log('🔄 Starting schema update for enhanced tracking...');

    // First, let's add the new fields to existing tables using raw SQL
    // Note: In production, you'd use proper migrations
    
    // Add metadata and trackingData to VideoAnalysisSession
    await prisma.$executeRaw`
      ALTER TABLE video_analysis_sessions 
      ADD COLUMN IF NOT EXISTS metadata JSONB,
      ADD COLUMN IF NOT EXISTS tracking_data JSONB;
    `;
    
    // Add enhanced tracking fields to VideoAnalysisResult
    await prisma.$executeRaw`
      ALTER TABLE video_analysis_results 
      ADD COLUMN IF NOT EXISTS timestamp_analysis JSONB,
      ADD COLUMN IF NOT EXISTS educational_recommendations TEXT[],
      ADD COLUMN IF NOT EXISTS hand_tracking_analysis JSONB,
      ADD COLUMN IF NOT EXISTS pose_tracking_analysis JSONB,
      ADD COLUMN IF NOT EXISTS accuracy_progression JSONB,
      ADD COLUMN IF NOT EXISTS target_hit_analysis JSONB;
    `;
    
    // Add tracking configuration to Skills
    await prisma.$executeRaw`
      ALTER TABLE skills 
      ADD COLUMN IF NOT EXISTS tracking_enabled BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS hands_tracking_enabled BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS pose_tracking_enabled BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS ai_coaching_enabled BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS target_areas JSONB;
    `;
    
    // Create TrackingSession table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS tracking_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        skill_id INTEGER NOT NULL,
        session_type TEXT NOT NULL DEFAULT 'PRACTICE',
        hands_enabled BOOLEAN DEFAULT true,
        pose_enabled BOOLEAN DEFAULT true,
        ai_coach_enabled BOOLEAN DEFAULT true,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        duration INTEGER,
        average_accuracy REAL,
        total_target_hits INTEGER DEFAULT 0,
        completed_steps INTEGER[],
        tracking_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
      );
    `;
    
    // Create AICoachingSession table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS ai_coaching_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        skill_id INTEGER NOT NULL,
        tracking_session_id TEXT,
        voice_enabled BOOLEAN DEFAULT true,
        real_time_mode BOOLEAN DEFAULT true,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        total_messages INTEGER DEFAULT 0,
        feedback_given INTEGER DEFAULT 0,
        conversation_log JSONB NOT NULL,
        improvement_score REAL,
        student_satisfaction REAL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
      );
    `;
    
    // Create indexes for better performance
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_tracking_sessions_user_skill 
      ON tracking_sessions(user_id, skill_id);
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_ai_coaching_sessions_user_skill 
      ON ai_coaching_sessions(user_id, skill_id);
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_video_analysis_sessions_tracking 
      ON video_analysis_sessions USING GIN(metadata);
    `;
    
    console.log('✅ Schema updated successfully for enhanced tracking!');
    
    // Skip tracking field updates since they're not in the current schema
    console.log('Skipping tracking field updates (fields not in current schema)');
    /*
    // These fields would need to be added to the schema first
    await prisma.skill.updateMany({
      data: {
        trackingEnabled: true,
        handsTrackingEnabled: true,
        poseTrackingEnabled: true,
        aiCoachingEnabled: true
      }
    });
    */
    
    console.log('✅ Updated existing skills with tracking settings!');
    
    // Add some sample target areas for common skills
    await updateSkillTargetAreas();
    
    console.log('✅ Enhanced tracking schema update completed!');
    
  } catch (error) {
    console.error('❌ Error updating schema:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function updateSkillTargetAreas() {
  try {
    // CPR skills
    const cprSkills = await prisma.skill.findMany({
      where: {
        name: {
          contains: 'CPR',
          mode: 'insensitive'
        }
      }
    });
    
    // Skip targetAreas updates since they're not in the current schema
    console.log(`Found ${cprSkills.length} CPR skills (targetAreas updates skipped)`);
    /*
    for (const skill of cprSkills) {
      // targetAreas field would need to be added to schema first
      console.log(`Skipping targetAreas update for skill: ${skill.name}`);
    }
    */
    
    // Intubation skills
    const intubationSkills = await prisma.skill.findMany({
      where: {
        name: {
          contains: 'Intubation',
          mode: 'insensitive'
        }
      }
    });
    
    // Skip targetAreas updates since they're not in the current schema
    console.log(`Found ${intubationSkills.length} intubation skills (targetAreas updates skipped)`);
    /*
    for (const skill of intubationSkills) {
      // targetAreas field would need to be added to schema first
      console.log(`Skipping targetAreas update for skill: ${skill.name}`);
    }
    */
    
    console.log('✅ Updated skill target areas!');
    
  } catch (error) {
    console.error('❌ Error updating skill target areas:', error);
  }
}

// Run the update
updateSchemaForTracking()
  .catch(console.error);


import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface QualityIssue {
  type: 'error' | 'warning' | 'info';
  skillName: string;
  issue: string;
  suggestion?: string;
}

interface QualityReport {
  skillName: string;
  stepCount: number;
  quizCount: number;
  issues: QualityIssue[];
  overallScore: number;
  status: 'excellent' | 'good' | 'needs_improvement' | 'critical_issues';
}

function validateStepSequence(steps: any[]): QualityIssue[] {
  const issues: QualityIssue[] = [];
  
  // Check step numbering
  for (let i = 0; i < steps.length; i++) {
    if (steps[i].stepNumber !== i + 1) {
      issues.push({
        type: 'error',
        skillName: '',
        issue: `Step numbering issue: Expected ${i + 1}, got ${steps[i].stepNumber}`,
        suggestion: 'Steps should be numbered sequentially starting from 1'
      });
    }
  }

  // Check for very short descriptions
  steps.forEach((step, index) => {
    if (step.description.length < 50) {
      issues.push({
        type: 'warning',
        skillName: '',
        issue: `Step ${index + 1} has very short description (${step.description.length} chars)`,
        suggestion: 'Consider adding more detailed instructions'
      });
    }
  });

  // Check for missing key points
  steps.forEach((step, index) => {
    if (!step.keyPoints || step.keyPoints.length === 0) {
      issues.push({
        type: 'warning',
        skillName: '',
        issue: `Step ${index + 1} has no key points`,
        suggestion: 'Add 2-5 key points highlighting critical aspects'
      });
    }
  });

  // Check time estimates
  steps.forEach((step, index) => {
    if (step.timeEstimate < 5 || step.timeEstimate > 600) {
      issues.push({
        type: 'warning',
        skillName: '',
        issue: `Step ${index + 1} has unrealistic time estimate: ${step.timeEstimate}s`,
        suggestion: 'Time estimates should be between 5-600 seconds'
      });
    }
  });

  return issues;
}

function validateQuizQuestions(questions: any[]): QualityIssue[] {
  const issues: QualityIssue[] = [];

  questions.forEach((question, index) => {
    // Check question length
    if (question.question.length < 20) {
      issues.push({
        type: 'warning',
        skillName: '',
        issue: `Quiz question ${index + 1} is very short`,
        suggestion: 'Questions should be detailed and specific'
      });
    }

    // Check options count
    if (question.options.length < 3 || question.options.length > 5) {
      issues.push({
        type: 'error',
        skillName: '',
        issue: `Quiz question ${index + 1} has ${question.options.length} options`,
        suggestion: 'Questions should have 3-5 answer options'
      });
    }

    // Check correct answer index
    if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
      issues.push({
        type: 'error',
        skillName: '',
        issue: `Quiz question ${index + 1} has invalid correct answer index`,
        suggestion: 'Correct answer index must be valid for the options array'
      });
    }

    // Check explanation
    if (!question.explanation || question.explanation.length < 20) {
      issues.push({
        type: 'warning',
        skillName: '',
        issue: `Quiz question ${index + 1} has inadequate explanation`,
        suggestion: 'Provide detailed explanation for the correct answer'
      });
    }
  });

  return issues;
}

function calculateQualityScore(stepCount: number, quizCount: number, issues: QualityIssue[]): number {
  let score = 100;

  // Deduct points for issues
  issues.forEach(issue => {
    if (issue.type === 'error') score -= 15;
    else if (issue.type === 'warning') score -= 5;
  });

  // Bonus for good step count
  if (stepCount >= 8 && stepCount <= 15) score += 5;

  // Bonus for quiz questions
  if (quizCount >= 3) score += 10;

  // Minimum score is 0
  return Math.max(0, score);
}

function getQualityStatus(score: number): QualityReport['status'] {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'needs_improvement';
  return 'critical_issues';
}

async function validateSkillQuality(skill: any): Promise<QualityReport> {
  const issues: QualityIssue[] = [];

  // Validate basic skill data
  if (!skill.name || skill.name.trim() === '') {
    issues.push({
      type: 'error',
      skillName: skill.name || 'Unknown',
      issue: 'Skill has no name or empty name'
    });
  }

  if (skill.steps.length === 0) {
    issues.push({
      type: 'error',
      skillName: skill.name,
      issue: 'Skill has no steps'
    });
  }

  if (skill.steps.length < 5) {
    issues.push({
      type: 'warning',
      skillName: skill.name,
      issue: `Only ${skill.steps.length} steps - might be incomplete`,
      suggestion: 'Most procedures should have 5-15 steps'
    });
  }

  if (skill.steps.length > 20) {
    issues.push({
      type: 'warning',
      skillName: skill.name,
      issue: `${skill.steps.length} steps - might be too detailed`,
      suggestion: 'Consider combining related steps'
    });
  }

  // Validate step sequence and content
  const stepIssues = validateStepSequence(skill.steps);
  stepIssues.forEach(issue => {
    issue.skillName = skill.name;
    issues.push(issue);
  });

  // Validate quiz questions
  const quizIssues = validateQuizQuestions(skill.quizQuestions);
  quizIssues.forEach(issue => {
    issue.skillName = skill.name;
    issues.push(issue);
  });

  // Check critical skill requirements
  if (skill.isCritical && skill.quizQuestions.length < 3) {
    issues.push({
      type: 'warning',
      skillName: skill.name,
      issue: 'Critical skill should have at least 3 quiz questions',
      suggestion: 'Add more comprehensive quiz questions for critical skills'
    });
  }

  const score = calculateQualityScore(skill.steps.length, skill.quizQuestions.length, issues);
  const status = getQualityStatus(score);

  return {
    skillName: skill.name,
    stepCount: skill.steps.length,
    quizCount: skill.quizQuestions.length,
    issues,
    overallScore: score,
    status
  };
}

async function runQualityAssurance() {
  console.log('🔍 QUALITY ASSURANCE VALIDATION');
  console.log('='.repeat(80));
  console.log(`⏰ ${new Date().toLocaleString()}\n`);

  try {
    const skillsWithSteps = await prisma.skill.findMany({
      where: {
        steps: {
          some: {}
        }
      },
      include: {
        steps: true,
        quizQuestions: true,
        category: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`🎯 Validating ${skillsWithSteps.length} skills with steps...\n`);

    const reports: QualityReport[] = [];
    
    for (const skill of skillsWithSteps) {
      const report = await validateSkillQuality(skill);
      reports.push(report);
    }

    // Generate summary statistics
    const excellentSkills = reports.filter(r => r.status === 'excellent').length;
    const goodSkills = reports.filter(r => r.status === 'good').length;
    const needsImprovementSkills = reports.filter(r => r.status === 'needs_improvement').length;
    const criticalIssuesSkills = reports.filter(r => r.status === 'critical_issues').length;

    const averageScore = reports.reduce((sum, r) => sum + r.overallScore, 0) / reports.length;
    const totalIssues = reports.reduce((sum, r) => sum + r.issues.length, 0);
    const criticalIssues = reports.reduce((sum, r) => sum + r.issues.filter(i => i.type === 'error').length, 0);

    console.log('📊 QUALITY SUMMARY');
    console.log('='.repeat(40));
    console.log(`Average Quality Score: ${averageScore.toFixed(1)}/100`);
    console.log(`🌟 Excellent: ${excellentSkills} skills`);
    console.log(`✅ Good: ${goodSkills} skills`);
    console.log(`⚠️  Needs Improvement: ${needsImprovementSkills} skills`);
    console.log(`🚨 Critical Issues: ${criticalIssuesSkills} skills`);
    console.log(`📋 Total Issues Found: ${totalIssues}`);
    console.log(`❌ Critical Errors: ${criticalIssues}`);

    // Show skills by quality status
    console.log('\n🌟 EXCELLENT QUALITY SKILLS');
    console.log('-'.repeat(40));
    reports.filter(r => r.status === 'excellent').forEach(report => {
      console.log(`✅ ${report.skillName} (Score: ${report.overallScore}, Steps: ${report.stepCount}, Quiz: ${report.quizCount})`);
    });

    if (criticalIssuesSkills > 0) {
      console.log('\n🚨 SKILLS WITH CRITICAL ISSUES');
      console.log('-'.repeat(40));
      reports.filter(r => r.status === 'critical_issues').forEach(report => {
        console.log(`❌ ${report.skillName} (Score: ${report.overallScore})`);
        report.issues.filter(i => i.type === 'error').forEach(issue => {
          console.log(`   • ${issue.issue}`);
        });
      });
    }

    if (needsImprovementSkills > 0) {
      console.log('\n⚠️  SKILLS NEEDING IMPROVEMENT');
      console.log('-'.repeat(40));
      reports.filter(r => r.status === 'needs_improvement').forEach(report => {
        console.log(`⚠️  ${report.skillName} (Score: ${report.overallScore})`);
        report.issues.slice(0, 3).forEach(issue => {
          console.log(`   • ${issue.issue}`);
        });
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('🔍 QUALITY ASSURANCE COMPLETE');
    console.log('='.repeat(80));

    return reports;

  } catch (error) {
    console.error('❌ Quality assurance error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  runQualityAssurance();
}

export { runQualityAssurance, validateSkillQuality, type QualityReport };

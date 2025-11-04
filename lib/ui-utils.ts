import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

/**
 * Status color mappings for skill completion status
 */
export const statusColorMap = {
  'COMPLETED': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  'MASTERED': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  'IN_PROGRESS': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  'NOT_STARTED': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
} as const;

/**
 * Difficulty level color mappings
 */
export const difficultyColorMap = {
  'BEGINNER': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  'INTERMEDIATE': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  'ADVANCED': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  'EXPERT': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
} as const;

/**
 * Priority level color mappings
 */
export const priorityColorMap = {
  'LOW': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  'MEDIUM': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  'HIGH': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  'CRITICAL': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
} as const;

/**
 * Get status badge color classes
 */
export function getStatusColor(status: string): string {
  return statusColorMap[status as keyof typeof statusColorMap] || statusColorMap.NOT_STARTED;
}

/**
 * Get difficulty badge color classes
 */
export function getDifficultyColor(difficulty: string): string {
  return difficultyColorMap[difficulty as keyof typeof difficultyColorMap] || difficultyColorMap.BEGINNER;
}

/**
 * Get priority badge color classes
 */
export function getPriorityColor(priority: string): string {
  return priorityColorMap[priority as keyof typeof priorityColorMap] || priorityColorMap.MEDIUM;
}

/**
 * Get trend icon based on value
 */
export function getTrendIcon(value: number) {
  if (value > 0) return TrendingUp;
  if (value < 0) return TrendingDown;
  return Activity;
}

/**
 * Get trend color class based on value
 */
export function getTrendColor(value: number): string {
  if (value > 0) return 'text-green-600 dark:text-green-400';
  if (value < 0) return 'text-red-600 dark:text-red-400';
  return 'text-gray-600 dark:text-gray-400';
}

/**
 * Get trend background color based on value
 */
export function getTrendBgColor(value: number): string {
  if (value > 0) return 'bg-green-50 dark:bg-green-900/10';
  if (value < 0) return 'bg-red-50 dark:bg-red-900/10';
  return 'bg-gray-50 dark:bg-gray-900/10';
}

/**
 * Format percentage with sign
 */
export function formatPercentage(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Get completion percentage color
 */
export function getCompletionColor(percentage: number): string {
  if (percentage >= 80) return 'text-green-600 dark:text-green-400';
  if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
  if (percentage >= 25) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

/**
 * Get progress bar color based on percentage
 */
export function getProgressBarColor(percentage: number): string {
  if (percentage >= 80) return 'bg-green-500';
  if (percentage >= 50) return 'bg-yellow-500';
  if (percentage >= 25) return 'bg-orange-500';
  return 'bg-red-500';
}

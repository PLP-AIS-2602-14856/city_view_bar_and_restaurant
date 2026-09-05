import { clsx, type ClassValue } from 'clsx';

/**
 * Merge conditional class names. Kept dependency-free of tailwind-merge for now —
 * add it later only if class-conflict bugs actually show up (e.g. two components
 * both setting padding).
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

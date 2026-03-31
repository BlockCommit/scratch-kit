/**
 * Utility functions for Scratch project processing
 */

export function getSpriteNames(project: any): string[] {
  return project.targets
    .filter((target: any) => !target.isStage)
    .map((target: any) => target.name);
}

export function getStage(project: any): any {
  return project.targets.find((target: any) => target.isStage);
}

export function getBlockCount(project: any): number {
  return project.targets.reduce((total: number, target: any) => {
    return total + Object.keys(target.blocks || {}).length;
  }, 0);
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function createHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}
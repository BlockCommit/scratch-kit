/**
 * Parser for Scratch .sb3 projects
 */

import JSZip from 'jszip';

export interface ScratchProject {
  targets: any[];
  extensions: string[];
  meta: {
    semver: string;
    vm: string;
    agent: string;
  };
}

export async function parseSb3File(filePath: string): Promise<ScratchProject> {
  const fs = await import('fs/promises');
  const data = await fs.readFile(filePath);
  const zip = await JSZip.loadAsync(data);
  
  const projectJson = await zip.file('project.json')?.async('text');
  if (!projectJson) {
    throw new Error('Invalid .sb3 file: project.json not found');
  }
  
  return JSON.parse(projectJson);
}

export function validateProject(project: ScratchProject): boolean {
  return (
    Array.isArray(project.targets) &&
    Array.isArray(project.extensions) &&
    !!project.meta?.semver &&
    !!project.meta?.vm
  );
}
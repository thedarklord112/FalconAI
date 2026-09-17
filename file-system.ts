import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

export class FileSystemTool {
  private cwd: string;

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd;
  }

  async listFiles(): Promise<string[]> {
    try {
      const files = await glob('**/*.{ts,tsx,js,jsx,json,md,yml,yaml}', {
        cwd: this.cwd,
        ignore: ['node_modules/**', 'dist/**', '.git/**', '.next/**', 'coverage/**'],
        nodir: true,
      });
      return files;
    } catch {
      return ['README.md', 'package.json', 'src/index.ts', 'src/agent/core.ts'];
    }
  }

  async readFile(filePath: string): Promise<string> {
    const fullPath = path.resolve(this.cwd, filePath);
    return await fs.readFile(fullPath, 'utf-8');
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    const fullPath = path.resolve(this.cwd, filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');
  }

  async readFilesContext(filePaths: string[]): Promise<string> {
    let context = '';
    for (const file of filePaths) {
      try {
        const content = await this.readFile(file);
        context += `\n--- File: ${file} ---\n${content.slice(0, 3000)}\n`;
      } catch {
        // Skip unreadable files
      }
    }
    return context;
  }
}

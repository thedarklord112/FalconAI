import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface TestResult {
  passed: boolean;
  output: string;
  exitCode: number;
}

export class TestRunnerTool {
  async runTests(command: string = 'npm test'): Promise<TestResult> {
    try {
      const { stdout, stderr } = await execAsync(command, { timeout: 30000 });
      return {
        passed: true,
        output: stdout || stderr,
        exitCode: 0
      };
    } catch (error: any) {
      return {
        passed: false,
        output: error?.stdout || error?.stderr || error?.message,
        exitCode: error?.code || 1
      };
    }
  }

  async runLint(): Promise<TestResult> {
    return this.runTests('npm run lint');
  }
}

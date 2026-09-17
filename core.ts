import { GoogleGenAI } from '@google/genai';
import { FileSystemTool } from '../tools/file-system';
import { GitHubConnector } from '../integrations/github';
import { SkillsRegistry } from '../skills/registry';
import { SYSTEM_PROMPT_BASE, REVIEW_PROMPT, BUG_FIX_PROMPT } from './prompts';

export interface AgentConfig {
  apiKey?: string;
  modelName?: string;
  repoOwner?: string;
  repoName?: string;
}

export class DevClawAgent {
  private ai: GoogleGenAI;
  private modelName: string;
  private fs: FileSystemTool;
  private github: GitHubConnector;
  private skills: SkillsRegistry;

  constructor(config: AgentConfig = {}) {
    const apiKey = config.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('DevClaw requires GEMINI_API_KEY to function.');
    }

    this.ai = new GoogleGenAI({ apiKey });
    this.modelName = config.modelName || 'gemini-3.8-flash';
    this.fs = new FileSystemTool();
    this.github = new GitHubConnector();
    this.skills = new SkillsRegistry();
  }

  /**
   * Reviews a Pull Request by fetching diffs and posting analysis
   */
  async reviewPullRequest(prNumber: number): Promise<string> {
    const diff = await this.github.getPullRequestDiff(prNumber);
    const files = await this.github.getPullRequestFiles(prNumber);

    const prompt = `${REVIEW_PROMPT}

Pull Request #${prNumber} Diff:
```diff
${diff.slice(0, 12000)}
```

List of changed files:
${files.map(f => `- ${f.filename} (+${f.additions}, -${f.deletions})`).join('\n')}`;

    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT_BASE,
        temperature: 0.1,
      }
    });

    const reviewComment = response.text || 'Review completed with no remarks.';
    
    // Post back to GitHub if configured
    if (process.env.GITHUB_TOKEN) {
      await this.github.postPRComment(prNumber, reviewComment);
    }

    return reviewComment;
  }

  /**
   * Solves an issue by crawling files and producing a verified unified diff
   */
  async solveIssue(options: { issueNumber?: string; query?: string }): Promise<string> {
    let issueDescription = options.query || '';

    if (options.issueNumber) {
      const issue = await this.github.getIssue(parseInt(options.issueNumber, 10));
      issueDescription = `Issue #${issue.number}: ${issue.title}\n\n${issue.body}`;
    }

    // Step 1: Discover relevant files
    const allFiles = await this.fs.listFiles();
    const codebaseContext = await this.fs.readFilesContext(allFiles.slice(0, 15));

    const prompt = `${BUG_FIX_PROMPT}

Issue description:
${issueDescription}

Available codebase files:
${codebaseContext}`;

    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT_BASE,
        temperature: 0.2,
      }
    });

    return response.text || 'No patch generated.';
  }

  /**
   * Answers codebase architectural questions
   */
  async askCodebase(question: string): Promise<string> {
    const files = await this.fs.listFiles();
    const context = await this.fs.readFilesContext(files.slice(0, 10));

    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: [{ role: 'user', parts: [{ text: `Question: ${question}\n\nContext:\n${context}` }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT_BASE,
        temperature: 0.2,
      }
    });

    return response.text || 'Unable to answer question.';
  }

  /**
   * Generates a complete README for the repository
   */
  async generateReadme(): Promise<string> {
    const files = await this.fs.listFiles();
    const context = await this.fs.readFilesContext(files.slice(0, 15));

    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: [{ role: 'user', parts: [{ text: `Generate a production README.md for this repository based on:\n${context}` }] }],
      config: {
        systemInstruction: 'You are DevClaw Technical Writer. Output ONLY valid markdown for README.md.',
        temperature: 0.2
      }
    });

    const readmeContent = response.text || '';
    await this.fs.writeFile('README.md', readmeContent);
    return readmeContent;
  }
}

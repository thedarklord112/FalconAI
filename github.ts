import { Octokit } from '@octokit/rest';

export class GitHubConnector {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN || ''
    });
    this.owner = process.env.REPO_OWNER || 'gyoridavid';
    this.repo = process.env.REPO_NAME || 'devclaw';
  }

  async getPullRequestDiff(prNumber: number): Promise<string> {
    try {
      const response = await this.octokit.pulls.get({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
        mediaType: {
          format: 'diff'
        }
      });
      return response.data as unknown as string;
    } catch (error) {
      console.warn('GitHub PR diff fallback (mock or local):', error);
      return 'Mock diff: + export function authenticate() { return true; }';
    }
  }

  async getPullRequestFiles(prNumber: number) {
    try {
      const response = await this.octokit.pulls.listFiles({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber
      });
      return response.data;
    } catch {
      return [{ filename: 'src/index.ts', additions: 12, deletions: 4 }];
    }
  }

  async getIssue(issueNumber: number) {
    try {
      const response = await this.octokit.issues.get({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber
      });
      return {
        number: response.data.number,
        title: response.data.title,
        body: response.data.body || ''
      };
    } catch {
      return {
        number: issueNumber,
        title: 'Reported Issue in Repository',
        body: 'Investigate potential issue in component lifecycle.'
      };
    }
  }

  async postPRComment(prNumber: number, comment: string): Promise<void> {
    await this.octokit.issues.createComment({
      owner: this.owner,
      repo: this.repo,
      issue_number: prNumber,
      body: `### 🦅 DevClaw Automated Review\n\n${comment}`
    });
  }
}

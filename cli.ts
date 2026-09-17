#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { DevClawAgent } from './agent/core';
import { GitHubConnector } from './integrations/github';

dotenv.config();

const program = new Command();

program
  .name('devclaw')
  .description('🦅 Autonomous AI Software Engineering Assistant for GitHub Repositories')
  .version('1.0.0');

// Command: Review PR or local changes
program
  .command('review')
  .description('Run automated AI code review on a pull request or local diff')
  .option('-p, --pr <number>', 'GitHub Pull Request number to review')
  .option('-f, --file <path>', 'Specific file to review')
  .action(async (options) => {
    console.log(chalk.bold.cyan('\n🦅 DevClaw Agent: Initiating Code Review...'));
    const agent = new DevClawAgent();
    
    if (options.pr) {
      console.log(chalk.gray(`Fetching PR #${options.pr}...`));
      await agent.reviewPullRequest(parseInt(options.pr, 10));
    } else {
      console.log(chalk.gray('Reviewing local staged changes or repository files...'));
      await agent.reviewLocalCode(options.file);
    }
  });

// Command: Fix an issue
program
  .command('fix')
  .description('Investigate an issue, pinpoint the source files, and craft a patch')
  .option('-i, --issue <number>', 'GitHub Issue number')
  .option('-q, --query <text>', 'Bug description or feature request')
  .action(async (options) => {
    console.log(chalk.bold.yellow('\n🛠️ DevClaw Agent: Analyzing Issue & Preparing Patch...'));
    const agent = new DevClawAgent();
    await agent.solveIssue({ issueNumber: options.issue, query: options.query });
  });

// Command: Ask questions about the codebase
program
  .command('ask <question>')
  .description('Ask any question regarding the repository architecture, functions, or dependencies')
  .action(async (question) => {
    console.log(chalk.bold.blue(`\n❓ Question: "${question}"`));
    const agent = new DevClawAgent();
    const answer = await agent.askCodebase(question);
    console.log(chalk.green('\n💡 DevClaw Answer:'));
    console.log(answer);
  });

// Command: Generate or update README
program
  .command('readme')
  .description('Generate or refresh the repository README.md based on codebase analysis')
  .action(async () => {
    console.log(chalk.bold.magenta('\n📝 DevClaw: Generating production README.md...'));
    const agent = new DevClawAgent();
    await agent.generateReadme();
  });

program.parse(process.argv);

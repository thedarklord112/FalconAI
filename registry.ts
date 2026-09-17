import fs from 'fs/promises';
import path from 'path';

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  path: string;
  rules: string[];
}

export class SkillsRegistry {
  private skills: Map<string, SkillDefinition> = new Map();

  constructor() {
    this.registerBuiltins();
  }

  private registerBuiltins() {
    this.skills.set('pr-reviewer', {
      id: 'pr-reviewer',
      name: 'Pull Request Reviewer',
      description: 'Comprehensive code review assessing logic, security, and performance.',
      path: 'skills/pr-reviewer/SKILL.md',
      rules: ['Enforce OWASP standards', 'Check test coverage', 'Highlight breaking changes']
    });

    this.skills.set('bug-fixer', {
      id: 'bug-fixer',
      name: 'Autonomous Bug Fixer',
      description: 'Finds root causes, modifies files, and verifies patches against tests.',
      path: 'skills/bug-fixer/SKILL.md',
      rules: ['Minimal diff footprint', 'Add regression test', 'Validate imports']
    });

    this.skills.set('docs-architect', {
      id: 'docs-architect',
      name: 'Documentation Architect',
      description: 'Maintains README.md, API specs, and automated changelogs.',
      path: 'skills/docs-architect/SKILL.md',
      rules: ['Keep install commands verified', 'Update badge versions', 'Include architecture diagrams']
    });
  }

  getSkill(id: string): SkillDefinition | undefined {
    return this.skills.get(id);
  }

  listSkills(): SkillDefinition[] {
    return Array.from(this.skills.values());
  }
}

/**
 * GitHub synchronization for community methodologies
 */

import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';
import type { Methodology } from '../types/methodology.js';

export interface GitHubSyncConfig {
  repo: string;
  token?: string;
  localDir: string;
  autoSync: boolean;
  syncInterval?: number;
}

export class GitHubSync {
  private octokit: Octokit;
  private config: GitHubSyncConfig;
  private lastSync: Date | null = null;
  private syncTimer: NodeJS.Timeout | null = null;

  constructor(config: GitHubSyncConfig) {
    this.config = config;

    this.octokit = new Octokit({
      auth: config.token || process.env.GITHUB_TOKEN,
    });

    if (this.config.autoSync) {
      this.startAutoSync();
    }
  }

  private startAutoSync() {
    this.syncFromGitHub().catch(err => {
      console.error('Initial sync failed:', err);
    });

    if (this.config.syncInterval && this.config.syncInterval > 0) {
      this.syncTimer = setInterval(() => {
        this.syncFromGitHub().catch(err => {
          console.error('Auto-sync failed:', err);
        });
      }, this.config.syncInterval * 60 * 1000);
    }
  }

  stopAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  async syncFromGitHub(): Promise<{
    added: string[];
    updated: string[];
    errors: string[];
  }> {
    const [owner, repo] = this.config.repo.split('/');
    const added: string[] = [];
    const updated: string[] = [];
    const errors: string[] = [];

    try {
      console.error(`Syncing methodologies from ${this.config.repo}...`);

      const { data: contents } = await this.octokit.repos.getContent({
        owner,
        repo,
        path: 'methodologies',
      });

      if (!Array.isArray(contents)) {
        throw new Error('Methodologies directory not found');
      }

      if (!fs.existsSync(this.config.localDir)) {
        fs.mkdirSync(this.config.localDir, { recursive: true });
      }

      for (const file of contents) {
        if (file.type === 'file' && file.name.endsWith('.json')) {
          try {
            await this.syncMethodologyFile(owner, repo, file.path, added, updated);
          } catch (err) {
            const error = err instanceof Error ? err.message : String(err);
            errors.push(`${file.name}: ${error}`);
          }
        }
      }

      this.lastSync = new Date();
      console.error(`Sync complete: ${added.length} added, ${updated.length} updated`);

      return { added, updated, errors };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      console.error('GitHub sync failed:', error);
      throw new Error(`Failed to sync: ${error}`);
    }
  }

  private async syncMethodologyFile(
    owner: string,
    repo: string,
    filePath: string,
    added: string[],
    updated: string[]
  ): Promise<void> {
    const { data: fileData } = await this.octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
    });

    if ('content' in fileData && fileData.type === 'file') {
      const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
      const methodology = JSON.parse(content) as Methodology;

      const localPath = path.join(this.config.localDir, path.basename(filePath));
      const isUpdate = fs.existsSync(localPath);

      fs.writeFileSync(localPath, JSON.stringify(methodology, null, 2), 'utf-8');

      if (isUpdate) {
        updated.push(methodology.id);
      } else {
        added.push(methodology.id);
      }
    }
  }

  getSyncStatus(): {
    lastSync: Date | null;
    autoSyncEnabled: boolean;
    repo: string;
  } {
    return {
      lastSync: this.lastSync,
      autoSyncEnabled: this.config.autoSync,
      repo: this.config.repo,
    };
  }

  async forceSync(): Promise<void> {
    await this.syncFromGitHub();
  }
}

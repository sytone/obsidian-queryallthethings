import {Service} from '@ophidian/core';
import {LoggingService} from 'lib/LoggingService';
import {Plugin} from 'obsidian';

export interface IRelease {
  version: string;
  body: string;
}

export class ReleaseNotes extends Service {
  plugin = this.use(Plugin);
  logger = this.use(LoggingService).getLogger('Qatt.ReleaseNotes');

  private readonly notes: Map<string, string>;

  constructor() {
    super();
    this.notes = new Map<string, string>();
  }

  addVersion(version: string, changes: string) {
    this.notes.set(version, changes);
  }

  getChangesSince(version: string): IRelease[] {
    const changes: IRelease[] = [];

    let foundVersion = false;
    for (const [key, value] of this.notes) {
      if (foundVersion) {
        changes.push({
          version: key,
          body: value,
        });
      }

      if (key === version) {
        foundVersion = true;
      }
    }

    return changes.reverse();
  }
}

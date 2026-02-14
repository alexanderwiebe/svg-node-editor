import { computed, Signal } from '@angular/core';
import { Workspace } from '../models/workspace.model';

export function selectAllWorkspaces(workspaces: Signal<Workspace[]>): Signal<Workspace[]> {
  return computed(() => workspaces());
}

export function selectWorkspacesCount(workspaces: Signal<Workspace[]>): Signal<number> {
  return computed(() => workspaces().length);
}

export function selectAllTags(workspaces: Signal<Workspace[]>): Signal<string[]> {
  return computed(() => {
    const tagSet = new Set<string>();
    workspaces().forEach(workspace => {
      workspace.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  });
}

export function selectTagsWithCount(workspaces: Signal<Workspace[]>): Signal<Array<{ tag: string; count: number }>> {
  return computed(() => {
    const tagCounts = new Map<string, number>();
    workspaces().forEach(workspace => {
      workspace.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  });
}

export function selectWorkspacesByTag(workspaces: Signal<Workspace[]>, tags: string[]): Signal<Workspace[]> {
  return computed(() => {
    if (tags.length === 0) {
      return workspaces();
    }
    return workspaces().filter(workspace =>
      tags.every(tag => workspace.tags.includes(tag))
    );
  });
}

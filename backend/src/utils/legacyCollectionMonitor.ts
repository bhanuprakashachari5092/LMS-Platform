/**
 * KAIZENQ V2 — Lightweight In-Memory Legacy Access Monitoring
 * 
 * Tracks any unexpected access attempts to deprecated top-level collections
 * (/modules, /lessons) during the 7-day monitoring window.
 * 
 * ZERO PII logged. No external database or Redis required.
 */

export interface LegacyAccessEvent {
  timestamp: string;
  collection: 'modules' | 'lessons';
  operation: 'read' | 'write' | 'delete';
  source?: string;
}

class LegacyCollectionMonitor {
  private events: LegacyAccessEvent[] = [];
  private readonly MAX_EVENTS = 500;

  public recordAccess(collection: 'modules' | 'lessons', operation: 'read' | 'write' | 'delete' = 'read', source = 'unknown'): void {
    const event: LegacyAccessEvent = {
      timestamp: new Date().toISOString(),
      collection,
      operation,
      source,
    };

    this.events.push(event);
    if (this.events.length > this.MAX_EVENTS) {
      this.events.shift();
    }

    console.warn(`[LEGACY MONITOR WARNING] Unexpected access to deprecated collection "/${collection}" [op: ${operation}, src: ${source}]`);
  }

  public getStats(): {
    totalEvents: number;
    moduleAccessCount: number;
    lessonAccessCount: number;
    recentEvents: LegacyAccessEvent[];
  } {
    const moduleAccessCount = this.events.filter((e) => e.collection === 'modules').length;
    const lessonAccessCount = this.events.filter((e) => e.collection === 'lessons').length;

    return {
      totalEvents: this.events.length,
      moduleAccessCount,
      lessonAccessCount,
      recentEvents: this.events.slice(-10),
    };
  }

  public clear(): void {
    this.events = [];
  }
}

export const legacyCollectionMonitor = new LegacyCollectionMonitor();

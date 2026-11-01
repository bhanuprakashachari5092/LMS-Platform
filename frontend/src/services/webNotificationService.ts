// Web Notification Service
// Handles native Browser Notification API, permissions, synthetic Web Audio chime, and action clicks.

import { toast } from 'sonner';

class WebNotificationService {
  private audioCtx: AudioContext | null = null;
  private NOTIFIED_CACHE_KEY = 'kaizenq_web_notified_classes_v1';

  /**
   * Check if the browser supports the HTML5 Notification API
   */
  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window && typeof window.Notification !== 'undefined';
  }

  /**
   * Get the current notification permission ('granted' | 'denied' | 'default')
   */
  public getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    try {
      return Notification.permission;
    } catch {
      return 'denied';
    }
  }

  /**
   * Request user permission for browser web notifications
   */
  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      toast.info('🔔 Web notifications active in-app on this device.');
      this.playChime();
      return 'granted';
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('🔔 Web Notifications enabled!');
        this.playChime();
      } else if (permission === 'denied') {
        toast.info('Notifications blocked in browser. In-app alerts remain active.');
      }
      return permission;
    } catch (err) {
      console.warn('[WebNotificationService] Permission error:', err);
      return 'denied';
    }
  }

  /**
   * Synthesize a clean, pleasant notification chime using Web Audio API
   * Zero external MP3/audio file dependencies!
   */
  public playChime(urgent = false): void {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx || this.audioCtx.state === 'suspended') {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      const now = this.audioCtx.currentTime;

      // Note 1: 523.25 Hz (C5)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Note 2: 659.25 Hz (E5) or 783.99 Hz (G5)
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(urgent ? 880 : 659.25, now + 0.12);
      gain2.gain.setValueAtTime(0.15, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.55);

      if (urgent) {
        // High alert Note 3: 1046.50 Hz (C6)
        const osc3 = this.audioCtx.createOscillator();
        const gain3 = this.audioCtx.createGain();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(1046.5, now + 0.25);
        gain3.gain.setValueAtTime(0.18, now + 0.25);
        gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc3.connect(gain3);
        gain3.connect(this.audioCtx.destination);
        osc3.start(now + 0.25);
        osc3.stop(now + 0.7);
      }
    } catch {
      // Audio autoplay policy might block without prior interaction; fail silently
    }
  }

  private getNotifiedClassIds(): Set<string> {
    try {
      const raw = localStorage.getItem(this.NOTIFIED_CACHE_KEY);
      if (raw) return new Set(JSON.parse(raw));
    } catch {}
    return new Set();
  }

  private markClassNotified(key: string): void {
    try {
      const set = this.getNotifiedClassIds();
      set.add(key);
      localStorage.setItem(this.NOTIFIED_CACHE_KEY, JSON.stringify(Array.from(set)));
    } catch {}
  }

  /**
   * Display a native system/browser notification
   */
  public sendNotification(
    title: string,
    options: {
      body: string;
      tag?: string;
      url?: string;
      urgent?: boolean;
      icon?: string;
    }
  ): boolean {
    try {
      this.playChime(options.urgent);

      if (!this.isSupported()) return false;
      let permission: string = 'denied';
      try {
        permission = Notification.permission;
      } catch {
        return false;
      }
      if (permission !== 'granted') return false;

      const notif = new Notification(title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        tag: options.tag,
        requireInteraction: options.urgent || false,
      });

      notif.onclick = () => {
        window.focus();
        if (options.url) {
          window.location.href = options.url;
        }
        notif.close();
      };

      return true;
    } catch (e) {
      console.warn('[WebNotificationService] Failed to send web notification:', e);
      return false;
    }
  }

  /**
   * Notify students when a new faculty instructor is onboarded by Administrator
   */
  public notifyInstructorOnboarded(instructorName: string, specialty?: string): void {
    if (!instructorName) return;
    try {
      const cacheKey = `inst_onboard_${instructorName.toLowerCase().replace(/\s+/g, '_')}`;
      if (this.getNotifiedClassIds().has(cacheKey)) return;
      this.markClassNotified(cacheKey);

      const title = `👨‍🏫 New Assigned Instructor: ${instructorName}`;
      const body = `${instructorName} has joined the faculty for ${specialty || 'Technical Studies'}.`;
      const targetUrl = '/dashboard/courses';

      this.sendNotification(title, {
        body,
        tag: cacheKey,
        url: targetUrl,
        urgent: false,
      });

      toast.info(`👨‍🏫 New Assigned Instructor: ${instructorName}`, {
        description: `Specialty: ${specialty || 'Technical Studies'} • Check available courses.`,
        duration: 8000,
        action: {
          label: 'View Courses',
          onClick: () => {
            window.location.href = targetUrl;
          },
        },
      });
    } catch (err) {
      console.warn('[WebNotificationService] notifyInstructorOnboarded error:', err);
    }
  }
}

export const webNotificationService = new WebNotificationService();

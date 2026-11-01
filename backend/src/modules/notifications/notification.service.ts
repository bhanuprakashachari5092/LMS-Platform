import { NotificationRepository, IDurableNotification } from './notification.repository';
import logger from '../../config/logger';

export class NotificationService {
  private notificationRepository: NotificationRepository;

  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  public async createNotification(notification: IDurableNotification): Promise<void> {
    try {
      await this.notificationRepository.saveNotification(notification);
    } catch (err: any) {
      logger.error('[NOTIFICATION SERVICE] Error creating notification:', err?.message || err);
      throw err;
    }
  }

  public async getUserNotifications(userId: string, limitCount: number = 50): Promise<IDurableNotification[]> {
    return this.notificationRepository.getNotificationsForUser(userId, limitCount);
  }

  public async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    return this.notificationRepository.markAsRead(notificationId, userId);
  }

  public async markAllAsRead(userId: string): Promise<number> {
    return this.notificationRepository.markAllAsRead(userId);
  }

  public async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.getUnreadCount(userId);
  }
}

export const notificationService = new NotificationService();

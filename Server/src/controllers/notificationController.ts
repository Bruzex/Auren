import { Response } from 'express';
import { Notification } from '../models/Notification.js';
import { AuthRequest } from '../middleware/auth.js';

export async function getNotifications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const currentUserId = req.user!._id;

    const notifications = await Notification.find({ recipient: currentUserId })
      .sort({ createdAt: -1 })
      .limit(60)
      .populate('sender', 'username fullName avatar isOnline lastSeen');

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const formatted = notifications.map((n: any) => {
      const isToday = new Date(n.createdAt) >= startOfToday;
      const sender = n.sender;

      let text = '';
      switch (n.type) {
        case 'follow_request':
          text = 'requested to follow you';
          break;
        case 'follow_accept':
          text = 'accepted your follow request';
          break;
        case 'follow':
          text = 'started following you';
          break;
        case 'story_view':
          text = 'viewed your story';
          break;
        case 'story_like':
          text = 'liked your story';
          break;
        case 'reply':
          text = 'replied to your story';
          break;
        case 'mention':
          text = 'mentioned you in a story';
          break;
        default:
          text = 'interacted with your profile';
      }

      return {
        id: n.id,
        group: isToday ? 'Today' : 'This week',
        kind: n.type,
        userIds: sender ? [sender.id] : [],
        user: sender
          ? {
              id: sender.id,
              name: sender.fullName,
              username: sender.username,
              avatar: sender.avatar,
            }
          : undefined,
        text,
        read: n.read,
        time: n.createdAt,
        data: n.data,
      };
    });

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching notifications',
    });
  }
}

export async function markAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const currentUserId = req.user!._id;
    const { id } = req.params;

    await Notification.findOneAndUpdate(
      { _id: id, recipient: currentUserId },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating notification',
    });
  }
}

export async function markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const currentUserId = req.user!._id;

    await Notification.updateMany(
      { recipient: currentUserId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating notifications',
    });
  }
}


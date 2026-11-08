import { Response } from 'express';
import mongoose from 'mongoose';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';
import { getIO } from '../sockets/index.js';
import { processUploadedFile } from '../middleware/upload.js';

export async function getConversations(req: AuthRequest, res: Response): Promise<void> {
  try {
    const currentUserId = req.user!._id;

    const conversations = await Conversation.find({
      participants: currentUserId,
    })
      .sort({ updatedAt: -1 })
      .populate('participants', 'username fullName avatar isOnline lastSeen');

    const formatted = conversations.map((conv) => {
      const otherUser: any = conv.participants.find(
        (p: any) => p._id.toString() !== currentUserId.toString()
      ) || conv.participants[0];

      const unread = conv.unreadCounts?.get(currentUserId.toString()) || 0;
      const isMuted = conv.mutedBy?.some((id) => id.toString() === currentUserId.toString());
      const lastFromMe = conv.lastMessage?.sender?.toString() === currentUserId.toString();

      return {
        id: conv.id,
        userId: otherUser?.id || '',
        user: {
          id: otherUser?.id || '',
          name: otherUser?.fullName || 'User',
          username: otherUser?.username || 'user',
          avatar: otherUser?.avatar || '',
          online: Boolean(otherUser?.isOnline),
          lastSeen: otherUser?.lastSeen,
        },
        lastMessage: conv.lastMessage?.text || '',
        time: conv.lastMessage?.createdAt || conv.updatedAt,
        unread,
        lastFromMe,
        muted: isMuted,
      };
    });

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching conversations',
    });
  }
}

export async function getOrCreateConversation(req: AuthRequest, res: Response): Promise<void> {
  try {
    const currentUserId = req.user!._id;
    const { userId: targetUserId } = req.params;

    if (currentUserId.toString() === targetUserId) {
      res.status(400).json({
        success: false,
        message: 'Cannot chat with yourself.',
      });
      return;
    }

    const targetUser = await User.findById(targetUserId).select(
      'username fullName avatar isOnline lastSeen followers following'
    );
    if (!targetUser) {
      res.status(404).json({
        success: false,
        message: 'Target user not found',
      });
      return;
    }

    // Mutual follow restriction: both users must follow each other
    const userFollowsTarget = req.user!.following.some(
      (id) => id.toString() === targetUser._id.toString()
    );
    const targetFollowsUser = targetUser.following.some(
      (id) => id.toString() === currentUserId.toString()
    );
    const isMutual = userFollowsTarget && targetFollowsUser;

    if (!isMutual) {
      res.status(403).json({
        success: false,
        message: 'You need to follow each other first before starting a chat.',
      });
      return;
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, targetUser._id], $size: 2 },
    }).populate('participants', 'username fullName avatar isOnline lastSeen');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, targetUser._id],
        unreadCounts: new Map([[currentUserId.toString(), 0], [targetUserId, 0]]),
      });
      await conversation.populate('participants', 'username fullName avatar isOnline lastSeen');
    }

    const unread = conversation.unreadCounts?.get(currentUserId.toString()) || 0;

    res.status(200).json({
      success: true,
      data: {
        id: conversation.id,
        userId: targetUser.id,
        user: {
          id: targetUser.id,
          name: targetUser.fullName,
          username: targetUser.username,
          avatar: targetUser.avatar,
          online: targetUser.isOnline,
          lastSeen: targetUser.lastSeen,
        },
        lastMessage: conversation.lastMessage?.text || '',
        time: conversation.lastMessage?.createdAt || conversation.updatedAt,
        unread,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving conversation',
    });
  }
}

export async function getMessages(req: AuthRequest, res: Response): Promise<void> {
  try {
    const currentUserId = req.user!._id;
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.some((p) => p.toString() === currentUserId.toString())) {
      res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied',
      });
      return;
    }

    const total = await Message.countDocuments({ conversation: conversationId });
    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('sender', 'username fullName avatar');

    // Return in chronological order
    const formatted = messages.reverse().map((msg: any) => ({
      id: msg.id,
      from: msg.sender?.id === currentUserId.toString() ? 'me' : 'them',
      text: msg.content,
      type: msg.type,
      mediaUrl: msg.mediaUrl,
      time: msg.createdAt,
      status: msg.seen ? 'read' : 'delivered',
      sender: {
        id: msg.sender?.id,
        name: msg.sender?.fullName,
        username: msg.sender?.username,
        avatar: msg.sender?.avatar,
      },
    }));

    res.status(200).json({
      success: true,
      data: {
        messages: formatted,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching messages',
    });
  }
}

export async function sendMessage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const currentUserId = req.user!._id;
    const { conversationId } = req.params;
    const { text, type = 'text' } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.some((p) => p.toString() === currentUserId.toString())) {
      res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied',
      });
      return;
    }

    let mediaUrl: string | undefined;
    if (req.file) {
      mediaUrl = await processUploadedFile(req.file, 'chat');
    }

    const content = text || (mediaUrl ? (type === 'image' ? 'Sent a photo' : 'Sent an attachment') : '');
    if (!content && !mediaUrl) {
      res.status(400).json({
        success: false,
        message: 'Message content cannot be empty',
      });
      return;
    }

    const message = await Message.create({
      sender: currentUserId,
      conversation: conversation._id,
      content,
      type: mediaUrl ? (req.file?.mimetype.startsWith('audio') ? 'voice' : 'image') : type,
      mediaUrl,
      seen: false,
      seenBy: [currentUserId],
    });

    // Update conversation
    conversation.lastMessage = {
      text: content,
      sender: currentUserId,
      createdAt: message.createdAt,
      type: message.type,
    };

    // Increment unread count for other participants
    conversation.participants.forEach((p) => {
      const pid = p.toString();
      if (pid !== currentUserId.toString()) {
        const current = conversation.unreadCounts?.get(pid) || 0;
        conversation.unreadCounts?.set(pid, current + 1);
      }
    });

    await conversation.save();

    const formattedMessage = {
      id: message.id,
      from: 'me',
      text: message.content,
      type: message.type,
      mediaUrl: message.mediaUrl,
      time: message.createdAt,
      status: 'delivered',
      senderId: req.user!.id,
      sender: {
        id: req.user!.id,
        name: req.user!.fullName,
        username: req.user!.username,
        avatar: req.user!.avatar,
      },
    };

    // Real-time broadcast
    try {
      const io = getIO();
      // Broadcast to active chat room
      io.to(`chat:${conversationId}`).emit('new_message', {
        ...formattedMessage,
        conversationId,
        senderId: req.user!.id,
      });

      // Notify each recipient in their personal room
      conversation.participants.forEach((p) => {
        if (p.toString() !== currentUserId.toString()) {
          io.to(`user:${p.toString()}`).emit('conversation_updated', {
            conversationId: conversation.id,
            lastMessage: content,
            time: message.createdAt,
            sender: {
              id: req.user!.id,
              name: req.user!.fullName,
            },
          });
        }
      });
    } catch { }

    res.status(201).json({
      success: true,
      data: formattedMessage,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending message',
    });
  }
}

export async function markConversationAsSeen(req: AuthRequest, res: Response): Promise<void> {
  try {
    const currentUserId = req.user!._id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      res.status(404).json({ success: false, message: 'Conversation not found' });
      return;
    }

    // Reset unread count for current user
    conversation.unreadCounts?.set(currentUserId.toString(), 0);
    await conversation.save();

    // Mark messages as seen
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: currentUserId },
        seen: false,
      },
      {
        $set: { seen: true },
        $addToSet: { seenBy: currentUserId },
      }
    );

    try {
      const io = getIO();
      io.to(`chat:${conversationId}`).emit('messages_seen', {
        conversationId,
        seenBy: currentUserId.toString(),
      });
    } catch { }

    res.status(200).json({
      success: true,
      message: 'Messages marked as seen',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error marking messages as seen',
    });
  }
}


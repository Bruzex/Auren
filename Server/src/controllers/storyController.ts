import { Response } from 'express';
import { Story } from '../models/Story.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { AuthRequest } from '../middleware/auth.js';
import { processUploadedFile } from '../middleware/upload.js';
import { getIO } from '../sockets/index.js';

export async function createStory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const currentUserId = req.user!._id;
    const {
      caption,
      mode = 'camera',
      textStyle = 'classic',
      textColor = '#FFFFFF',
      backgroundGradient = '',
      audience = 'story',
    } = req.body;

    let mediaUrl = '';
    if (req.file) {
      mediaUrl = await processUploadedFile(req.file, 'stories');
    } else if (req.body.mediaUrl) {
      mediaUrl = req.body.mediaUrl;
    }

    if (mode === 'camera' && !mediaUrl) {
      res.status(400).json({
        success: false,
        message: 'Camera story requires an image file or URL',
      });
      return;
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours TTL

    const story = await Story.create({
      user: currentUserId,
      mediaUrl,
      caption: caption || '',
      mode,
      textStyle,
      textColor,
      backgroundGradient,
      audience,
      viewers: [],
      expiresAt,
      isArchived: false,
    });

    // Populate user
    await story.populate('user', 'username fullName avatar isOnline');

    // Real-time broadcast to followers
    try {
      const io = getIO();
      const followers = req.user!.followers || [];
      followers.forEach((fid) => {
        io.to(`user:${fid.toString()}`).emit('new_story', {
          storyId: story.id,
          user: {
            id: req.user!.id,
            name: req.user!.fullName,
            username: req.user!.username,
            avatar: req.user!.avatar,
          },
        });
      });
    } catch {}

    res.status(201).json({
      success: true,
      message: 'Story published successfully',
      data: story,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating story',
    });
  }
}

export async function getStoriesFeed(req: AuthRequest, res: Response): Promise<void> {
  try {
    const currentUserId = req.user!._id;
    const followingIds = req.user?.following || [];

    // Feed includes followed users' stories + my own active stories
    const relevantUserIds = [...followingIds, currentUserId];

    const now = new Date();
    const activeStories = await Story.find({
      user: { $in: relevantUserIds },
      expiresAt: { $gt: now },
    })
      .sort({ createdAt: -1 })
      .populate('user', 'username fullName avatar isOnline lastSeen');

    // Group stories by user matching the frontend StoriesRow structure
    const groupedByUser = new Map<string, any>();

    for (const story of activeStories) {
      const u: any = story.user;
      if (!u) continue;

      const uid = u._id.toString();
      const hasViewed = story.viewers.some(
        (v) => v.user.toString() === currentUserId.toString()
      );

      if (!groupedByUser.has(uid)) {
        groupedByUser.set(uid, {
          userId: uid,
          user: {
            id: uid,
            name: u.fullName,
            username: u.username,
            avatar: u.avatar,
            online: u.isOnline,
          },
          stories: [],
          allViewed: true,
          latestTime: story.createdAt,
        });
      }

      const userGroup = groupedByUser.get(uid);
      userGroup.stories.push({
        id: story.id,
        image: story.mediaUrl || story.backgroundGradient,
        caption: story.caption,
        mode: story.mode,
        textStyle: story.textStyle,
        textColor: story.textColor,
        backgroundGradient: story.backgroundGradient,
        audience: story.audience,
        time: story.createdAt,
        viewed: hasViewed,
        viewsCount: story.viewers.length,
      });

      if (!hasViewed) {
        userGroup.allViewed = false;
      }
    }

    // Sort: current user first if they have stories, then unseen stories, then seen
    const sortedFeed = Array.from(groupedByUser.values()).sort((a, b) => {
      if (a.userId === currentUserId.toString()) return -1;
      if (b.userId === currentUserId.toString()) return 1;
      if (!a.allViewed && b.allViewed) return -1;
      if (a.allViewed && !b.allViewed) return 1;
      return new Date(b.latestTime).getTime() - new Date(a.latestTime).getTime();
    });

    res.status(200).json({
      success: true,
      data: sortedFeed,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching stories feed',
    });
  }
}

export async function getUserStories(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?._id;
    const now = new Date();

    const stories = await Story.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(60);

    const formatted = stories.map((s) => {
      const active = s.expiresAt > now;
      const hasViewed = currentUserId
        ? s.viewers.some((v) => v.user.toString() === currentUserId.toString())
        : false;

      return {
        id: s.id,
        image: s.mediaUrl || s.backgroundGradient,
        caption: s.caption,
        views: s.viewers.length,
        label: active ? 'Active' : 'Expired',
        active,
        viewed: hasViewed,
        time: s.createdAt,
        expiresAt: s.expiresAt,
      };
    });

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user stories',
    });
  }
}

export async function viewStory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const currentUserId = req.user!._id;
    const { id } = req.params;

    const story = await Story.findById(id);
    if (!story) {
      res.status(404).json({ success: false, message: 'Story not found' });
      return;
    }

    const alreadyViewed = story.viewers.some(
      (v) => v.user.toString() === currentUserId.toString()
    );

    if (!alreadyViewed) {
      story.viewers.push({
        user: currentUserId,
        viewedAt: new Date(),
      });
      await story.save();

      // If viewer isn't owner, optionally notify owner
      if (story.user.toString() !== currentUserId.toString()) {
        await Notification.create({
          recipient: story.user,
          sender: currentUserId,
          type: 'story_view',
          data: { storyId: story.id },
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Story view recorded',
      data: {
        viewsCount: story.viewers.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error recording story view',
    });
  }
}

export async function deleteStory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const currentUserId = req.user!._id;
    const { id } = req.params;

    const story = await Story.findOne({ _id: id, user: currentUserId });
    if (!story) {
      res.status(404).json({
        success: false,
        message: 'Story not found or you do not have permission to delete it',
      });
      return;
    }

    await Story.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Story deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting story',
    });
  }
}


import { Response } from 'express';
import mongoose from 'mongoose';
import { User, IUser } from '../models/User.js';
import { FollowRequest } from '../models/FollowRequest.js';
import { Notification } from '../models/Notification.js';
import { Story } from '../models/Story.js';
import { AuthRequest } from '../middleware/auth.js';
import { getIO } from '../sockets/index.js';

export async function searchUsers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const q = ((req.query.q as string) || '').trim();
    const currentUserId = req.user?._id;

    if (!q) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    const regex = new RegExp(q, 'i');
    const users = await User.find({
      $and: [
        { _id: { $ne: currentUserId } },
        { $or: [{ username: regex }, { fullName: regex }] },
      ],
    })
      .limit(20)
      .select('username fullName avatar bio isOnline lastSeen followers following isPrivate');

    // Determine follow status & mutuals for each user
    const results = await Promise.all(
      users.map(async (u) => {
        let followStatus: 'follow' | 'requested' | 'following' = 'follow';

        if (currentUserId) {
          if (u.followers.some((f) => f.toString() === currentUserId.toString())) {
            followStatus = 'following';
          } else {
            const hasPending = await FollowRequest.exists({
              from: currentUserId,
              to: u._id,
              status: 'pending',
            });
            if (hasPending) {
              followStatus = 'requested';
            }
          }
        }

        // Calculate mutual friends
        const myFollowingSet = new Set(req.user?.following.map((id) => id.toString()) || []);
        const mutuals = u.followers.filter((f) => myFollowingSet.has(f.toString())).length;

        return {
          id: u.id,
          name: u.fullName,
          username: u.username,
          avatar: u.avatar,
          bio: u.bio,
          online: u.isOnline,
          lastSeen: u.lastSeen,
          mutuals,
          followStatus,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error searching users',
    });
  }
}

export async function getSuggestedUsers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const currentUserId = req.user?._id;
    const followingIds = req.user?.following || [];

    const suggested = await User.find({
      _id: { $nin: [...followingIds, currentUserId] },
    })
      .limit(10)
      .select('username fullName avatar bio isOnline lastSeen followers isPrivate');

    const results = await Promise.all(
      suggested.map(async (u) => {
        let followStatus: 'follow' | 'requested' | 'following' = 'follow';
        if (currentUserId) {
          const hasPending = await FollowRequest.exists({
            from: currentUserId,
            to: u._id,
            status: 'pending',
          });
          if (hasPending) followStatus = 'requested';
        }

        const myFollowingSet = new Set(req.user?.following.map((id) => id.toString()) || []);
        const mutuals = u.followers.filter((f) => myFollowingSet.has(f.toString())).length;

        return {
          id: u.id,
          name: u.fullName,
          username: u.username,
          avatar: u.avatar,
          bio: u.bio,
          online: u.isOnline,
          lastSeen: u.lastSeen,
          mutuals,
          followStatus,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error getting suggested users',
    });
  }
}

export async function getUserProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { username } = req.params;
    const currentUserId = req.user?._id;

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    let followStatus: 'follow' | 'requested' | 'following' = 'follow';
    if (currentUserId && currentUserId.toString() !== user.id) {
      if (user.followers.some((f) => f.toString() === currentUserId.toString())) {
        followStatus = 'following';
      } else {
        const hasPending = await FollowRequest.exists({
          from: currentUserId,
          to: user._id,
          status: 'pending',
        });
        if (hasPending) followStatus = 'requested';
      }
    }

    const activeStoriesCount = await Story.countDocuments({
      user: user._id,
      expiresAt: { $gt: new Date() },
    });

    const myFollowingSet = new Set(req.user?.following.map((id) => id.toString()) || []);
    const mutuals = user.followers.filter((f) => myFollowingSet.has(f.toString())).length;

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.fullName,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        online: user.isOnline,
        lastSeen: user.lastSeen,
        isPrivate: user.isPrivate,
        mutuals,
        stats: {
          followersCount: user.followers.length,
          followingCount: user.following.length,
          storiesCount: activeStoriesCount,
        },
        followStatus,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user profile',
    });
  }
}

export async function toggleFollow(req: AuthRequest, res: Response): Promise<void> {
  try {
    const targetUserId = req.params.id;
    const currentUser = req.user!;

    if (currentUser.id === targetUserId) {
      res.status(400).json({
        success: false,
        message: 'You cannot follow yourself.',
      });
      return;
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      res.status(404).json({
        success: false,
        message: 'User to follow not found.',
      });
      return;
    }

    const isFollowing = currentUser.following.some(
      (id) => id.toString() === targetUserId
    );

    // If currently following -> Unfollow
    if (isFollowing) {
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetUserId
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== currentUser.id
      );

      await Promise.all([currentUser.save(), targetUser.save()]);

      res.status(200).json({
        success: true,
        message: `Unfollowed @${targetUser.username}`,
        data: { followStatus: 'follow' },
      });
      return;
    }

    // Check if there is already a pending request
    const existingRequest = await FollowRequest.findOne({
      from: currentUser._id,
      to: targetUser._id,
      status: 'pending',
    });

    if (existingRequest) {
      // Cancel request
      await FollowRequest.findByIdAndDelete(existingRequest._id);
      res.status(200).json({
        success: true,
        message: `Cancelled follow request to @${targetUser.username}`,
        data: { followStatus: 'follow' },
      });
      return;
    }

    // If target user is private -> Create Follow Request
    if (targetUser.isPrivate) {
      const request = await FollowRequest.create({
        from: currentUser._id,
        to: targetUser._id,
        status: 'pending',
      });

      // Notification to target user
      await Notification.create({
        recipient: targetUser._id,
        sender: currentUser._id,
        type: 'follow_request',
        data: { requestId: request._id },
      });

      // Emit live socket event to target user
      try {
        const io = getIO();
        io.to(`user:${targetUser.id}`).emit('new_notification', {
          type: 'follow_request',
          sender: {
            id: currentUser.id,
            name: currentUser.fullName,
            username: currentUser.username,
            avatar: currentUser.avatar,
          },
        });
      } catch {}

      res.status(200).json({
        success: true,
        message: `Sent follow request to @${targetUser.username}`,
        data: { followStatus: 'requested' },
      });
      return;
    }

    // Target user is public -> Follow immediately
    currentUser.following.push(targetUser._id);
    targetUser.followers.push(currentUser._id);

    await Promise.all([currentUser.save(), targetUser.save()]);

    // Send notification
    await Notification.create({
      recipient: targetUser._id,
      sender: currentUser._id,
      type: 'follow',
    });

    try {
      const io = getIO();
      io.to(`user:${targetUser.id}`).emit('new_notification', {
        type: 'follow',
        sender: {
          id: currentUser.id,
          name: currentUser.fullName,
          username: currentUser.username,
          avatar: currentUser.avatar,
        },
      });
    } catch {}

    res.status(200).json({
      success: true,
      message: `Now following @${targetUser.username}`,
      data: { followStatus: 'following' },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error toggling follow',
    });
  }
}

export async function getPendingRequests(req: AuthRequest, res: Response): Promise<void> {
  try {
    const requests = await FollowRequest.find({
      to: req.user!._id,
      status: 'pending',
    })
      .sort({ createdAt: -1 })
      .populate('from', 'username fullName avatar bio isOnline lastSeen followers');

    const results = requests.map((r: any) => {
      const sender = r.from;
      const myFollowingSet = new Set(req.user?.following.map((id) => id.toString()) || []);
      const mutuals = sender?.followers?.filter((f: any) => myFollowingSet.has(f.toString())).length || 0;

      return {
        id: r.id,
        userId: sender.id,
        user: {
          id: sender.id,
          name: sender.fullName,
          username: sender.username,
          avatar: sender.avatar,
          mutuals,
        },
        time: r.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching follow requests',
    });
  }
}

export async function acceptFollowRequest(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const request = await FollowRequest.findOne({
      _id: id,
      to: req.user!._id,
      status: 'pending',
    });

    if (!request) {
      res.status(404).json({
        success: false,
        message: 'Follow request not found or already resolved.',
      });
      return;
    }

    request.status = 'accepted';
    await request.save();

    const sender = await User.findById(request.from);
    const recipient = req.user!;

    if (sender) {
      if (!sender.following.some((fid) => fid.toString() === recipient.id)) {
        sender.following.push(recipient._id);
        await sender.save();
      }
      if (!recipient.followers.some((fid) => fid.toString() === sender.id)) {
        recipient.followers.push(sender._id);
        await recipient.save();
      }

      // Create notification
      await Notification.create({
        recipient: sender._id,
        sender: recipient._id,
        type: 'follow_accept',
      });

      try {
        const io = getIO();
        io.to(`user:${sender.id}`).emit('new_notification', {
          type: 'follow_accept',
          sender: {
            id: recipient.id,
            name: recipient.fullName,
            username: recipient.username,
            avatar: recipient.avatar,
          },
        });
      } catch {}
    }

    res.status(200).json({
      success: true,
      message: 'Follow request accepted.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error accepting request',
    });
  }
}

export async function rejectFollowRequest(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const request = await FollowRequest.findOne({
      _id: id,
      to: req.user!._id,
      status: 'pending',
    });

    if (!request) {
      res.status(404).json({
        success: false,
        message: 'Follow request not found or already resolved.',
      });
      return;
    }

    request.status = 'rejected';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Follow request rejected.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error rejecting request',
    });
  }
}

export async function getFollowers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate(
      'followers',
      'username fullName avatar bio isOnline lastSeen followers'
    );

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const followers = (user.followers as any[]).map((f) => ({
      id: f.id,
      name: f.fullName,
      username: f.username,
      avatar: f.avatar,
      bio: f.bio,
      online: f.isOnline,
      lastSeen: f.lastSeen,
    }));

    res.status(200).json({ success: true, data: followers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getFollowing(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate(
      'following',
      'username fullName avatar bio isOnline lastSeen followers'
    );

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const following = (user.following as any[]).map((f) => ({
      id: f.id,
      name: f.fullName,
      username: f.username,
      avatar: f.avatar,
      bio: f.bio,
      online: f.isOnline,
      lastSeen: f.lastSeen,
    }));

    res.status(200).json({ success: true, data: following });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}


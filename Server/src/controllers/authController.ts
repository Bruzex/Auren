import { Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { AuthRequest } from '../middleware/auth.js';
import { processUploadedFile } from '../middleware/upload.js';
import { Notification } from '../models/Notification.js';
import { Story } from '../models/Story.js';

export const registerSchema = z.object({
  body: z.object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username cannot exceed 30 characters')
      .regex(/^[a-zA-Z0-9._]+$/, 'Username can only contain letters, numbers, dots, and underscores'),
    email: z.string().email('Please provide a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    fullName: z.string().min(1, 'Full name is required').max(60),
    bio: z.string().max(200).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    usernameOrEmail: z.string().min(1, 'Username or email is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(1).max(60).optional(),
    bio: z.string().max(200).optional(),
    isPrivate: z.boolean().optional(),
    avatar: z.string().url().or(z.string().startsWith('/uploads/')).optional(),
  }),
});

export async function register(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { username, email, password, fullName, bio } = req.body;

    const existingUser = await User.findOne({
      $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
    });

    if (existingUser) {
      const field = existingUser.username === username.toLowerCase() ? 'Username' : 'Email';
      res.status(400).json({
        success: false,
        message: `${field} is already in use.`,
      });
      return;
    }

    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      fullName,
      bio: bio || '',
      isOnline: true,
      lastSeen: new Date(),
    });

    const token = generateToken({
      userId: user.id,
      username: user.username,
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        token,
        user,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
}

export async function login(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { usernameOrEmail, password } = req.body;
    const query = usernameOrEmail.toLowerCase();

    const user = await User.findOne({
      $or: [{ username: query }, { email: query }],
    }).select('+password');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.',
      });
      return;
    }

    // Set online
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    const token = generateToken({
      userId: user.id,
      username: user.username,
    });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        token,
        user: user.toJSON(),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = req.user!;
    const unreadNotificationsCount = await Notification.countDocuments({
      recipient: user._id,
      read: false,
    });

    const activeStoriesCount = await Story.countDocuments({
      user: user._id,
      expiresAt: { $gt: new Date() },
    });

    res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
        stats: {
          followersCount: user.followers.length,
          followingCount: user.following.length,
          storiesCount: activeStoriesCount,
          unreadNotificationsCount,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch current user',
    });
  }
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = req.user!;
    const { fullName, bio, isPrivate, avatar } = req.body;

    if (fullName !== undefined) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;
    if (isPrivate !== undefined) user.isPrivate = isPrivate;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile',
    });
  }
}

export async function uploadAvatar(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No avatar image file provided',
      });
      return;
    }

    const avatarUrl = await processUploadedFile(req.file, 'avatars');
    const user = req.user!;
    user.avatar = avatarUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      data: {
        avatar: avatarUrl,
        user: user.toJSON(),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload avatar',
    });
  }
}


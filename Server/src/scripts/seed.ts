import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Story } from '../models/Story.js';
import { AnonymousRoom } from '../models/AnonymousRoom.js';
import { Notification } from '../models/Notification.js';
import { FollowRequest } from '../models/FollowRequest.js';
import { ENV } from '../config/environment.js';
import { logger } from '../utils/logger.js';

const SAMPLE_USERS = [
  {
    username: 'julian',
    email: 'julian@auren.app',
    password: 'password123',
    fullName: 'Julian Reyes',
    bio: 'Designer in Lisbon. Quiet mornings, loud playlists, long walks by the water.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    isOnline: true,
  },
  {
    username: 'mayachen',
    email: 'maya@auren.app',
    password: 'password123',
    fullName: 'Maya Chen',
    bio: 'Curating spaces and collecting film frames.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    isOnline: true,
  },
  {
    username: 'leohart',
    email: 'leo@auren.app',
    password: 'password123',
    fullName: 'Leo Hart',
    bio: 'Film photography & ambient synth.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    isOnline: false,
  },
  {
    username: 'sofi.marin',
    email: 'sofia@auren.app',
    password: 'password123',
    fullName: 'Sofia Marín',
    bio: 'Architect. Light, shadows, concrete.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    isOnline: true,
  },
  {
    username: 'kai.n',
    email: 'kai@auren.app',
    password: 'password123',
    fullName: 'Kai Nakamura',
    bio: 'Generative systems & typography.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    isOnline: false,
  },
  {
    username: 'amara.o',
    email: 'amara@auren.app',
    password: 'password123',
    fullName: 'Amara Okafor',
    bio: 'Coffee roaster & trail runner.',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    isOnline: true,
  },
];

async function seed(): Promise<void> {
  try {
    logger.info('Connecting to MongoDB for seeding...');
    await mongoose.connect(ENV.MONGO_URI);
    logger.info('Connected. Clearing existing collections...');

    await Promise.all([
      User.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      Story.deleteMany({}),
      AnonymousRoom.deleteMany({}),
      Notification.deleteMany({}),
      FollowRequest.deleteMany({}),
    ]);

    logger.info('Creating sample users...');
    const createdUsers = await User.create(SAMPLE_USERS);
    const [julian, maya, leo, sofia, kai, amara] = createdUsers;

    // Follow relationships
    julian.following.push(maya._id, leo._id, sofia._id);
    julian.followers.push(maya._id, leo._id, amara._id);

    maya.following.push(julian._id, sofia._id);
    maya.followers.push(julian._id);

    leo.following.push(julian._id);
    leo.followers.push(julian._id);

    sofia.following.push(julian._id);
    sofia.followers.push(julian._id, maya._id);

    amara.following.push(julian._id);
    amara.followers.push(julian._id);

    await Promise.all(createdUsers.map((u) => u.save()));

    logger.info('Creating follow requests...');
    await FollowRequest.create([
      {
        from: kai._id,
        to: julian._id,
        status: 'pending',
      },
    ]);

    logger.info('Creating conversations and messages...');
    // Conversation 1: Julian & Maya
    const conv1 = await Conversation.create({
      participants: [julian._id, maya._id],
      unreadCounts: new Map([
        [julian.id, 2],
        [maya.id, 0],
      ]),
      lastMessage: {
        text: 'Sending you the photos from last night',
        sender: maya._id,
        createdAt: new Date(),
        type: 'text',
      },
    });

    await Message.create([
      {
        sender: maya._id,
        conversation: conv1._id,
        content: 'Last night was so good. That rooftop was unreal.',
        seen: true,
        seenBy: [julian._id, maya._id],
      },
      {
        sender: julian._id,
        conversation: conv1._id,
        content: 'Right? The light at sunset was perfect.',
        seen: true,
        seenBy: [julian._id, maya._id],
      },
      {
        sender: maya._id,
        conversation: conv1._id,
        content: 'Sending you the photos from last night',
        seen: false,
        seenBy: [maya._id],
      },
    ]);

    // Conversation 2: Julian & Sofia
    const conv2 = await Conversation.create({
      participants: [julian._id, sofia._id],
      unreadCounts: new Map([
        [julian.id, 0],
        [sofia.id, 0],
      ]),
      lastMessage: {
        text: 'Did you see the venue?',
        sender: sofia._id,
        createdAt: new Date(),
        type: 'text',
      },
    });

    await Message.create([
      {
        sender: julian._id,
        conversation: conv2._id,
        content: 'Booked the table for Friday — 8pm.',
        seen: true,
        seenBy: [julian._id, sofia._id],
      },
      {
        sender: sofia._id,
        conversation: conv2._id,
        content: 'Did you see the venue?',
        seen: true,
        seenBy: [julian._id, sofia._id],
      },
    ]);

    // Conversation 3: Julian & Leo
    const conv3 = await Conversation.create({
      participants: [julian._id, leo._id],
      unreadCounts: new Map([
        [julian.id, 0],
        [leo.id, 0],
      ]),
      lastMessage: {
        text: 'Haha, that’s exactly what I said',
        sender: julian._id,
        createdAt: new Date(),
        type: 'text',
      },
    });

    await Message.create([
      {
        sender: leo._id,
        conversation: conv3._id,
        content: 'Film cameras are totally back.',
        seen: true,
        seenBy: [julian._id, leo._id],
      },
      {
        sender: julian._id,
        conversation: conv3._id,
        content: 'Haha, that’s exactly what I said',
        seen: true,
        seenBy: [julian._id, leo._id],
      },
    ]);

    logger.info('Creating stories...');
    await Story.create([
      {
        user: maya._id,
        mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        caption: 'First light over the ocean',
        mode: 'camera',
        expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000),
        viewers: [{ user: julian._id, viewedAt: new Date() }],
      },
      {
        user: sofia._id,
        mediaUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
        caption: 'Geometry & quiet',
        mode: 'camera',
        expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000),
        viewers: [],
      },
      {
        user: leo._id,
        mode: 'text',
        caption: 'Late night sessions in the studio. Tape running.',
        backgroundGradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
        textStyle: 'editorial',
        textColor: '#FFFFFF',
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
        viewers: [],
      },
    ]);

    logger.info('Creating anonymous room...');
    await AnonymousRoom.create({
      code: 'NOX4LU',
      name: 'Midnight Thoughts',
      creator: julian._id,
      duration: '24h',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isActive: true,
      participants: [
        { alias: 'Moth 42', joinedAt: new Date() },
        { alias: 'Lumen 18', joinedAt: new Date() },
        { alias: 'Echo 77', joinedAt: new Date() },
      ],
      messages: [
        {
          id: 'msg-seed-1',
          alias: 'Moth 42',
          content: 'Anyone else awake watching the rain?',
          createdAt: new Date(Date.now() - 15 * 60 * 1000),
        },
        {
          id: 'msg-seed-2',
          alias: 'Lumen 18',
          content: 'Always. Listening to ambient tracks right now.',
          createdAt: new Date(Date.now() - 10 * 60 * 1000),
        },
      ],
    });

    logger.info('Creating sample notifications...');
    await Notification.create([
      {
        recipient: julian._id,
        sender: kai._id,
        type: 'follow_request',
        read: false,
      },
      {
        recipient: julian._id,
        sender: maya._id,
        type: 'story_like',
        read: true,
      },
      {
        recipient: julian._id,
        sender: amara._id,
        type: 'follow',
        read: true,
      },
    ]);

    logger.info('✅ Database seeded successfully!');
    logger.info('Sample Login Account:');
    logger.info('  Username: julian  |  Password: password123');
    logger.info('  Username: mayachen|  Password: password123');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();


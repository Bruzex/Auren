import { Response } from 'express';
import { AnonymousRoom } from '../models/AnonymousRoom.js';
import { generateRoomCode, getRandomAlias } from '../utils/roomCode.js';
import { AuthRequest } from '../middleware/auth.js';
import { getIO } from '../sockets/index.js';

export async function createRoom(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name = 'Secret Room', duration = '24h' } = req.body;

    let durationMs = 24 * 60 * 60 * 1000;
    if (duration === '1h') durationMs = 60 * 60 * 1000;
    if (duration === '7d') durationMs = 7 * 24 * 60 * 60 * 1000;

    const expiresAt = new Date(Date.now() + durationMs);

    // Ensure unique code
    let code = generateRoomCode(6);
    let attempts = 0;
    while ((await AnonymousRoom.exists({ code })) && attempts < 10) {
      code = generateRoomCode(6);
      attempts++;
    }

    const room = await AnonymousRoom.create({
      code,
      name,
      creator: req.user?._id,
      duration,
      expiresAt,
      isActive: true,
      participants: [],
      messages: [],
    });

    res.status(201).json({
      success: true,
      message: 'Anonymous room created',
      data: {
        code: room.code,
        name: room.name,
        duration: room.duration,
        expiresAt: room.expiresAt,
        createdAt: room.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating anonymous room',
    });
  }
}

export async function joinRoom(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { code, alias: userAlias } = req.body;
    const cleanCode = (code || '').trim().toUpperCase();

    const room = await AnonymousRoom.findOne({
      code: cleanCode,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!room) {
      res.status(404).json({
        success: false,
        message: 'Room not found, closed, or expired.',
      });
      return;
    }

    const assignedAlias = userAlias?.trim() || getRandomAlias();

    // Check if participant alias already exists in room, adjust if needed
    let finalAlias = assignedAlias;
    if (room.participants.some((p) => p.alias === finalAlias)) {
      finalAlias = `${assignedAlias} (${Math.floor(Math.random() * 90 + 10)})`;
    }

    room.participants.push({
      alias: finalAlias,
      user: req.user?._id,
      joinedAt: new Date(),
    });

    await room.save();

    res.status(200).json({
      success: true,
      data: {
        code: room.code,
        name: room.name,
        alias: finalAlias,
        duration: room.duration,
        expiresAt: room.expiresAt,
        participantsCount: room.participants.length,
        messages: room.messages.slice(-50),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error joining room',
    });
  }
}

export async function getRoomDetails(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { code } = req.params;
    const cleanCode = (code || '').trim().toUpperCase();

    const room = await AnonymousRoom.findOne({
      code: cleanCode,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!room) {
      res.status(404).json({
        success: false,
        message: 'Room not found or expired',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        code: room.code,
        name: room.name,
        expiresAt: room.expiresAt,
        peopleCount: room.participants.length,
        messagesCount: room.messages.length,
        messages: room.messages.slice(-50),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching room',
    });
  }
}

export async function getRecentRooms(req: AuthRequest, res: Response): Promise<void> {
  try {
    const rooms = await AnonymousRoom.find({
      isActive: true,
      expiresAt: { $gt: new Date() },
    })
      .sort({ createdAt: -1 })
      .limit(10);

    const formatted = rooms.map((r) => ({
      code: r.code,
      name: r.name,
      people: r.participants.length,
      expiresAt: r.expiresAt,
    }));

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching recent rooms',
    });
  }
}


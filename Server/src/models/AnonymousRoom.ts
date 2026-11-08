import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IRoomParticipant {
  alias: string;
  socketId?: string;
  user?: Types.ObjectId;
  joinedAt: Date;
}

export interface IRoomMessage {
  id: string;
  alias: string;
  content: string;
  createdAt: Date;
}

export interface IAnonymousRoom extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  creator?: Types.ObjectId;
  participants: IRoomParticipant[];
  messages: IRoomMessage[];
  duration: '1h' | '24h' | '7d';
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const anonymousRoomSchema = new Schema<IAnonymousRoom>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      default: 'Secret Room',
      trim: true,
      maxlength: 50,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    participants: [
      {
        alias: { type: String, required: true },
        socketId: { type: String },
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    messages: [
      {
        id: { type: String, required: true },
        alias: { type: String, required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    duration: {
      type: String,
      enum: ['1h', '24h', '7d'],
      default: '24h',
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL auto-cleanup!
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const AnonymousRoom: Model<IAnonymousRoom> = mongoose.model<IAnonymousRoom>(
  'AnonymousRoom',
  anonymousRoomSchema
);

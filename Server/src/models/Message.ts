import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type MessageType = 'text' | 'image' | 'voice';

export interface IMessage extends Document {
  _id: Types.ObjectId;
  sender: Types.ObjectId;
  conversation: Types.ObjectId;
  content: string;
  type: MessageType;
  mediaUrl?: string;
  seen: boolean;
  seenBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'voice'],
      default: 'text',
    },
    mediaUrl: {
      type: String,
    },
    seen: {
      type: Boolean,
      default: false,
      index: true,
    },
    seenBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
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

messageSchema.index({ conversation: 1, createdAt: 1 });

export const Message: Model<IMessage> = mongoose.model<IMessage>('Message', messageSchema);

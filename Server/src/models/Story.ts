import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IStoryViewer {
  user: Types.ObjectId;
  viewedAt: Date;
}

export interface IStory extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  mediaUrl?: string;
  caption?: string;
  mode: 'camera' | 'text';
  textStyle?: string;
  textColor?: string;
  backgroundGradient?: string;
  audience: 'story' | 'close-friends';
  viewers: IStoryViewer[];
  expiresAt: Date;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const storySchema = new Schema<IStory>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mediaUrl: {
      type: String,
      default: '',
    },
    caption: {
      type: String,
      default: '',
      maxlength: 500,
    },
    mode: {
      type: String,
      enum: ['camera', 'text'],
      default: 'camera',
    },
    textStyle: {
      type: String,
      default: 'classic',
    },
    textColor: {
      type: String,
      default: '#FFFFFF',
    },
    backgroundGradient: {
      type: String,
      default: '',
    },
    audience: {
      type: String,
      enum: ['story', 'close-friends'],
      default: 'story',
    },
    viewers: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from creation
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
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

storySchema.index({ user: 1, expiresAt: -1 });

export const Story: Model<IStory> = mongoose.model<IStory>('Story', storySchema);

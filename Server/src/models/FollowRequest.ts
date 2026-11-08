import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type FollowRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface IFollowRequest extends Document {
  _id: Types.ObjectId;
  from: Types.ObjectId;
  to: Types.ObjectId;
  status: FollowRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const followRequestSchema = new Schema<IFollowRequest>(
  {
    from: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
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

// Compound index to ensure uniqueness of pending requests between users
followRequestSchema.index({ from: 1, to: 1, status: 1 });

export const FollowRequest: Model<IFollowRequest> = mongoose.model<IFollowRequest>(
  'FollowRequest',
  followRequestSchema
);

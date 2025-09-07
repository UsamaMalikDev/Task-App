import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { APP_ROLES } from '../app/app.roles';
import { PROFILE_STATUS } from 'src/utils/constants';
import { BaseModel } from 'src/common/models/base.model';

export type ProfileDocument = HydratedDocument<Profile>;

@Schema({ timestamps: true })
export class Profile extends BaseModel {
  @Prop({ required: true, type: String })
  email: string;

  @Prop({ required: true, type: String, select: false })
  password: string;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  phone: string;

  @Prop({
    required: true,
    enum: PROFILE_STATUS,
    default: PROFILE_STATUS.NONE,
  })
  isVerified: string;

  @Prop({
    required: false,
    type: String,
    default: 'https://ui-avatars.com/api/?name=Deep Lawn',
  })
  avatar: string;

  @Prop({
    required: false,
    type: [String],
    enum: APP_ROLES,
    default: [APP_ROLES.USER],
  })
  roles: APP_ROLES[];

  @Prop({ required: false, type: String })
  organizationId?: string;

  @Prop({ required: false, type: Boolean, default: false })
  disabled?: boolean;
}

export const ProfileModel = SchemaFactory.createForClass(Profile);

ProfileModel.index({ email: 1 }, { unique: true });
ProfileModel.index({ organizationId: 1 });
ProfileModel.index({ isVerified: 1 });

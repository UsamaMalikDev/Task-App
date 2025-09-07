import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { ObjectId } from 'mongoose';
import { getFindQueryProps } from 'src/utils/helpers';
import { FindPayloadType } from 'src/utils/types';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile, ProfileDocument } from './profile.model';

@Injectable()
export class ProfilesRepository {
  constructor(
    @InjectModel('Profile') private readonly profileModel: Model<Profile>,
  ) {}

  get(id: string): Promise<ProfileDocument> {
    return this.profileModel.findById(id).exec();
  }

  async create(payload: Profile): Promise<ProfileDocument> {
    try {
      const findPayload: FindPayloadType<Profile> = {
        filter: {
          email: payload.email,
        },
      };
      const user = await this.findOne(findPayload);
      if (user) {
        throw new NotAcceptableException(
          'The account with the provided email currently exists. Please choose another one.',
        );
      }
      const createdProfile = new this.profileModel(payload);
      return createdProfile.save();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  getByEmail(email: string): Promise<Profile> {
    return this.profileModel.findOne({ email }).exec();
  }

  async update(
    id: any,
    updateProfileDto: UpdateProfileDto,
  ): Promise<HydratedDocument<Profile>> {
    try {
      return await this.profileModel
        .findOneAndUpdate({ _id: id }, updateProfileDto, { new: true })
        .exec();
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async delete(
    id: any,
  ): Promise<HydratedDocument<Profile> | null> {
    try {
      const deletedProfile = await this.profileModel
        .findOneAndDelete({ _id: id })
        .exec();

      if (!deletedProfile) {
        throw new NotFoundException(`Profile with ID ${id} not found`);
      }

      return null;
    } catch (error) {
      throw new BadRequestException(`Error deleting profile: ${error.message}`);
    }
  }

  async findOne(payload: FindPayloadType<Profile>): Promise<ProfileDocument> {
    try {
      const { filter, ref } = getFindQueryProps(payload);
      return await this.profileModel.findOne(filter).populate(ref).exec();
    } catch (err) {
      throw new BadRequestException(
        'Something went wrong while finding profile',
      );
    }
  }

  async findAll(payload: FindPayloadType<Profile>): Promise<ProfileDocument[]> {
    try {
      const { filter, ref } = getFindQueryProps(payload);
      return await this.profileModel.find(filter).populate(ref).exec();
    } catch (err) {
      throw new BadRequestException(
        'Something went wrong while finding profile',
      );
    }
  }

  async createAll(profiles: Partial<Profile>[]): Promise<ProfileDocument[]> {
    try {
      const result = await this.profileModel.insertMany(profiles);
      return result as ProfileDocument[];
    } catch (error) {
      throw new BadRequestException(`Error creating profiles: ${error.message}`);
    }
  }

  async count(): Promise<number> {
    try {
      return await this.profileModel.countDocuments();
    } catch (error) {
      throw new BadRequestException(`Error counting profiles: ${error.message}`);
    }
  }
}

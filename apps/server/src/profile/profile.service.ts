import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { APP_ROLES } from '../app/app.roles';
import { RegisterProfileDto } from '../auth/dto/register-profile.dto';
import { baseFilters, PROFILE_STATUS } from 'src/utils/constants';
import {
  createAvatarURL,
  encryptPassword,
} from 'src/utils/helpers';
import { FindPayloadType } from 'src/utils/types';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile, ProfileDocument } from './profile.model';
import { ProfilesRepository } from './profile.repository';
import { ConfigService } from 'src/common/config/config.service';
import { APP_ENV } from 'src/common/config/config.types';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly configService: ConfigService,
    private profileRepository: ProfilesRepository,
  ) {}

  private readonly logger = new Logger(ProfilesService.name);

  get(id: string): Promise<ProfileDocument> {
    try {
      return this.profileRepository.get(id);
    } catch (err) {
      this.logger.log('Error finding profile', err);
      throw new BadRequestException(
        'Something went wrong while finding profile',
      );
    }
  }

  getByEmail(email: string): Promise<ProfileDocument> {
    try {
      const payload: FindPayloadType<Profile> = {
        filter: {
          email,
        },
      };
      return this.profileRepository.findOne(payload);
    } catch (err) {
      this.logger.log('Error finding profile', err);
      throw new BadRequestException(
        'Something went wrong while finding profile',
      );
    }
  }

  async getByEmailAndPass(
    email: string,
    password: string,
  ): Promise<ProfileDocument> {
    try {
      const payload: FindPayloadType<ProfileDocument> = {
        filter: {
          email,
          password: encryptPassword(password),
          ...baseFilters.filterDeleted,
        },
      };

      return await this.profileRepository.findOne(payload);
    } catch (err) {
      this.logger.log('Error finding profile', err);
      throw new BadRequestException(
        'Something went wrong while finding profile',
      );
    }
  }

  async create(
    registerProfileDto: RegisterProfileDto,
  ): Promise<ProfileDocument> {
    try {
      let password = registerProfileDto.password;
      if (this.configService.get('APP_ENV') !== APP_ENV.migration) {
        password = encryptPassword(registerProfileDto.password);
      }

      const payload = {
        ...registerProfileDto,
        password,
        avatar: createAvatarURL(registerProfileDto.name),
        isVerified: PROFILE_STATUS.NONE,
        roles: [APP_ROLES.USER],
        deleted: false,
      };
      return this.profileRepository.create(payload);
    } catch (err) {
      this.logger.log('Error creating profile', err);
      throw new BadRequestException(
        'Something went wrong while creating profile',
      );
    }
  }

  async deleteProfile(profileId: string): Promise<Profile> {
    try {
      const profileObjectId = new Types.ObjectId(profileId);

      const deletedProfile = await this.profileRepository.delete(
        profileObjectId,
      );

      if (!deletedProfile) throw new NotFoundException(`Profile with ID ${profileId} not found`);

      return deletedProfile;
    } catch (error) {
      this.logger.error(
        `Encountered error while deleting profile ${profileId}`,
        error,
      );
      throw new BadRequestException(
        `Something went wrong while deleting the profile. Please try again later.`,
      );
    }
  }

  getAllOrganizationProfiles(organizationId: string): Promise<ProfileDocument[]> {
    try {
      const payload: FindPayloadType<Profile> = {
        filter: {
          organizationId: organizationId,
        },
      };
      return this.profileRepository.findAll(payload);
    } catch (err) {
      this.logger.error('Error finding profiles', err);
      throw new BadRequestException(
        'Something went wrong while finding profile',
      );
    }
  }

  async updateProfile(profileId: string, body: UpdateProfileDto) {
    try {
      const profileObjectId = new Types.ObjectId(profileId);

      return await this.profileRepository.update(profileObjectId, body);
    } catch (error) {
      this.logger.error('Error occurred while updating profile', error);
      throw new BadRequestException(error.message);
    }
  }
}

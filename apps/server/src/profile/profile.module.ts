import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Profile, ProfileModel } from './profile.model';
import { ProfilesRepository } from './profile.repository';
import { ProfilesService } from './profile.service';
import { ConfigModule } from 'src/common/config/config.module';
import { ProfilesController } from './profile.controller';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Profile.name, schema: ProfileModel, collection: 'profiles' },
    ]),
  ],
  providers: [ProfilesService, ProfilesRepository],
  exports: [ProfilesService, ProfilesRepository],
  controllers: [ProfilesController],
})
export class ProfileModule {}

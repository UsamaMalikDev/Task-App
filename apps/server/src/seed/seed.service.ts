import { Injectable, Logger } from '@nestjs/common';
import { ProfilesRepository } from '../profile/profile.repository';
import { TaskRepository } from '../task/task.repository';
import { profileSeedData } from '../profile/profile.seed';
import { taskSeedData } from '../task/task.seed';
import { encryptPassword } from '../utils/helpers';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly profilesRepository: ProfilesRepository,
    private readonly taskRepository: TaskRepository,
  ) {}

  async seedDatabase(): Promise<void> {
    try {
      this.logger.log(' Starting database seeding...');

      const seedEmails = profileSeedData.map(p => p.email);
      const existingSeedProfiles = await this.profilesRepository.findAll({
        filter: { email: { $in: seedEmails } }
      });

      if (existingSeedProfiles.length > 0) {
        this.logger.log(`Seed data already exists (${existingSeedProfiles.length} profiles found), skipping seed`);
        return;
      }
      await this.seedProfiles();
      await this.seedTasks();

      this.logger.log(' Database seeding completed successfully');
    } catch (error) {
      this.logger.error(' Error seeding database', error);
      throw error;
    }
  }

  async forceSeedDatabase(): Promise<void> {
    try {
      this.logger.log('Seeding database (ignoring existing data)...');

      await this.seedProfiles();
      await this.seedTasks();

      this.logger.log('Force seeding completed successfully');
    } catch (error) {
      this.logger.error('Error force seeding database', error);
      throw error;
    }
  }

  private async seedProfiles(): Promise<void> {
    this.logger.log('Seeding profiles...');

    // Hash passwords before adding in DB
    const profilesWithHashedPasswords = await Promise.all(
      profileSeedData.map(async (profile) => ({
        ...profile,
        password: await encryptPassword(profile.password as string),
      }))
    );

    const createdProfiles = await this.profilesRepository.createAll(profilesWithHashedPasswords);
    this.logger.log(` Created ${createdProfiles.length} profiles`);
  }

  private async seedTasks(): Promise<void> {
    this.logger.log(' Seeding tasks...');

    // Get all profiles to map emails to IDs
    const allProfiles = await this.profilesRepository.findAll({ filter: {} });
    const emailToIdMap = new Map(
      allProfiles.map(profile => [profile.email, profile._id.toString()])
    );

    // Process task data to replace email references with actual user IDs
    const processedTasks = taskSeedData.map(task => {
      const processedTask = { ...task };
      
      // Replace email references with user IDs
      if (task.createdBy && emailToIdMap.has(task.createdBy)) {
        processedTask.createdBy = emailToIdMap.get(task.createdBy)!;
      }
      
      if (task.assignedTo && emailToIdMap.has(task.assignedTo)) {
        processedTask.assignedTo = emailToIdMap.get(task.assignedTo)!;
      }

      // Set due dates (spread over next 30 days)
      if (!task.dueDate) {
        const now = new Date();
        const randomDays = Math.floor(Math.random() * 30);
        processedTask.dueDate = new Date(now.getTime() + randomDays * 24 * 60 * 60 * 1000);
      }

      return processedTask;
    });

    const createdTasks = await this.taskRepository.createAll(processedTasks);
    this.logger.log(` Created ${createdTasks.length} tasks`);
  }
}

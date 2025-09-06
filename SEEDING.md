# Database Seeding Implementation

This document describes the database seeding implementation for the Task App.

## Architecture

The seeding system follows a modular approach where each module has its own seed file and seeding happens automatically during app startup.

## Components

### 1. Seed Files
- **`src/profile/profile.seed.ts`**: Contains hardcoded profile data
- **`src/task/task.seed.ts`**: Contains hardcoded task data

### 2. Repository Methods
- **`createAll()`**: Uses `insertMany()` to bulk insert seed data
- **`count()`**: Checks if data already exists to avoid duplicate seeding

### 3. Seed Service
- **`src/seed/seed.service.ts`**: Handles the seeding logic
- Automatically hashes passwords before insertion
- Maps email references to user IDs for task assignments
- Only seeds if database is empty

### 4. Automatic Seeding
- Seeding happens during app startup in `main.ts`
- Checks if data exists before seeding
- Logs seeding progress and results

## Seed Data Structure

### Organization A (orgA)
- **1 Admin**: `admin@orga.com` (ADMIN role)
- **1 Manager**: `manager@orga.com` (MANAGER role)  
- **2 Users**: `user1@orga.com`, `user2@orga.com` (CONTRACTOR role)
- **~30 Tasks**: Mix of priorities, statuses, and realistic assignments

### Organization B (orgB)
- **2 Users**: `user1@orgb.com`, `user2@orgb.com` (CONTRACTOR role)
- **~15 Tasks**: Mix of priorities, statuses, and realistic assignments

## Usage

### Automatic Seeding
The database is automatically seeded when the application starts:

```bash
npm run start:dev
```

The seeding will only happen if the database is empty (no profiles or tasks exist).

### Manual Seeding
If you need to manually trigger seeding, you can clear the database and restart the application.

## Login Credentials

All seeded users have the password: `password123`

### Organization A Users
- **Admin**: `admin@orga.com` / `password123`
- **Manager**: `manager@orga.com` / `password123`
- **User 1**: `user1@orga.com` / `password123`
- **User 2**: `user2@orga.com` / `password123`

### Organization B Users
- **User 1**: `user1@orgb.com` / `password123`
- **User 2**: `user2@orgb.com` / `password123`

## Features

- **Idempotent**: Only seeds if database is empty
- **Automatic**: Happens during app startup
- **Modular**: Each module has its own seed file
- **Realistic Data**: Tasks with varied priorities, statuses, and assignments
- **RBAC Ready**: Proper role-based access control structure
- **Password Hashing**: Passwords are automatically hashed before insertion
- **Email Mapping**: Task assignments are properly mapped to user IDs

## Technical Details

### Repository Methods
```typescript
// Profile Repository
async createAll(profiles: Partial<Profile>[]): Promise<ProfileDocument[]>
async count(): Promise<number>

// Task Repository  
async createAll(tasks: Partial<Task>[]): Promise<TaskDocument[]>
async count(): Promise<number>
```

### Seed Service
```typescript
async seedDatabase(): Promise<void>
private async seedProfiles(): Promise<void>
private async seedTasks(): Promise<void>
```

### Startup Integration
```typescript
// main.ts
const seedService = app.get(SeedService);
await seedService.seedDatabase();
```

## Benefits

1. **Modular**: Each module manages its own seed data
2. **Efficient**: Uses `insertMany()` for bulk operations
3. **Safe**: Only seeds when database is empty
4. **Automatic**: No manual intervention required
5. **Maintainable**: Easy to update seed data in respective modules
6. **Type Safe**: Full TypeScript support with proper typing

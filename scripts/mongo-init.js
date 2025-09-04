// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the application database
db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE || 'testdb');

// Create application user
db.createUser({
  user: process.env.MONGO_APP_USERNAME || 'appuser',
  pwd: process.env.MONGO_APP_PASSWORD || 'apppassword',
  roles: [
    {
      role: 'readWrite',
      db: process.env.MONGO_INITDB_DATABASE || 'testdb'
    }
  ]
});

// Create collections with initial data if needed
db.createCollection('users');
db.createCollection('tasks');
db.createCollection('profiles');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.tasks.createIndex({ userId: 1 });
db.tasks.createIndex({ status: 1 });
db.tasks.createIndex({ createdAt: -1 });

print('Database initialization completed successfully!');

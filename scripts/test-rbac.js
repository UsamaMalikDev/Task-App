#!/usr/bin/env node

/**
 * RBAC Test Script
 * 
 * This script tests the Role-Based Access Control system by:
 * 1. Logging in as different users (User, Manager, Admin)
 * 2. Testing task access permissions
 * 3. Verifying that each role can only access appropriate tasks
 * 
 * Usage:
 *   node scripts/test-rbac.js
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:3000';

// Test users
const testUsers = [
  {
    email: 'user1@orga.com',
    password: 'password123',
    role: 'USER',
    organization: 'orgA',
    expectedAccess: 'own tasks only'
  },
  {
    email: 'manager@orga.com',
    password: 'password123',
    role: 'MANAGER',
    organization: 'orgA',
    expectedAccess: 'orgA tasks only'
  },
  {
    email: 'admin@orga.com',
    password: 'password123',
    role: 'ADMIN',
    organization: 'orgA',
    expectedAccess: 'all tasks across all orgs'
  },
  {
    email: 'user1@orgb.com',
    password: 'password123',
    role: 'USER',
    organization: 'orgB',
    expectedAccess: 'own tasks only'
  }
];

async function testRBAC() {
  console.log('🧪 Testing RBAC Implementation...\n');

  for (const user of testUsers) {
    console.log(`\n👤 Testing ${user.role} (${user.email})`);
    console.log(`   Expected access: ${user.expectedAccess}`);
    console.log(`   Organization: ${user.organization}`);
    
    try {
      // Login
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: user.email,
        password: user.password
      });

      if (!loginResponse.data || !loginResponse.data.backendTokens) {
        console.log('   ❌ Login failed - no auth data received');
        continue;
      }

      const token = loginResponse.data.backendTokens.token;
      const userData = loginResponse.data.user;
      
      console.log(`   ✅ Login successful`);
      console.log(`   User ID: ${userData._id}`);
      console.log(`   Roles: ${userData.roles.join(', ')}`);
      console.log(`   Organization: ${userData.organization || 'Not set'}`);

      // Test task access
      const tasksResponse = await axios.get(`${BASE_URL}/api/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const tasks = tasksResponse.data.tasks || [];
      console.log(`   📋 Can access ${tasks.length} tasks`);

      // Analyze task access
      const orgATasks = tasks.filter(t => t.organization === 'orgA');
      const orgBTasks = tasks.filter(t => t.organization === 'orgB');
      const ownTasks = tasks.filter(t => t.createdBy === userData._id);

      console.log(`   📊 Task breakdown:`);
      console.log(`      - orgA tasks: ${orgATasks.length}`);
      console.log(`      - orgB tasks: ${orgBTasks.length}`);
      console.log(`      - own tasks: ${ownTasks.length}`);

      // Verify permissions based on role
      let permissionCheck = '✅ PASS';
      
      switch (user.role) {
        case 'USER':
          if (tasks.length !== ownTasks.length) {
            permissionCheck = '❌ FAIL - User can see tasks they didn\'t create';
          }
          break;
        case 'MANAGER':
          if (orgBTasks.length > 0) {
            permissionCheck = '❌ FAIL - Manager can see tasks from other organizations';
          }
          break;
        case 'ADMIN':
          // Admin should be able to see tasks from all organizations
          if (tasks.length === 0) {
            permissionCheck = '❌ FAIL - Admin cannot see any tasks';
          }
          break;
      }

      console.log(`   ${permissionCheck}`);

      // Test task creation
      try {
        const createResponse = await axios.post(`${BASE_URL}/api/tasks`, {
          title: `Test task by ${user.role}`,
          description: `Created by ${user.email}`,
          priority: 'medium',
          status: 'pending',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log(`   ✅ Can create tasks`);
      } catch (createError) {
        console.log(`   ❌ Cannot create tasks: ${createError.response?.data?.message || createError.message}`);
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`);
    }
  }

  console.log('\n🎯 RBAC Test Summary:');
  console.log('   - USER: Should only see and manage their own tasks');
  console.log('   - MANAGER: Should see and manage tasks within their organization');
  console.log('   - ADMIN: Should see and manage tasks across all organizations');
  console.log('\n✅ RBAC testing completed!');
}

// Run the test
if (require.main === module) {
  testRBAC().catch(console.error);
}

module.exports = { testRBAC };

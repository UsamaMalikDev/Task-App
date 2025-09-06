#!/usr/bin/env node

/**
 * Simple RBAC Test Script
 * 
 * This script tests the RBAC system by making API calls to verify
 * that different user roles see different tasks.
 * 
 * Usage:
 *   node scripts/test-rbac-simple.js
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:3000';

async function testRBAC() {
  console.log('🧪 Testing RBAC Implementation...\n');

  // Test users with different roles
  const testCases = [
    {
      name: 'USER (orgA)',
      email: 'user1@orga.com',
      password: 'password123',
      expectedRole: 'CONTRACTOR',
      expectedOrg: 'orgA'
    },
    {
      name: 'MANAGER (orgA)',
      email: 'manager@orga.com',
      password: 'password123',
      expectedRole: 'MANAGER',
      expectedOrg: 'orgA'
    },
    {
      name: 'ADMIN (orgA)',
      email: 'admin@orga.com',
      password: 'password123',
      expectedRole: 'ADMIN',
      expectedOrg: 'orgA'
    },
    {
      name: 'USER (orgB)',
      email: 'user1@orgb.com',
      password: 'password123',
      expectedRole: 'CONTRACTOR',
      expectedOrg: 'orgB'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n👤 Testing ${testCase.name}`);
    console.log(`   Email: ${testCase.email}`);
    
    try {
      // Step 1: Login
      console.log('   🔐 Logging in...');
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: testCase.email,
        password: testCase.password
      });

      if (!loginResponse.data || !loginResponse.data.backendTokens) {
        console.log('   ❌ Login failed');
        continue;
      }

      const token = loginResponse.data.backendTokens.token;
      const user = loginResponse.data.user;
      
      console.log(`   ✅ Login successful`);
      console.log(`   User ID: ${user._id}`);
      console.log(`   Roles: ${user.roles?.join(', ') || 'None'}`);
      console.log(`   Organization: ${user.organization || 'Not set'}`);

      // Step 2: Get tasks
      console.log('   📋 Fetching tasks...');
      const tasksResponse = await axios.get(`${BASE_URL}/api/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const tasks = tasksResponse.data.tasks || [];
      console.log(`   ✅ Retrieved ${tasks.length} tasks`);

      // Step 3: Analyze task access
      const orgATasks = tasks.filter(t => t.organization === 'orgA');
      const orgBTasks = tasks.filter(t => t.organization === 'orgB');
      const ownTasks = tasks.filter(t => t.createdBy === user._id);

      console.log(`   📊 Task breakdown:`);
      console.log(`      - orgA tasks: ${orgATasks.length}`);
      console.log(`      - orgB tasks: ${orgBTasks.length}`);
      console.log(`      - own tasks: ${ownTasks.length}`);

      // Step 4: Verify permissions
      let permissionStatus = '✅ PASS';
      let reason = '';

      switch (testCase.expectedRole) {
        case 'CONTRACTOR':
          if (tasks.length !== ownTasks.length) {
            permissionStatus = '❌ FAIL';
            reason = 'User can see tasks they didn\'t create';
          }
          break;
        case 'MANAGER':
          if (orgBTasks.length > 0) {
            permissionStatus = '❌ FAIL';
            reason = 'Manager can see tasks from other organizations';
          }
          break;
        case 'ADMIN':
          if (tasks.length === 0) {
            permissionStatus = '❌ FAIL';
            reason = 'Admin cannot see any tasks';
          }
          break;
      }

      console.log(`   ${permissionStatus} ${reason}`);

      // Step 5: Test task creation
      console.log('   ✏️  Testing task creation...');
      try {
        const createResponse = await axios.post(`${BASE_URL}/api/tasks`, {
          title: `Test task by ${testCase.name}`,
          description: `Created by ${testCase.email} at ${new Date().toISOString()}`,
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
  console.log('   - CONTRACTOR: Should only see their own tasks');
  console.log('   - MANAGER: Should see all tasks in their organization');
  console.log('   - ADMIN: Should see all tasks across all organizations');
  console.log('\n✅ RBAC testing completed!');
}

// Run the test
if (require.main === module) {
  testRBAC().catch(console.error);
}

module.exports = { testRBAC };

require('dotenv').config();
const axios = require('axios');
const { Client } = require('pg');

const API_URL = process.env.API_URL || 'http://localhost:3001';

// Test data
const TEST_USER = {
    email: `test${Date.now()}@example.com`,
    password: 'testpassword123',
    name: 'Test User',
    organization_id: null, // Will be created
};

let authToken = '';
let sessionId = '';
let organizationId = '';

async function createOrganization() {
    console.log('Creating test organization...');

    // For testing, we'll need to manually create an organization
    // In production, this would be done via admin API
    const { Pool } = require('pg');
    const pool = new Pool({
        host: process.env.DATABASE_HOST === 'postgres' ? 'localhost' : (process.env.DATABASE_HOST || 'localhost'),
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        user: process.env.DATABASE_USER || 'workpulse',
        password: process.env.DATABASE_PASSWORD || 'changeme',
        database: process.env.DATABASE_NAME || 'workpulse_db',
    });

    const result = await pool.query(`
    INSERT INTO organizations (name, plan_type)
    VALUES ('Test Org', 'premium')
    RETURNING id
  `);

    organizationId = result.rows[0].id;
    console.log(`Organization created: ${organizationId}`);

    await pool.end();
    return organizationId;
}

async function register() {
    console.log('\n1. Registering user...');

    const response = await axios.post(`${API_URL}/auth/register`, {
        ...TEST_USER,
        organization_id: organizationId,
    });

    authToken = response.data.access_token;
    console.log('✓ User registered successfully');
    console.log(`Token: ${authToken.substring(0, 20)}...`);
}

async function startSession() {
    console.log('\n2. Starting work session...');

    const response = await axios.post(
        `${API_URL}/sessions/start`,
        {},
        {
            headers: { Authorization: `Bearer ${authToken}` },
        },
    );

    sessionId = response.data.id;
    console.log('✓ Session started successfully');
    console.log(`Session ID: ${sessionId}`);
    console.log(`Initial active seconds: ${response.data.total_active_seconds}`);
}

async function sendParallelActivities() {
    console.log('\n3. Sending 100 parallel activity requests...');

    const activityDuration = 60; // 60 seconds each
    const requestCount = 100;

    const requests = Array(requestCount)
        .fill(null)
        .map((_, index) =>
            axios.post(
                `${API_URL}/sessions/${sessionId}/activity`,
                {
                    activityType: 'active',
                    durationSeconds: activityDuration,
                    appName: `TestApp${index}`,
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            ).catch((error) => {
                if (error.response?.status === 409) {
                    console.log(`Request ${index}: Conflict detected (retried internally)`);
                    return { retried: true };
                }
                throw error;
            }),
        );

    const startTime = Date.now();
    const results = await Promise.all(requests);
    const endTime = Date.now();

    const successCount = results.filter(r => !r.retried && r.status === 201).length;
    const retriedCount = results.filter(r => r.retried).length;

    console.log(`✓ Completed in ${endTime - startTime}ms`);
    console.log(`  Successful: ${successCount}`);
    console.log(`  Retried: ${retriedCount}`);
}

async function verifyTotals() {
    console.log('\n4. Verifying final totals...');

    const response = await axios.get(`${API_URL}/sessions/active`, {
        headers: { Authorization: `Bearer ${authToken}` },
    });

    const session = response.data.find(s => s.id === sessionId);

    if (!session) {
        console.error('✗ Session not found!');
        process.exit(1);
    }

    const expectedTotal = 100 * 60; // 100 requests × 60 seconds
    const actualTotal = session.total_active_seconds;

    console.log(`Expected total: ${expectedTotal} seconds`);
    console.log(`Actual total: ${actualTotal} seconds`);

    if (actualTotal === expectedTotal) {
        console.log('\n✓✓✓ SUCCESS! No double-counting detected!');
        console.log('Optimistic locking worked correctly.');
    } else {
        console.error(`\n✗✗✗ FAILURE! Expected ${expectedTotal} but got ${actualTotal}`);
        console.error('Double-counting detected or data loss occurred.');
        process.exit(1);
    }
}

async function cleanup() {
    console.log('\n5. Cleaning up...');

    try {
        await axios.post(
            `${API_URL}/sessions/${sessionId}/stop`,
            {},
            {
                headers: { Authorization: `Bearer ${authToken}` },
            },
        );
        console.log('✓ Session stopped');
    } catch (error) {
        console.log('Session cleanup skipped');
    }
}

async function main() {
    try {
        console.log('=== WorkPulse Concurrency Load Test ===\n');

        await createOrganization();
        await register();
        await startSession();
        await sendParallelActivities();
        await verifyTotals();
        await cleanup();

        console.log('\n=== Test completed successfully! ===');
        process.exit(0);
    } catch (error) {
        console.error('\n✗ Test failed:');
        console.error(error.response?.data || error.message);
        process.exit(1);
    }
}

main();

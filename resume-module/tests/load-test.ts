import autocannon from 'autocannon';

const API_BASE = 'http://localhost:3000/api/v1';

async function runLoadTests() {
    console.log('🚀 Starting Autocannon Load Tests...\n');

    // Test 1: Health endpoint (No rate limit, testing raw throughput)
    console.log('--- Test 1: Health Check (Raw Throughput) ---');
    const healthResult = await autocannon({
        url: `${API_BASE}/health`,
        connections: 20,
        pipelining: 1,
        duration: 5
    });
    console.log(autocannon.printResult(healthResult));

    // Test 2: CRUD Rate Limiter (Max 100/min)
    console.log('\n--- Test 2: CRUD Endpoint Rate Limiting (Expect mostly 429s) ---');
    const crudResult = await autocannon({
        url: `${API_BASE}/resumes`,
        method: 'GET',
        headers: {
            'X-User-ID': 'load-test-user'
        },
        connections: 20,
        pipelining: 1,
        duration: 5
    });
    console.log(autocannon.printResult(crudResult));
    console.log(`Note: Non-2xx responses (like 429 Too Many Requests) indicate the 100-request limit is working!\n`);

    // Test 3: ATS Score Rate Limiter (Max 5/min)
    console.log('\n--- Test 3: ATS Endpoint Rate Limiting (Expect mostly 429s) ---');
    const atsResult = await autocannon({
        url: `${API_BASE}/ats/analyze-resume/fake-id-123`,
        method: 'POST',
        headers: {
            'X-User-ID': 'load-test-user'
        },
        connections: 10,
        pipelining: 1,
        duration: 5
    });
    console.log(autocannon.printResult(atsResult));
    console.log(`Note: High non-2xx count expected as ATS rejects past 5 requests.\n`);

    console.log('✅ Load testing completed.');
}

runLoadTests().catch(console.error);

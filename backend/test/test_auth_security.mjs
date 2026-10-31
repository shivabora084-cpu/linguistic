// LinguaMate AI - Authentication & Security Verification Suite
// Tests all 8 security cases required by the user:
// 1. New user registration
// 2. Unregistered user rejection (no auto-provisioning)
// 3. Wrong password rejection
// 4. Correct login after registration
// 5. Session validation (/auth/me with valid token)
// 6. Invalid/tampered token rejection (/auth/me returns 401)
// 7. Protected route rejection without token
// 8. Confirm no auto-login or bypass remains

const API_BASE = 'http://127.0.0.1:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log(' LinguaMate AI - Auth Security Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`[PASS] Case ${total}: ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] Case ${total}: ${message}`);
    }
  }

  const testEmail = `sec_user_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testFullName = 'Security Test User';
  const unregisteredEmail = `never_registered_${Date.now()}@example.com`;

  try {
    // ----------------------------------------------------
    // TEST 1: Unregistered user login MUST BE REJECTED with 401
    // (Verifies that auto-provisioning is completely removed)
    // ----------------------------------------------------
    console.log('--- Testing Unregistered User Login (Auto-Provision Prevention) ---');
    const unregRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: unregisteredEmail, password: 'AnyPassword123!' }),
    });
    const unregData = await unregRes.json();
    assert(
      unregRes.status === 401 && unregData.success === false,
      `Unregistered login strictly rejected with 401 (got status ${unregRes.status}: "${unregData.error || unregData.message}")`
    );

    // ----------------------------------------------------
    // TEST 2: Brand-new user registration succeeds (201 Created)
    // ----------------------------------------------------
    console.log('\n--- Testing New User Registration ---');
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        fullName: testFullName,
        preferredLanguage: 'ta',
        role: 'user',
      }),
    });
    const regData = await regRes.json();
    assert(
      regRes.status === 201 && regData.success === true && Boolean(regData.token),
      `New user registered successfully with 201 (got status ${regRes.status})`
    );

    // Duplicate registration should return 409 Conflict
    const dupRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        fullName: testFullName,
      }),
    });
    assert(
      dupRes.status === 409,
      `Duplicate registration blocked with 409 Conflict (got status ${dupRes.status})`
    );

    // ----------------------------------------------------
    // TEST 3: Login with WRONG password for registered user MUST FAIL with 401
    // ----------------------------------------------------
    console.log('\n--- Testing Wrong Password Rejection ---');
    const wrongPassRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'IncorrectPassword999!' }),
    });
    const wrongPassData = await wrongPassRes.json();
    assert(
      wrongPassRes.status === 401 && wrongPassData.success === false,
      `Wrong password rejected with 401 (got status ${wrongPassRes.status}: "${wrongPassData.error}")`
    );

    // ----------------------------------------------------
    // TEST 4: Login with CORRECT password succeeds with 200 + valid JWT
    // ----------------------------------------------------
    console.log('\n--- Testing Correct Credentials Login ---');
    const correctRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    const correctData = await correctRes.json();
    assert(
      correctRes.status === 200 && correctData.success === true && Boolean(correctData.token),
      `Registered user logged in successfully with 200 (Token received)`
    );

    const validToken = correctData.token;

    // ----------------------------------------------------
    // TEST 5: Session persistence check (/auth/me with valid token)
    // ----------------------------------------------------
    console.log('\n--- Testing Session Persistence (/auth/me) ---');
    const meRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${validToken}` },
    });
    const meData = await meRes.json();
    assert(
      meRes.status === 200 && meData.success === true && meData.user.email === testEmail,
      `/auth/me returns valid session profile for ${meData.user?.email}`
    );

    // ----------------------------------------------------
    // TEST 6: Invalid / Tampered token rejected with 401
    // ----------------------------------------------------
    console.log('\n--- Testing Tampered Token Rejection ---');
    const badTokenRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: 'Bearer this_is_a_completely_fake_and_tampered_jwt_token' },
    });
    const badTokenData = await badTokenRes.json();
    assert(
      badTokenRes.status === 401 && badTokenData.success === false,
      `Tampered token rejected with 401 (got status ${badTokenRes.status})`
    );

    // ----------------------------------------------------
    // TEST 7: Protected route without token rejected with 401
    // ----------------------------------------------------
    console.log('\n--- Testing Protected API Endpoints ---');
    const noTokenRes = await fetch(`${API_BASE}/auth/preferences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speechRate: 1.2 }),
    });
    assert(
      noTokenRes.status === 401,
      `Protected /auth/preferences without token rejected with 401 (got status ${noTokenRes.status})`
    );

    // ----------------------------------------------------
    // TEST 8: Demo account wrong password rejected with 401
    // (Verifies demo accounts have no bypass and require real bcrypt)
    // ----------------------------------------------------
    console.log('\n--- Testing Demo Account Password Security ---');
    const demoWrongRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@linguamate.ai', password: 'wrongdemo_password' }),
    });
    assert(
      demoWrongRes.status === 401,
      `Demo account with wrong password rejected with 401 (got status ${demoWrongRes.status})`
    );

    // Demo account with correct password succeeds
    const demoRightRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@linguamate.ai', password: 'demo123' }),
    });
    assert(
      demoRightRes.status === 200,
      `Demo account with correct password succeeds with 200 (got status ${demoRightRes.status})`
    );

    console.log('\n====================================================');
    console.log(` Summary: ${passed}/${total} auth security tests PASSED`);
    console.log('====================================================');

    if (passed === total) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution failed with error:', err);
    process.exit(1);
  }
}

runTests();

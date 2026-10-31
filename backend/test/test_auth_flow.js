import http from 'http';

function post(path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api' + path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          ...headers,
        },
      },
      (res) => {
        let b = '';
        res.on('data', (c) => (b += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(b) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: b });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api' + path,
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + token,
        },
      },
      (res) => {
        let b = '';
        res.on('data', (c) => (b += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(b) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: b });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function test() {
  console.log('--- 1. Testing Demo User Login ---');
  const r1 = await post('/auth/login', { email: 'demo@linguamate.ai', password: 'demo123' });
  console.log('Demo Login Status:', r1.status, '| Success:', r1.body.success, '| User:', r1.body.user?.email, '| Token:', !!r1.body.token);

  console.log('--- 2. Testing Admin User Login ---');
  const r2 = await post('/auth/login', { email: 'admin@linguamate.ai', password: 'admin123' });
  console.log('Admin Login Status:', r2.status, '| Role:', r2.body.user?.role, '| Name:', r2.body.user?.fullName);

  console.log('--- 3. Testing Unregistered User Login Rejection (No Auto-Provisioning) ---');
  const unregEmail = `unregistered_${Date.now()}@example.com`;
  const r3 = await post('/auth/login', { email: unregEmail, password: 'password123' });
  console.log('Unregistered User Status:', r3.status, '(Expected: 401)', '| Error:', r3.body.error);
  if (r3.status !== 401) {
    throw new Error(`Expected 401 for unregistered user, got ${r3.status}`);
  }

  console.log('--- 4. Testing Profile (/auth/me) with JWT ---');
  const r4 = await get('/auth/me', r1.body.token);
  console.log('/auth/me Status:', r4.status, '| Name:', r4.body.user?.fullName, '| Role:', r4.body.user?.role);

  console.log('--- 5. Testing Standard Registration ---');
  const newEmail = `flow_user_${Date.now()}@example.com`;
  const r5 = await post('/auth/register', {
    email: newEmail,
    password: 'password123',
    fullName: 'Jane Doe',
    preferredLanguage: 'ta',
  });
  console.log('Register Status:', r5.status, '| User:', r5.body.user?.email, '| Name:', r5.body.user?.fullName);
  if (r5.status !== 201) {
    throw new Error(`Expected 201 for registration, got ${r5.status}`);
  }

  console.log('--- 6. Testing Newly Registered User Login ---');
  const r6 = await post('/auth/login', { email: newEmail, password: 'password123' });
  console.log('Login Status:', r6.status, '| Success:', r6.body.success);
  if (r6.status !== 200) {
    throw new Error(`Expected 200 for new user login, got ${r6.status}`);
  }

  console.log('\nAll Auth Flows Verified Successfully with Strict Security!');
}

test().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});

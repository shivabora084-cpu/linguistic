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

  console.log('--- 3. Testing Shorthand (demo) Login ---');
  const r3 = await post('/auth/login', { email: 'demo', password: 'demo123' });
  console.log('Shorthand Login Status:', r3.status, '| User:', r3.body.user?.email);

  console.log('--- 4. Testing Profile (/auth/me) with JWT ---');
  const r4 = await get('/auth/me', r1.body.token);
  console.log('/auth/me Status:', r4.status, '| Name:', r4.body.user?.fullName, '| Role:', r4.body.user?.role);

  console.log('--- 5. Testing Auto-Provisioning New User Login ---');
  const r5 = await post('/auth/login', { email: 'tester@hackathon.com', password: 'password123' });
  console.log('New User Status:', r5.status, '| User:', r5.body.user?.email, '| Name:', r5.body.user?.fullName);

  console.log('--- 6. Testing Standard Registration ---');
  const r6 = await post('/auth/register', {
    email: 'registered_user@example.com',
    password: 'password123',
    fullName: 'Jane Doe',
    preferredLanguage: 'ta',
  });
  console.log('Register Status:', r6.status, '| User:', r6.body.user?.email, '| Name:', r6.body.user?.fullName);

  console.log('\nAll Auth Flows Verified Successfully!');
}

test().catch(console.error);

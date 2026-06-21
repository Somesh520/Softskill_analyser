import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const email = 'somesh.loadtest@kiet.edu';
const password = 'password123';

const run = async () => {
  console.log('🔑 Authenticating once to get a valid JWT token...');
  try {
    const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        turnstileToken: '1x0000000000000000000000000000000AA'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Failed to log in: ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Token acquired successfully!');

    // Create a temporary Artillery yml config with the token embedded
    const configPath = path.join(__dirname, 'load-test-real.yml');
    const yamlContent = `config:
  target: "http://localhost:5001"
  phases:
    - duration: 20
      arrivalRate: 250
      name: "Sustained load representing 5000 users (20000 requests)"
  defaults:
    headers:
      Content-Type: "application/json"
      Authorization: "Bearer ${token}"

scenarios:
  - name: "Teacher dashboard loading flow"
    flow:
      - get:
          url: "/api/teacher/classes"
      - get:
          url: "/api/teacher/activities"
      - get:
          url: "/api/teacher/teachers"
      - get:
          url: "/api/teacher/reports/summary"
`;

    fs.writeFileSync(configPath, yamlContent);
    console.log('📝 Created load-test-real.yml with token headers.');
    console.log('🚀 Launching Artillery load test...');

    const childProcess = exec('artillery run scripts/load-test-real.yml', { cwd: path.join(__dirname, '..') });

    childProcess.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    childProcess.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    childProcess.on('close', (code) => {
      console.log(`Artillery finished with code ${code}`);
      // Clean up the temp config
      try {
        fs.unlinkSync(configPath);
        console.log('🗑️ Cleaned up temporary load-test-real.yml.');
      } catch (err) {
        // ignore
      }
      process.exit(code);
    });

  } catch (err) {
    console.error('❌ Error running realistic load test:', err);
    process.exit(1);
  }
};

run();

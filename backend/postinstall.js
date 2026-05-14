const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dbPath = path.join(__dirname, 'alerts.db');

if (fs.existsSync(dbPath)) {
  console.log('alerts.db already exists; skipping seed.');
  process.exit(0);
}

console.log('alerts.db not found; running seed.');
try {
  execSync('npm run seed', { stdio: 'inherit', cwd: __dirname });
} catch (err) {
  // ts-node is a devDependency, so in a production install (e.g. NODE_ENV=production)
  // the seed cannot run. Don't fail the install — let deployment continue and
  // the operator can trigger seeding manually.
  console.warn('Skipping seed (' + err.message + ')');
}

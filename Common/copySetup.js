const fs = require('fs');
const path = require('path');

// ULANYLYŞY BOÝUNÇA UMUMY SALGY
const defaultAppDataPath = path.join('C:', 'ProgramData', 'ServerSolutionDefault');
const envSourcePath = path.resolve(__dirname, '../.env');
const queriesSourcePath = path.resolve(__dirname, '../Queries');

const envTargetPath = path.join(defaultAppDataPath, '.env');
const configPath = path.join(defaultAppDataPath, 'config.json');
const queriesTargetDefoult = path.join(defaultAppDataPath, 'QueriesDefoult');
const queriesTarget = path.join(defaultAppDataPath, 'Queries');

// Create target dir
if (!fs.existsSync(defaultAppDataPath)) {
  fs.mkdirSync(defaultAppDataPath, { recursive: true });
}

// Check config.json
let config = { OneRun: 0 };
if (fs.existsSync(configPath)) {
  try {
    config = JSON.parse(fs.readFileSync(configPath));
  } catch {
    config = { OneRun: 0 };
  }
}

if (config.OneRun === 0) {
  // Copy .env
  if (fs.existsSync(envSourcePath)) {
    fs.copyFileSync(envSourcePath, envTargetPath);
    console.log('.env copied.');
  }

  // Copy Queries -> QueriesDefoult
  if (fs.existsSync(queriesSourcePath)) {
    fs.cpSync(queriesSourcePath, queriesTargetDefoult, { recursive: true });
    fs.cpSync(queriesSourcePath, queriesTarget, { recursive: true });
    console.log('Queries copied to QueriesDefoult and Queries.');
  }

  // Mark as done
  fs.writeFileSync(configPath, JSON.stringify({ OneRun: 1 }, null, 2));
  console.log('Setup completed.');
} else {
  console.log('Already initialized. Skipping setup.');
}

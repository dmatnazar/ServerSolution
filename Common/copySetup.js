const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const os = require('os');

const defaultAppDataPath = path.join(os.homedir(), 'AppData', 'Local', 'ServerSolution', 'connections', 'ServerSolutionDefault');

let queriesSourcePath;

if (app.isPackaged) {
  queriesSourcePath = path.join(process.resourcesPath, 'app', 'Queries');
} else {
  queriesSourcePath = path.join(__dirname, '..', 'Queries');
}

console.log('Queries çeşmesiniň ýoly:', queriesSourcePath);
console.log('Queries source path:', queriesSourcePath);

const envTargetPath = path.join(defaultAppDataPath, '.env');
const configPath = path.join(defaultAppDataPath, 'config.json');
const queriesTargetDefault = path.join(defaultAppDataPath, 'QueriesDefault');
const queriesTarget = path.join(defaultAppDataPath, 'Queries');

const staticEnvContent = `
backend_address=192.168.0.10
backend_port=2002
backend_version=v1
host=
db_host=192.168.0.10
db_port=1433
db_name=
db_username=sa
db_password=
admin_pass=admin1001
`.trim();

// SYNHRON SETUP FUNKSIÝASY - derrew işleýär
function setupSync() {
  try {
    [defaultAppDataPath].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    let config = { OneRun: 0 };
    if (fs.existsSync(configPath)) {
      try {
        config = JSON.parse(fs.readFileSync(configPath));
      } catch {
        config = { OneRun: 0 };
      }
    }

    const needsCopy = config.OneRun === 0 || !fs.existsSync(queriesTarget);

    if (needsCopy) {
      // .env faýly döret
      if (!fs.existsSync(envTargetPath)) {
        fs.writeFileSync(envTargetPath, staticEnvContent);
        console.log('.env file created.');
      }

      if (fs.existsSync(queriesSourcePath)) {
        if (fs.existsSync(queriesTargetDefault)) {
          fs.rmSync(queriesTargetDefault, { recursive: true, force: true });
        }
        if (fs.existsSync(queriesTarget)) {
          fs.rmSync(queriesTarget, { recursive: true, force: true });
        }

        fs.cpSync(queriesSourcePath, queriesTargetDefault, { recursive: true });
        fs.cpSync(queriesSourcePath, queriesTarget, { recursive: true });

        console.log('Queries copied to:', queriesTargetDefault);
        console.log('Queries copied to:', queriesTarget);
      } else {
        console.error('Queries source not found:', queriesSourcePath);
        return false;
      }

      fs.writeFileSync(configPath, JSON.stringify({ OneRun: 1 }, null, 2));
      console.log('Setup completed.');
    } else {
      console.log('Already initialized, but checking queries...');

      // Queries bar bolup bolmaýandygyny barla
      if (!fs.existsSync(queriesTarget)) {
        console.log('Queries missing, re-copying...');
        if (fs.existsSync(queriesSourcePath)) {
          fs.cpSync(queriesSourcePath, queriesTarget, { recursive: true });
          console.log('Queries re-copied to:', queriesTarget);
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Setup error:', error);
    return false;
  }
}

// DERREW IŞLET - async däl
const setupResult = setupSync();

if (!setupResult) {
  console.error('Setup failed!');
  process.exit(1);
}

module.exports = { setupSync };
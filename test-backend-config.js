#!/usr/bin/env node

/**
 * Backend Connection Configuration Test
 * Tests that all configuration files are correctly set up
 * for both local and production environments
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

console.log(`${colors.cyan}
╔═══════════════════════════════════════════════════════╗
║   BACKEND CONNECTION CONFIGURATION TEST               ║
║   Verifying Local & Production Setup                  ║
╚═══════════════════════════════════════════════════════╝
${colors.reset}`);

// Test results
const results = {
  passed: [],
  failed: [],
  warnings: []
};

// Helper functions
function pass(test) {
  results.passed.push(test);
  console.log(`${colors.green}✅ ${test}${colors.reset}`);
}

function fail(test, reason) {
  results.failed.push({ test, reason });
  console.log(`${colors.red}❌ ${test}${colors.reset}`);
  if (reason) console.log(`   ${colors.red}   Reason: ${reason}${colors.reset}`);
}

function warn(test, reason) {
  results.warnings.push({ test, reason });
  console.log(`${colors.yellow}⚠️  ${test}${colors.reset}`);
  if (reason) console.log(`   ${colors.yellow}   Note: ${reason}${colors.reset}`);
}

function readEnvFile(filename) {
  try {
    const content = fs.readFileSync(filename, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    return env;
  } catch (error) {
    return null;
  }
}

function readJsFile(filename) {
  try {
    return fs.readFileSync(filename, 'utf8');
  } catch (error) {
    return null;
  }
}

console.log(`\n${colors.cyan}📋 TEST 1: Environment Variables${colors.reset}\n`);

// Test .env.development
const envDev = readEnvFile('.env.development');
if (envDev) {
  pass('Found .env.development file');
  
  if (envDev.API_BASE_URL) {
    const port = envDev.API_BASE_URL.match(/:(\d+)/)?.[1];
    console.log(`   ${colors.blue}→ API_BASE_URL: ${envDev.API_BASE_URL}${colors.reset}`);
    console.log(`   ${colors.blue}→ Port: ${port}${colors.reset}`);
    
    if (port === '8001' || port === '8081') {
      pass(`Development port is ${port}`);
    } else {
      warn(`Development port is ${port}`, 'Expected 8001 or 8081');
    }
  } else {
    fail('API_BASE_URL not found in .env.development');
  }
  
  if (envDev.BACKEND_URL) {
    console.log(`   ${colors.blue}→ BACKEND_URL: ${envDev.BACKEND_URL}${colors.reset}`);
    if (envDev.BACKEND_URL === envDev.API_BASE_URL) {
      pass('BACKEND_URL matches API_BASE_URL');
    }
  }
  
  if (envDev.ANDROID_EMULATOR_URL) {
    console.log(`   ${colors.blue}→ ANDROID_EMULATOR_URL: ${envDev.ANDROID_EMULATOR_URL}${colors.reset}`);
    if (envDev.ANDROID_EMULATOR_URL.includes('10.0.2.2')) {
      pass('Android emulator URL correctly uses 10.0.2.2');
    } else {
      fail('Android emulator URL should use 10.0.2.2');
    }
  }
} else {
  fail('Could not find .env.development file');
}

console.log('');

// Test .env.production
const envProd = readEnvFile('.env.production');
if (envProd) {
  pass('Found .env.production file');
  
  if (envProd.API_BASE_URL) {
    console.log(`   ${colors.blue}→ API_BASE_URL: ${envProd.API_BASE_URL}${colors.reset}`);
    
    if (envProd.API_BASE_URL.includes('185.193.19.244:8080')) {
      pass('Production API URL is correct (185.193.19.244:8080)');
    } else {
      fail('Production API URL incorrect', 'Expected http://185.193.19.244:8080/api');
    }
  } else {
    fail('API_BASE_URL not found in .env.production');
  }
  
  if (envProd.BACKEND_URL) {
    console.log(`   ${colors.blue}→ BACKEND_URL: ${envProd.BACKEND_URL}${colors.reset}`);
  }
} else {
  fail('Could not find .env.production file');
}

console.log(`\n${colors.cyan}📋 TEST 2: Configuration Files${colors.reset}\n`);

// Test environment.js
const envJs = readJsFile('src/config/environment.js');
if (envJs) {
  pass('Found src/config/environment.js');
  
  // Check if it reads from Config
  if (envJs.includes('Config.API_BASE_URL')) {
    pass('Reads API_BASE_URL from environment variables');
  } else {
    fail('Does not read API_BASE_URL from environment variables');
  }
  
  // Check if it has platform-specific logic
  if (envJs.includes('Platform.OS === \'android\'') && envJs.includes('10.0.2.2')) {
    pass('Has Android emulator support (10.0.2.2)');
  } else {
    warn('May not have Android emulator support');
  }
  
  // Check fallback URLs
  if (envJs.includes('http://localhost:8001') || envJs.includes('http://localhost:8081')) {
    const port = envJs.includes('8001') ? '8001' : '8081';
    pass(`Has fallback localhost URL (port ${port})`);
  }
  
  if (envJs.includes('185.193.19.244:8080')) {
    pass('Has fallback production URL (185.193.19.244:8080)');
  }
} else {
  fail('Could not find src/config/environment.js');
}

console.log('');

// Test apiConfig.js
const apiConfigJs = readJsFile('src/config/apiConfig.js');
if (apiConfigJs) {
  pass('Found src/config/apiConfig.js');
  
  // Check if it uses environmentConfig
  if (apiConfigJs.includes('environmentConfig.getApiUrl')) {
    pass('Uses environmentConfig.getApiUrl() (correct)');
  } else if (apiConfigJs.includes('http://localhost:')) {
    const hardcodedPort = apiConfigJs.match(/localhost:(\d+)/)?.[1];
    warn('Has hardcoded localhost URL', `Port ${hardcodedPort} - should use environmentConfig`);
  }
} else {
  fail('Could not find src/config/apiConfig.js');
}

console.log('');

// Test yoraaBackendAPI.js
const yoraaApiJs = readJsFile('src/services/yoraaBackendAPI.js');
if (yoraaApiJs) {
  pass('Found src/services/yoraaBackendAPI.js');
  
  // Check if it uses environmentConfig
  if (yoraaApiJs.includes('environmentConfig.getApiUrl')) {
    pass('Uses environmentConfig.getApiUrl() (correct)');
  } else if (yoraaApiJs.includes('__DEV__')) {
    warn('Uses __DEV__ directly', 'Should use environmentConfig for consistency');
  }
} else {
  fail('Could not find src/services/yoraaBackendAPI.js');
}

console.log(`\n${colors.cyan}📋 TEST 3: Configuration Consistency${colors.reset}\n`);

// Check consistency between files
if (envDev && envProd) {
  const devPort = envDev.API_BASE_URL?.match(/:(\d+)/)?.[1];
  const prodPort = envProd.API_BASE_URL?.match(/:(\d+)/)?.[1];
  
  if (devPort && prodPort) {
    console.log(`   ${colors.blue}→ Development port: ${devPort}${colors.reset}`);
    console.log(`   ${colors.blue}→ Production port: ${prodPort}${colors.reset}`);
    
    if (devPort !== prodPort) {
      pass('Development and production use different ports (correct)');
    } else {
      warn('Development and production use same port', 'This may be intentional');
    }
  }
  
  // Check if all files reference the same ports
  const allFiles = [envJs, apiConfigJs, yoraaApiJs].filter(Boolean);
  const portsInCode = new Set();
  
  allFiles.forEach(content => {
    const matches = content.match(/localhost:(\d+)/g);
    if (matches) {
      matches.forEach(match => {
        const port = match.split(':')[1];
        portsInCode.add(port);
      });
    }
  });
  
  if (portsInCode.size === 0) {
    pass('No hardcoded ports found (using env vars)');
  } else if (portsInCode.size === 1) {
    const port = Array.from(portsInCode)[0];
    if (port === devPort) {
      pass(`All files reference port ${port} consistently`);
    } else {
      warn(`Files reference port ${port}, but .env has ${devPort}`);
    }
  } else {
    warn('Multiple different ports found in code', `Ports: ${Array.from(portsInCode).join(', ')}`);
  }
}

// Summary
console.log(`\n${colors.cyan}
╔═══════════════════════════════════════════════════════╗
║   TEST SUMMARY                                        ║
╚═══════════════════════════════════════════════════════╝
${colors.reset}`);

console.log(`${colors.green}✅ Passed: ${results.passed.length}${colors.reset}`);
results.passed.forEach(test => {
  console.log(`   • ${test}`);
});

if (results.warnings.length > 0) {
  console.log(`\n${colors.yellow}⚠️  Warnings: ${results.warnings.length}${colors.reset}`);
  results.warnings.forEach(({ test, reason }) => {
    console.log(`   • ${test}`);
    if (reason) console.log(`     ${reason}`);
  });
}

if (results.failed.length > 0) {
  console.log(`\n${colors.red}❌ Failed: ${results.failed.length}${colors.reset}`);
  results.failed.forEach(({ test, reason }) => {
    console.log(`   • ${test}`);
    if (reason) console.log(`     ${reason}`);
  });
}

// Recommendations
console.log(`\n${colors.cyan}📝 Recommendations:${colors.reset}\n`);

if (envDev && envDev.API_BASE_URL) {
  const port = envDev.API_BASE_URL.match(/:(\d+)/)?.[1];
  console.log(`1. Start your backend with: ${colors.green}PORT=${port} npm run dev${colors.reset}`);
} else {
  console.log(`1. Start your backend with: ${colors.green}PORT=8001 npm run dev${colors.reset}`);
}

console.log(`2. Verify backend: ${colors.green}curl http://localhost:8001/health${colors.reset}`);
console.log(`3. Reload React Native app to apply changes`);
console.log(`4. Check logs for correct API URL`);

console.log(`\n${colors.cyan}🔗 Quick Test Commands:${colors.reset}\n`);
console.log(`# Test local backend:`);
console.log(`curl http://localhost:8001/health`);
console.log(`curl http://localhost:8001/api/health`);
console.log(``);
console.log(`# Test production backend:`);
console.log(`curl http://185.193.19.244:8080/health`);
console.log(`curl http://185.193.19.244:8080/api/health`);

console.log('');

// Exit code
process.exit(results.failed.length > 0 ? 1 : 0);

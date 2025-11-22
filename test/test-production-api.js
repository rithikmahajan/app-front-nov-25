#!/usr/bin/env node

/**
 * Production Backend API Test Script
 * Tests connectivity and basic endpoints of the production backend
 */

const https = require('https');
const http = require('http');

// Production API Configuration
const PROD_CONFIG = {
  host: '185.193.19.244',
  port: 8080,
  protocol: 'http',
  baseUrl: 'http://185.193.19.244:8080',
  apiUrl: 'http://185.193.19.244:8080/api',
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      timeout: 10000,
    };

    const req = client.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Test functions
async function testHealthEndpoint() {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}Testing Health Endpoint${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  try {
    console.log(`📡 Requesting: ${PROD_CONFIG.baseUrl}/health`);
    const response = await makeRequest(`${PROD_CONFIG.baseUrl}/health`);

    if (response.status === 200) {
      console.log(`${colors.green}✅ Health check passed!${colors.reset}`);
      console.log(`${colors.green}Status: ${response.data.status}${colors.reset}`);
      console.log(`${colors.blue}Uptime: ${response.data.uptime}s${colors.reset}`);
      console.log(`${colors.blue}Timestamp: ${response.data.timestamp}${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}❌ Health check failed with status: ${response.status}${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Health check failed: ${error.message}${colors.reset}`);
    return false;
  }
}

async function testCategoriesEndpoint() {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}Testing Categories Endpoint${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  try {
    console.log(`📡 Requesting: ${PROD_CONFIG.apiUrl}/categories`);
    const response = await makeRequest(`${PROD_CONFIG.apiUrl}/categories`);

    if (response.status === 200) {
      console.log(`${colors.green}✅ Categories endpoint working!${colors.reset}`);
      
      if (Array.isArray(response.data)) {
        console.log(`${colors.blue}📦 Found ${response.data.length} categories${colors.reset}`);
        if (response.data.length > 0) {
          console.log(`${colors.blue}First category: ${response.data[0].name || 'N/A'}${colors.reset}`);
        }
      } else if (response.data.categories) {
        console.log(`${colors.blue}📦 Found ${response.data.categories.length} categories${colors.reset}`);
      }
      return true;
    } else {
      console.log(`${colors.red}❌ Categories endpoint failed with status: ${response.status}${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Categories endpoint failed: ${error.message}${colors.reset}`);
    return false;
  }
}

async function testProductsEndpoint() {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}Testing Products Endpoint${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  try {
    console.log(`📡 Requesting: ${PROD_CONFIG.apiUrl}/products`);
    const response = await makeRequest(`${PROD_CONFIG.apiUrl}/products`);

    if (response.status === 200) {
      console.log(`${colors.green}✅ Products endpoint working!${colors.reset}`);
      
      if (Array.isArray(response.data)) {
        console.log(`${colors.blue}📦 Found ${response.data.length} products${colors.reset}`);
      } else if (response.data.products) {
        console.log(`${colors.blue}📦 Found ${response.data.products.length} products${colors.reset}`);
      } else if (response.data.data) {
        console.log(`${colors.blue}📦 Response contains data object${colors.reset}`);
      }
      return true;
    } else {
      console.log(`${colors.red}❌ Products endpoint failed with status: ${response.status}${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Products endpoint failed: ${error.message}${colors.reset}`);
    return false;
  }
}

async function testNetworkConnectivity() {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}Testing Network Connectivity${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  return new Promise((resolve) => {
    const net = require('net');
    const socket = new net.Socket();
    const timeout = 5000;

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      console.log(`${colors.green}✅ Server is reachable on ${PROD_CONFIG.host}:${PROD_CONFIG.port}${colors.reset}`);
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      console.log(`${colors.red}❌ Connection timeout${colors.reset}`);
      socket.destroy();
      resolve(false);
    });

    socket.on('error', (error) => {
      console.log(`${colors.red}❌ Connection error: ${error.message}${colors.reset}`);
      resolve(false);
    });

    socket.connect(PROD_CONFIG.port, PROD_CONFIG.host);
  });
}

// Main test runner
async function runTests() {
  console.log(`${colors.bright}${colors.blue}`);
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║          🚀 YORAA Production Backend API Test 🚀           ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(colors.reset);

  console.log(`${colors.cyan}Configuration:${colors.reset}`);
  console.log(`  Host: ${PROD_CONFIG.host}`);
  console.log(`  Port: ${PROD_CONFIG.port}`);
  console.log(`  Base URL: ${PROD_CONFIG.baseUrl}`);
  console.log(`  API URL: ${PROD_CONFIG.apiUrl}`);

  const results = {
    connectivity: false,
    health: false,
    categories: false,
    products: false,
  };

  // Run tests
  results.connectivity = await testNetworkConnectivity();
  
  if (results.connectivity) {
    results.health = await testHealthEndpoint();
    results.categories = await testCategoriesEndpoint();
    results.products = await testProductsEndpoint();
  } else {
    console.log(`\n${colors.yellow}⚠️  Skipping API tests due to connectivity issues${colors.reset}`);
  }

  // Print summary
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}Test Summary${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  const getStatusIcon = (passed) => passed ? `${colors.green}✅` : `${colors.red}❌`;

  console.log(`${getStatusIcon(results.connectivity)} Network Connectivity${colors.reset}`);
  console.log(`${getStatusIcon(results.health)} Health Endpoint${colors.reset}`);
  console.log(`${getStatusIcon(results.categories)} Categories Endpoint${colors.reset}`);
  console.log(`${getStatusIcon(results.products)} Products Endpoint${colors.reset}`);

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  const successRate = ((passedTests / totalTests) * 100).toFixed(0);

  console.log(`\n${colors.bright}Results: ${passedTests}/${totalTests} tests passed (${successRate}%)${colors.reset}`);

  if (passedTests === totalTests) {
    console.log(`\n${colors.green}${colors.bright}🎉 All tests passed! Backend is ready for integration! 🎉${colors.reset}\n`);
    return 0;
  } else if (passedTests > 0) {
    console.log(`\n${colors.yellow}⚠️  Some tests failed. Please check the errors above.${colors.reset}\n`);
    return 1;
  } else {
    console.log(`\n${colors.red}❌ All tests failed. Backend may be down or unreachable.${colors.reset}\n`);
    return 2;
  }
}

// Run the tests
runTests()
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((error) => {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    process.exit(3);
  });

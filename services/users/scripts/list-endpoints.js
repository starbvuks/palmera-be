const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

// Read serverless.yaml
const serverlessPath = path.join(__dirname, '../serverless.yaml');
const serverlessConfig = yaml.load(fs.readFileSync(serverlessPath, 'utf8'));

// Get service name and stage
const serviceName = serverlessConfig.service;
const stage = process.env.STAGE || 'dev';
const region = serverlessConfig.provider.region || 'us-east-1';

// Base URL format for API Gateway
const baseUrl = `https://${serviceName}-${stage}.execute-api.${region}.amazonaws.com/${stage}`;

console.log('\n=== API Endpoints ===\n');
console.log(`Service: ${serviceName}`);
console.log(`Stage: ${stage}`);
console.log(`Region: ${region}`);
console.log(`Base URL: ${baseUrl}\n`);

// List all functions and their endpoints
Object.entries(serverlessConfig.functions).forEach(([functionName, config]) => {
  if (config.events) {
    config.events.forEach(event => {
      if (event.http) {
        const method = event.http.method.toUpperCase();
        const path = event.http.path;
        const fullUrl = `${baseUrl}${path}`;
        console.log(`${method.padEnd(7)} ${fullUrl}`);
        console.log(`         Handler: ${config.handler}`);
        console.log('         ---');
      }
    });
  }
});
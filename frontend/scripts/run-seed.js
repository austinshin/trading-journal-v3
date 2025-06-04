// Simple Node.js script to run the seeding
const { exec } = require('child_process');
const path = require('path');

console.log('🌱 Running trade seeding script...\n');

// Run the TypeScript file with ts-node
const command = `npx ts-node --esm ${path.join(__dirname, 'seed-trades.ts')}`;

exec(command, { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error running seed script:');
    console.error(error);
    return;
  }
  
  if (stderr) {
    console.error('⚠️  Stderr output:');
    console.error(stderr);
  }
  
  console.log(stdout);
}); 
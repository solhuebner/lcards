#!/usr/bin/env node

/**
 * Test script to verify the fixes for MSD control overlay issues
 * 
 * This script validates:
 * 1. The updateComplete await is present in lcards-msd.js
 * 2. The entity validation skip logic is present in validation-service/index.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = join(__dirname, '..');

// ANSI color codes
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, checks) {
  log(`\n📄 Checking ${filePath}...`, 'blue');
  
  let content;
  try {
    content = readFileSync(join(repoRoot, filePath), 'utf-8');
  } catch (error) {
    log(`  ❌ Failed to read file: ${error.message}`, 'red');
    return false;
  }
  
  let allPassed = true;
  
  for (const check of checks) {
    const found = check.test instanceof RegExp 
      ? check.test.test(content)
      : content.includes(check.test);
    
    if (found) {
      log(`  ✅ ${check.description}`, 'green');
    } else {
      log(`  ❌ ${check.description}`, 'red');
      if (check.hint) {
        log(`     Hint: ${check.hint}`, 'yellow');
      }
      allPassed = false;
    }
  }
  
  return allPassed;
}

// Main validation
log('🔍 Verifying MSD Control Overlay Fixes\n', 'blue');

const tests = [
  {
    file: 'src/cards/lcards-msd.js',
    checks: [
      {
        description: 'Contains await this.updateComplete before pipeline init',
        test: /await\s+this\.updateComplete\s*;?\s*[\s\S]*await\s+this\._initializeMsdPipeline/,
        hint: 'Should add "await this.updateComplete;" before "_initializeMsdPipeline()"'
      },
      {
        description: 'Has comment explaining the fix',
        test: /Lit.*render.*complete.*before.*pipeline/i,
        hint: 'Should have a comment explaining why we wait for Lit render'
      },
      {
        description: 'Has debug logging for updateComplete',
        test: /Waiting for Lit render to complete/,
        hint: 'Should log when waiting for Lit render'
      }
    ]
  },
  {
    file: 'src/core/validation-service/index.js',
    checks: [
      {
        description: 'Skips validation for .card. paths',
        test: /\.card\./,
        hint: 'Should check if path includes ".card."'
      },
      {
        description: 'Skips validation for .card_config. paths',
        test: /\.card_config\./,
        hint: 'Should check if path includes ".card_config."'
      },
      {
        description: 'Skips validation for .cardConfig. paths',
        test: /\.cardConfig\./,
        hint: 'Should check if path includes ".cardConfig."'
      },
      {
        description: 'Has comment explaining the entity validation skip',
        test: /Skip validation for.*control overlay.*card/i,
        hint: 'Should have a comment explaining why we skip nested card validation'
      },
      {
        description: 'Returns early for nested card properties',
        test: /if.*\.card\./s,
        hint: 'Should return early if path contains card property'
      }
    ]
  }
];

let allTestsPassed = true;

for (const test of tests) {
  const passed = checkFile(test.file, test.checks);
  if (!passed) {
    allTestsPassed = false;
  }
}

// Summary
log('\n' + '═'.repeat(60), 'blue');
if (allTestsPassed) {
  log('✅ All verification checks passed!', 'green');
  log('\nNext steps:', 'blue');
  log('  1. Build the project: npm run build', 'yellow');
  log('  2. Copy dist/lcards.js to Home Assistant www/community/lcards/', 'yellow');
  log('  3. Test with the config in test-control-overlay-fix.yaml', 'yellow');
  log('  4. Verify in browser console:', 'yellow');
  log('     - No "No SVG element found" errors', 'yellow');
  log('     - No false entity validation warnings', 'yellow');
  log('     - Control overlays render correctly', 'yellow');
  process.exit(0);
} else {
  log('❌ Some verification checks failed', 'red');
  log('Please review the failures above and ensure all fixes are applied correctly.', 'yellow');
  process.exit(1);
}

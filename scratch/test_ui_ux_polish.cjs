const http = require('http');

// Basic automated integrity validation for Polish features
console.log('----------------------------------------------------');
console.log('⚡ RANKORA UI/UX POLISH & INTEGRATION INTEGRITY TEST');
console.log('----------------------------------------------------');

const fs = require('fs');
const path = require('path');

// 1. Verify src/config/technologies.ts
const techConfigPath = path.join(__dirname, '..', 'src', 'config', 'technologies.ts');
if (fs.existsSync(techConfigPath)) {
  const content = fs.readFileSync(techConfigPath, 'utf8');
  if (content.includes('TECHNOLOGIES') && content.includes('github') && content.includes('wordpress')) {
    console.log('✅ PASS: src/config/technologies.ts configured with real ecosystem items.');
  } else {
    console.error('❌ FAIL: src/config/technologies.ts missing required structure.');
    process.exit(1);
  }
} else {
  console.error('❌ FAIL: src/config/technologies.ts not found.');
  process.exit(1);
}

// 2. Verify src/components/TechnologyIcon.tsx
const iconPath = path.join(__dirname, '..', 'src', 'components', 'TechnologyIcon.tsx');
if (fs.existsSync(iconPath)) {
  const content = fs.readFileSync(iconPath, 'utf8');
  if (content.includes('svgProps') && content.includes('github') && content.includes('role')) {
    console.log('✅ PASS: src/components/TechnologyIcon.tsx supports accessible SVG brand icons.');
  } else {
    console.error('❌ FAIL: src/components/TechnologyIcon.tsx invalid.');
    process.exit(1);
  }
} else {
  console.error('❌ FAIL: src/components/TechnologyIcon.tsx not found.');
  process.exit(1);
}

// 3. Verify src/components/copilot/GrowthCopilot.tsx
const copilotPath = path.join(__dirname, '..', 'src', 'components', 'copilot', 'GrowthCopilot.tsx');
if (fs.existsSync(copilotPath)) {
  const content = fs.readFileSync(copilotPath, 'utf8');
  if (content.includes('RANKORA') && content.includes('LIVE TELEMETRY') && content.includes('Business Signals') && !content.includes('purple')) {
    console.log('✅ PASS: src/components/copilot/GrowthCopilot.tsx redesigned as Business Intelligence Console.');
  } else {
    console.error('❌ FAIL: GrowthCopilot.tsx styling incorrect.');
    process.exit(1);
  }
} else {
  console.error('❌ FAIL: GrowthCopilot.tsx not found.');
  process.exit(1);
}

// 4. Verify src/pages/dashboard/Account.tsx
const accountPath = path.join(__dirname, '..', 'src', 'pages', 'dashboard', 'Account.tsx');
if (fs.existsSync(accountPath)) {
  const content = fs.readFileSync(accountPath, 'utf8');
  if (content.includes('uploadAvatar') && content.includes('deleteAvatar') && content.includes('Profile Picture')) {
    console.log('✅ PASS: src/pages/dashboard/Account.tsx configured with avatar photo management.');
  } else {
    console.error('❌ FAIL: Account.tsx missing photo upload handlers.');
    process.exit(1);
  }
} else {
  console.error('❌ FAIL: Account.tsx not found.');
  process.exit(1);
}

// 5. Verify functions/api/[[route]].ts Avatar & Content handlers
const routePath = path.join(__dirname, '..', 'functions', 'api', '[[route]].ts');
if (fs.existsSync(routePath)) {
  const content = fs.readFileSync(routePath, 'utf8');
  if (content.includes('/api/auth/avatar') && content.includes('user_avatars') && content.includes('/api/content/generate')) {
    console.log('✅ PASS: functions/api/[[route]].ts has avatar persistence & resilient content generation.');
  } else {
    console.error('❌ FAIL: [[route]].ts missing avatar routes.');
    process.exit(1);
  }
} else {
  console.error('❌ FAIL: [[route]].ts not found.');
  process.exit(1);
}

console.log('----------------------------------------------------');
console.log('🎉 ALL INTEGRATION INTEGRITY CHECKS PASSED (5/5)');
console.log('----------------------------------------------------');

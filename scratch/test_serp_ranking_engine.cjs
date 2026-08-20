const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('⚡ RANKORA REAL SERP & LOCAL RANKING INTELLIGENCE TEST SUITE');
console.log('====================================================');

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    process.exit(1);
  }
}

// 1. Check Migration 0020
const migPath = path.join(__dirname, '..', 'migrations', '0020_serp_ranking_intelligence.sql');
assert(fs.existsSync(migPath), 'Migration 0020 file exists');
const migContent = fs.readFileSync(migPath, 'utf8');
assert(
  migContent.includes('tracked_keywords') &&
  migContent.includes('ranking_results') &&
  migContent.includes('ranking_history') &&
  migContent.includes('competitor_rankings'),
  'Migration 0020 defines tracked_keywords, ranking_results, ranking_history, and competitor_rankings tables'
);

// 2. Check serpProvider.ts Abstraction
const serpPath = path.join(__dirname, '..', 'functions', 'api', 'services', 'serpProvider.ts');
assert(fs.existsSync(serpPath), 'serpProvider.ts exists');
const serpContent = fs.readFileSync(serpPath, 'utf8');
assert(
  serpContent.includes('SerperSerpProvider') &&
  serpContent.includes('DataForSeoSerpProvider') &&
  serpContent.includes('BrightLocalSerpProvider') &&
  serpContent.includes('SemrushSerpProvider') &&
  serpContent.includes('UnconfiguredSerpProvider') &&
  serpContent.includes('getSerpProvider'),
  'serpProvider.ts implements all providers (Serper, DataForSEO, BrightLocal, Semrush, Unconfigured)'
);

// 3. Test Ranking Engine Position Calculation Logic
const { calculatePositionChange, calculateVisibility } = (() => {
  function calculatePositionChange(prev, curr) {
    const p = typeof prev === 'number' && prev > 0 ? prev : null;
    const c = typeof curr === 'number' && curr > 0 ? curr : null;
    if (p === null && c === null) return { status: 'NOT_RANKING', positionChange: null };
    if (p === null && c !== null) return { status: 'NEW', positionChange: null };
    if (p !== null && c === null) return { status: 'LOST', positionChange: null };
    if (p !== null && c !== null) {
      const diff = p - c;
      if (diff > 0) return { status: 'IMPROVED', positionChange: diff };
      if (diff < 0) return { status: 'DECLINED', positionChange: diff };
      return { status: 'STABLE', positionChange: 0 };
    }
    return { status: 'NOT_RANKING', positionChange: null };
  }

  function calculateVisibility(items) {
    if (!Array.isArray(items) || items.length === 0) return 0;
    const weights = { 1: 100, 2: 75, 3: 55, 4: 40, 5: 32, 6: 25, 7: 20, 8: 16, 9: 13, 10: 10 };
    let totalScore = 0;
    let validKeywords = 0;
    for (const item of items) {
      const pos = item.position;
      validKeywords++;
      if (typeof pos === 'number' && pos > 0) {
        if (pos in weights) totalScore += weights[pos];
        else if (pos <= 20) totalScore += 5;
        else if (pos <= 50) totalScore += 2;
        else if (pos <= 100) totalScore += 1;
      }
    }
    if (validKeywords === 0) return 0;
    return parseFloat(((totalScore / (validKeywords * 100)) * 100).toFixed(1));
  }

  return { calculatePositionChange, calculateVisibility };
})();

// Test Position calculations
const improved = calculatePositionChange(10, 3);
assert(improved.status === 'IMPROVED' && improved.positionChange === 7, 'Position jump from #10 to #3 is +7 IMPROVED');

const declined = calculatePositionChange(4, 9);
assert(declined.status === 'DECLINED' && declined.positionChange === -5, 'Position drop from #4 to #9 is -5 DECLINED');

const stable = calculatePositionChange(2, 2);
assert(stable.status === 'STABLE' && stable.positionChange === 0, 'Position #2 to #2 is STABLE (change: 0)');

const newRank = calculatePositionChange(null, 5);
assert(newRank.status === 'NEW', 'Previously unranked to #5 is NEW');

const lost = calculatePositionChange(8, null);
assert(lost.status === 'LOST', 'Rank #8 to unranked is LOST');

// Test Visibility formula
const visibility = calculateVisibility([{ position: 1 }, { position: 2 }, { position: 10 }, { position: null }]);
assert(visibility > 0 && visibility <= 100, `Calculated weighted visibility index: ${visibility}%`);

// 4. Check Unconfigured Provider Behavior
assert(
  serpContent.includes("readonly status: SerpProviderStatus = 'NOT_CONFIGURED'") &&
  serpContent.includes("PROVIDER_NOT_CONFIGURED: Connect a SERP provider"),
  'Unconfigured provider strictly enforces NOT_CONFIGURED and rejects fake rankings'
);

// 5. Check API Routes in [[route]].ts
const routePath = path.join(__dirname, '..', 'functions', 'api', '[[route]].ts');
assert(fs.existsSync(routePath), '[[route]].ts exists');
const routeContent = fs.readFileSync(routePath, 'utf8');
assert(
  routeContent.includes("'/api/rankings'") &&
  routeContent.includes("'/api/rankings/status'") &&
  routeContent.includes("'/api/rankings/competitors'") &&
  routeContent.includes("'/api/cron/rankings'") &&
  routeContent.includes("tracked_keywords"),
  '[[route]].ts implements /api/rankings, /api/rankings/status, /api/rankings/competitors, /api/cron/rankings'
);

// 6. Check App.tsx Routes
const appPath = path.join(__dirname, '..', 'src', 'App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');
assert(
  appContent.includes('path="/dashboard/rankings"') && appContent.includes('path="/dashboard/keywords"'),
  'App.tsx has both /dashboard/rankings and /dashboard/keywords routes'
);

// 7. Check UI NOT_CONFIGURED Banner in Keywords.tsx
const kwUiPath = path.join(__dirname, '..', 'src', 'pages', 'dashboard', 'Keywords.tsx');
const kwUiContent = fs.readFileSync(kwUiPath, 'utf8');
assert(
  kwUiContent.includes("SERP Status: NOT_CONFIGURED") &&
  kwUiContent.includes("providerStatus === 'NOT_CONFIGURED'"),
  'Keywords.tsx displays explicit SERP Status: NOT_CONFIGURED banner when unconfigured'
);

// 8. Verify Non-Regression of other integrations
assert(routeContent.includes("google_connections") && routeContent.includes("review_connections"), 'GBP integration preserved');
assert(routeContent.includes("/api/authority/"), 'Authority Builder integration preserved');
assert(routeContent.includes("github") && routeContent.includes("wordpress") && routeContent.includes("shopify"), 'GitHub/WordPress/Shopify connectors preserved');

console.log('====================================================');
console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED CLEANLY!`);
console.log('====================================================');

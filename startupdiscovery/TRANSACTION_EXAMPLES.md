# 🔄 Prisma Transaction Examples

**Kalvium Concept 2.16 - StartupDiscovery Project**

---

## What Are Transactions?

**Transaction = Multiple database operations that MUST all succeed or all fail together**

### Real-World Example:

```
Imagine transferring money:
1. Deduct $100 from Account A
2. Add $100 to Account B

❌ WITHOUT Transaction:
- Step 1 succeeds → Account A loses $100
- Step 2 fails → Account B doesn't get $100
- Money disappeared! 💸

✅ WITH Transaction:
- Step 1 succeeds → Account A loses $100
- Step 2 fails → ROLLBACK
- Account A gets $100 back
- Money is safe! ✅
```

---

## 1️⃣ Array-Based Transaction: `prisma.$transaction([...])`

**Use when:** You have multiple operations that don't depend on each other's results.

### Example: Create Startup with Vote

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createStartupWithVote() {
  try {
    // Both operations happen together or both rollback
    const [startup, vote] = await prisma.$transaction([
      // Operation 1: Create startup
      prisma.startup.create({
        data: {
          name: "AI Assistant Pro",
          slug: "ai-assistant-pro",
          tagline: "Your personal AI helper",
          description: "Advanced AI-powered productivity tool",
          userId: 1,
          categoryId: 1,
          fundingGoal: 50000,
        },
      }),

      // Operation 2: Create initial vote (upvote from founder)
      prisma.vote.create({
        data: {
          userId: 1,
          startupId: 1, // Assumes we know the ID
          value: 1,
        },
      }),
    ]);

    console.log("✅ Transaction succeeded!");
    console.log("Created startup:", startup.name);
    console.log("Created vote:", vote.value);

    return { startup, vote };
  } catch (error) {
    console.error("❌ Transaction failed - all operations rolled back");
    console.error("Error:", error);
    throw error;
  }
}

// Run it
createStartupWithVote();
```

**What happens:**

- ✅ Both startup AND vote are created
- ❌ OR neither is created (if any operation fails)
- 🔄 Automatic rollback on failure

---

## 2️⃣ Interactive Transaction: `prisma.$transaction(async (tx) => {})`

**Use when:** Operations depend on each other's results (more common in real projects).

### Example: Create Startup with Initial Comment and Bookmark

```typescript
async function createStartupWithEngagement(
  userId: number,
  startupData: {
    name: string;
    slug: string;
    tagline: string;
    description: string;
    categoryId: number;
  }
) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Create the startup
      const startup = await tx.startup.create({
        data: {
          ...startupData,
          userId,
          fundingGoal: 100000,
        },
      });

      console.log(`✅ Step 1: Created startup ID ${startup.id}`);

      // Step 2: Create initial comment (uses startup.id from step 1)
      const comment = await tx.comment.create({
        data: {
          content: "Excited to launch this project!",
          userId,
          startupId: startup.id, // ← Uses result from step 1
        },
      });

      console.log(`✅ Step 2: Created comment ID ${comment.id}`);

      // Step 3: Bookmark your own startup
      const bookmark = await tx.bookmark.create({
        data: {
          userId,
          startupId: startup.id, // ← Uses result from step 1
        },
      });

      console.log(`✅ Step 3: Created bookmark ID ${bookmark.id}`);

      // Step 4: Update startup's comment count
      const updatedStartup = await tx.startup.update({
        where: { id: startup.id },
        data: {
          commentCount: { increment: 1 },
        },
      });

      console.log(`✅ Step 4: Updated comment count`);

      return { startup: updatedStartup, comment, bookmark };
    });

    console.log("🎉 Transaction completed successfully!");
    return result;
  } catch (error) {
    console.error("❌ Transaction failed - all operations rolled back");
    console.error("Error:", error);
    throw error;
  }
}

// Run it
createStartupWithEngagement(1, {
  name: "HealthTrack Pro",
  slug: "healthtrack-pro",
  tagline: "Track your health metrics",
  description: "Comprehensive health monitoring platform",
  categoryId: 4, // HealthTech
});
```

**Why interactive transaction?**

- Each step uses results from previous steps
- `startup.id` is needed for comment and bookmark
- All 4 operations are atomic (all or nothing)

---

## 3️⃣ Demonstrating Rollback (When Transaction Fails)

**This example INTENTIONALLY fails to show rollback in action.**

### Example: Failed Transaction → Automatic Rollback

```typescript
async function demonstrateRollback() {
  console.log("🧪 Testing transaction rollback...\n");

  try {
    await prisma.$transaction(async (tx) => {
      // Step 1: Create a startup (will succeed)
      const startup = await tx.startup.create({
        data: {
          name: "Test Startup",
          slug: "test-startup-" + Date.now(), // Unique slug
          tagline: "Testing rollback",
          description: "This startup should not persist",
          userId: 1,
          categoryId: 1,
          fundingGoal: 10000,
        },
      });

      console.log(`✅ Step 1 succeeded: Created startup ID ${startup.id}`);

      // Step 2: Create a vote (will succeed)
      const vote = await tx.vote.create({
        data: {
          userId: 1,
          startupId: startup.id,
          value: 1,
        },
      });

      console.log(`✅ Step 2 succeeded: Created vote ID ${vote.id}`);

      // Step 3: INTENTIONALLY FAIL (duplicate email - violates unique constraint)
      const user = await tx.user.create({
        data: {
          email: "alice@example.com", // ← Already exists in database!
          name: "Duplicate Alice",
          password: "hashed_password",
        },
      });

      console.log(`✅ Step 3 succeeded: Created user`);

      return { startup, vote, user };
    });

    console.log("🎉 Transaction completed (this should NOT print)");
  } catch (error) {
    console.error("\n❌ Transaction failed as expected!");
    console.error("Error message:", error.message);
    console.log("\n🔄 ROLLBACK occurred:");
    console.log("   ├─ Startup was NOT created (rolled back)");
    console.log("   ├─ Vote was NOT created (rolled back)");
    console.log("   └─ Database state unchanged ✅");
  }
}

// Run it
demonstrateRollback();
```

**Output:**

```
🧪 Testing transaction rollback...

✅ Step 1 succeeded: Created startup ID 123
✅ Step 2 succeeded: Created vote ID 456

❌ Transaction failed as expected!
Error message: Unique constraint failed on the fields: (`email`)

🔄 ROLLBACK occurred:
   ├─ Startup was NOT created (rolled back)
   ├─ Vote was NOT created (rolled back)
   └─ Database state unchanged ✅
```

**What happened:**

1. Startup created ✅
2. Vote created ✅
3. User creation failed ❌ (duplicate email)
4. **AUTOMATIC ROLLBACK** → Startup and Vote are deleted
5. Database returns to original state

---

## 4️⃣ Real-World Use Case: Upvote with Counter Update

**Problem:** When a user upvotes a startup, we need to:

1. Create a vote record
2. Increment the startup's voteCount
3. Both MUST succeed or both MUST fail

### Without Transaction (❌ DANGEROUS)

```typescript
// ❌ DON'T DO THIS - No transaction
async function upvoteStartupDangerous(userId: number, startupId: number) {
  // Step 1: Create vote
  const vote = await prisma.vote.create({
    data: { userId, startupId, value: 1 },
  });
  // ✅ Vote created

  // Step 2: Increment counter
  const startup = await prisma.startup.update({
    where: { id: startupId },
    data: { voteCount: { increment: 1 } },
  });
  // ❌ What if this fails? Vote exists but counter didn't increment!

  return { vote, startup };
}
```

**Problem:**

- If Step 2 fails, we have a vote record but counter is wrong
- Database is in inconsistent state
- Very hard to fix!

### With Transaction (✅ SAFE)

```typescript
// ✅ SAFE - Uses transaction
async function upvoteStartupSafe(userId: number, startupId: number) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Create vote
      const vote = await tx.vote.create({
        data: { userId, startupId, value: 1 },
      });

      // Step 2: Increment counter
      const startup = await tx.startup.update({
        where: { id: startupId },
        data: { voteCount: { increment: 1 } },
      });

      return { vote, startup };
    });

    console.log("✅ Upvote successful!");
    console.log(`Vote count is now: ${result.startup.voteCount}`);
    return result;
  } catch (error) {
    console.error("❌ Upvote failed - no changes made");
    throw error;
  }
}

// Run it
upvoteStartupSafe(2, 1);
```

**Benefits:**

- Both operations succeed together ✅
- Or both fail together ✅
- Database always consistent ✅
- No orphaned votes ✅

---

## 5️⃣ Complete Example: Create Startup with Full Setup

**Real-world scenario:** When creating a startup, set up everything atomically.

```typescript
interface CreateStartupInput {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  userId: number;
  categoryId: number;
  tagIds: number[]; // Array of tag IDs
  fundingGoal: number;
}

async function createStartupComplete(input: CreateStartupInput) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the startup
      const startup = await tx.startup.create({
        data: {
          name: input.name,
          slug: input.slug,
          tagline: input.tagline,
          description: input.description,
          userId: input.userId,
          categoryId: input.categoryId,
          fundingGoal: input.fundingGoal,
        },
      });

      console.log(`✅ Created startup: ${startup.name}`);

      // 2. Create startup-tag relationships
      const startupTags = await tx.startupTag.createMany({
        data: input.tagIds.map((tagId) => ({
          startupId: startup.id,
          tagId,
        })),
      });

      console.log(`✅ Added ${startupTags.count} tags`);

      // 3. Create initial vote from founder
      const vote = await tx.vote.create({
        data: {
          userId: input.userId,
          startupId: startup.id,
          value: 1,
        },
      });

      console.log(`✅ Created initial vote`);

      // 4. Update startup's vote count
      const updatedStartup = await tx.startup.update({
        where: { id: startup.id },
        data: {
          voteCount: 1,
        },
      });

      console.log(`✅ Updated vote count`);

      // 5. Create founder's bookmark
      const bookmark = await tx.bookmark.create({
        data: {
          userId: input.userId,
          startupId: startup.id,
        },
      });

      console.log(`✅ Created bookmark`);

      return {
        startup: updatedStartup,
        tagCount: startupTags.count,
        vote,
        bookmark,
      };
    });

    console.log("\n🎉 Complete startup setup successful!");
    return result;
  } catch (error) {
    console.error("\n❌ Startup creation failed - all operations rolled back");
    console.error("Error:", error);
    throw error;
  }
}

// Run it
createStartupComplete({
  name: "EcoTracker",
  slug: "ecotracker",
  tagline: "Track your carbon footprint",
  description: "Help save the planet by monitoring your environmental impact",
  userId: 1,
  categoryId: 1,
  tagIds: [1, 2, 3], // SaaS, AI, Sustainability tags
  fundingGoal: 150000,
});
```

**Output:**

```
✅ Created startup: EcoTracker
✅ Added 3 tags
✅ Created initial vote
✅ Updated vote count
✅ Created bookmark

🎉 Complete startup setup successful!
```

**If ANY step fails:**

```
❌ Startup creation failed - all operations rolled back

No startup created
No tags created
No vote created
No bookmark created
Database unchanged ✅
```

---

## 6️⃣ Error Handling Best Practices

### Pattern 1: Try-Catch with Logging

```typescript
async function safeTransaction() {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Your operations here
      const data = await tx.someModel.create({ data: {...} });
      return data;
    });

    console.log('✅ Success:', result);
    return result;
  } catch (error) {
    console.error('❌ Transaction failed:', error.message);

    // Log for debugging
    if (error.code === 'P2002') {
      console.error('Unique constraint violation');
    } else if (error.code === 'P2003') {
      console.error('Foreign key constraint violation');
    }

    throw error; // Re-throw for caller to handle
  }
}
```

### Pattern 2: Return Error Instead of Throwing

```typescript
async function transactionWithErrorReturn(userId: number, startupId: number) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Operations
      const vote = await tx.vote.create({
        data: { userId, startupId, value: 1 },
      });
      return vote;
    });

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
}

// Usage
const result = await transactionWithErrorReturn(1, 1);
if (result.success) {
  console.log("Vote created:", result.data);
} else {
  console.error("Failed:", result.error);
}
```

---

## 📊 When to Use Transactions

### ✅ USE Transactions When:

```
1. Multiple related writes must succeed together
   Example: Create order + deduct inventory

2. Updating counters based on other operations
   Example: Create vote + increment voteCount

3. Creating parent + children records
   Example: Create startup + tags + initial vote

4. Financial operations
   Example: Transfer funds between accounts

5. Any operation where partial success = data corruption
   Example: User registration + email verification record
```

### ❌ DON'T Need Transactions When:

```
1. Single database operation
   Example: Creating a single comment

2. Read-only operations
   Example: Fetching startups

3. Operations that can fail independently
   Example: Logging events

4. Idempotent operations
   Example: Upserting configuration
```

---

## 🎯 Key Takeaways

✅ **Transactions = Atomic Operations**

- All succeed or all fail
- No partial writes
- Database consistency guaranteed

✅ **Two Transaction Styles**

- Array: `prisma.$transaction([op1, op2])`
- Interactive: `prisma.$transaction(async (tx) => {...})`

✅ **Automatic Rollback**

- Any error → entire transaction rolled back
- No manual cleanup needed
- Database returns to original state

✅ **Error Handling Required**

- Always use try-catch
- Log errors for debugging
- Re-throw or return error object

✅ **Use tx Parameter**

- Inside interactive transaction, use `tx` not `prisma`
- `tx.model.create()` not `prisma.model.create()`
- Ensures operation is part of transaction

---

## 🧪 Testing Transactions

### Test File: `test-transactions.ts`

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runAllTests() {
  console.log("🧪 Running transaction tests...\n");

  // Test 1: Successful transaction
  console.log("Test 1: Successful transaction");
  await createStartupWithEngagement(1, {
    name: "Test Success",
    slug: "test-success-" + Date.now(),
    tagline: "Should succeed",
    description: "Testing successful transaction",
    categoryId: 1,
  });

  // Test 2: Failed transaction (rollback)
  console.log("\nTest 2: Failed transaction (rollback)");
  await demonstrateRollback();

  // Test 3: Upvote with counter
  console.log("\nTest 3: Upvote with counter");
  await upvoteStartupSafe(1, 1);

  console.log("\n✅ All tests complete!");
  await prisma.$disconnect();
}

runAllTests().catch(console.error);
```

**Run tests:**

```bash
npx tsx test-transactions.ts
```

---

**Assignment:** Kalvium Concept 2.16  
**Topic:** Transactions  
**Status:** ✅ Examples Complete  
**Next:** Query Optimisation

Good luck! 🚀

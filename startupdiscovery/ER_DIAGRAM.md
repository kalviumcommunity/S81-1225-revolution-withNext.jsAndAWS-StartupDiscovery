# Entity-Relationship Diagram

## Visual Database Schema

```mermaid
erDiagram
    User ||--o{ Startup : creates
    User ||--o{ Comment : writes
    User ||--o{ Vote : casts
    User ||--o{ Bookmark : saves
    User ||--o{ Session : has
    User ||--o{ Notification : receives
    User ||--o{ Follow : "follows (follower)"
    User ||--o{ Follow : "followed by (following)"
    
    Startup ||--o{ StartupCategory : "belongs to"
    Startup ||--o{ StartupTag : "tagged with"
    Startup ||--o{ Comment : "has"
    Startup ||--o{ Vote : "receives"
    Startup ||--o{ Bookmark : "bookmarked by"
    Startup ||--o{ TeamMember : "has team"
    Startup ||--o{ Media : "has media"
    Startup ||--o{ Milestone : "achieves"
    
    Category ||--o{ StartupCategory : "categorizes"
    Tag ||--o{ StartupTag : "tags"
    
    Comment ||--o{ Comment : "has replies"
    
    User {
        int id PK
        string email UK
        string username UK
        string passwordHash
        string name
        text bio
        string avatarUrl
        enum role
        boolean isVerified
        datetime createdAt
        datetime updatedAt
        datetime lastLoginAt
    }
    
    Startup {
        int id PK
        string title
        string slug UK
        string tagline
        text description
        string logoUrl
        string websiteUrl
        enum stage
        string industry
        decimal fundingGoal
        string location
        int viewCount
        int voteCount
        enum status
        boolean featured
        datetime publishedAt
        datetime createdAt
        datetime updatedAt
        int userId FK
    }
    
    Category {
        int id PK
        string name UK
        string slug UK
        string description
        string iconUrl
        string color
        datetime createdAt
    }
    
    Tag {
        int id PK
        string name UK
        string slug UK
        int useCount
        datetime createdAt
    }
    
    StartupCategory {
        int id PK
        int startupId FK
        int categoryId FK
        datetime createdAt
    }
    
    StartupTag {
        int id PK
        int startupId FK
        int tagId FK
        datetime createdAt
    }
    
    Comment {
        int id PK
        text content
        datetime createdAt
        datetime updatedAt
        int userId FK
        int startupId FK
        int parentId FK
    }
    
    Vote {
        int id PK
        int value
        datetime createdAt
        int userId FK
        int startupId FK
    }
    
    Bookmark {
        int id PK
        datetime createdAt
        int userId FK
        int startupId FK
    }
    
    Follow {
        int id PK
        datetime createdAt
        int followerId FK
        int followingId FK
    }
    
    TeamMember {
        int id PK
        string name
        string role
        text bio
        string avatarUrl
        string linkedinUrl
        string twitterUrl
        datetime createdAt
        int startupId FK
    }
    
    Media {
        int id PK
        enum type
        string url
        string caption
        int order
        datetime createdAt
        int startupId FK
    }
    
    Milestone {
        int id PK
        string title
        text description
        datetime achievedAt
        int order
        datetime createdAt
        int startupId FK
    }
    
    Session {
        string id PK
        int userId FK
        string token UK
        datetime expiresAt
        datetime createdAt
        string ipAddress
        string userAgent
    }
    
    Notification {
        int id PK
        enum type
        string title
        text message
        boolean isRead
        datetime createdAt
        int userId FK
        int startupId
        int commentId
    }
```

## Key Relationships

### One-to-Many
- User → Startup (one user creates many startups)
- User → Comment (one user writes many comments)
- User → Vote (one user casts many votes)
- User → Bookmark (one user saves many bookmarks)
- User → Session (one user has many sessions)
- User → Notification (one user receives many notifications)
- Startup → Comment (one startup has many comments)
- Startup → Vote (one startup receives many votes)
- Startup → Bookmark (one startup bookmarked by many users)
- Startup → TeamMember (one startup has many team members)
- Startup → Media (one startup has many media files)
- Startup → Milestone (one startup achieves many milestones)
- Comment → Comment (one comment has many replies - self-referencing)

### Many-to-Many (via Junction Tables)
- Startup ↔ Category (via StartupCategory)
- Startup ↔ Tag (via StartupTag)
- User ↔ User (via Follow - self-referencing)

### Unique Constraints
- User: email, username
- Startup: slug
- Category: name, slug
- Tag: name, slug
- Session: token
- StartupCategory: (startupId, categoryId) composite
- StartupTag: (startupId, tagId) composite
- Vote: (userId, startupId) composite
- Bookmark: (userId, startupId) composite
- Follow: (followerId, followingId) composite

### Cascade Delete Rules
All foreign key relationships use `ON DELETE CASCADE`:
- Deleting a User removes all their Startups, Comments, Votes, Sessions, etc.
- Deleting a Startup removes all associated Comments, Votes, TeamMembers, Media, etc.
- Deleting a parent Comment removes all reply Comments

## Enums

### UserRole
- USER
- ADMIN
- MODERATOR

### StartupStage
- IDEA
- MVP
- BETA
- LAUNCHED
- GROWTH
- SCALING

### StartupStatus
- DRAFT
- PUBLISHED
- ARCHIVED
- REJECTED

### MediaType
- IMAGE
- VIDEO
- DOCUMENT

### NotificationType
- NEW_COMMENT
- NEW_VOTE
- NEW_FOLLOWER
- STARTUP_PUBLISHED
- STARTUP_FEATURED
- MENTION
- SYSTEM

## Index Strategy

### High-Priority Indexes (Already Defined)
- User: email, username, createdAt
- Startup: userId, slug, status, publishedAt, createdAt, featured, industry
- Category: slug
- Tag: slug, useCount
- StartupCategory: startupId, categoryId
- StartupTag: startupId, tagId
- Comment: userId, startupId, parentId, createdAt
- Vote: userId, startupId
- Bookmark: userId, startupId
- Follow: followerId, followingId
- TeamMember: startupId
- Media: startupId, order
- Milestone: startupId, order
- Session: userId, token, expiresAt
- Notification: userId, isRead, createdAt

### Composite Indexes (Future Optimization)
If query performance requires, consider adding:
- `(status, publishedAt)` on Startup for published startup feeds
- `(userId, createdAt)` on Startup for user's startup history
- `(industry, featured)` on Startup for featured industry listings
- `(isRead, createdAt)` on Notification for unread notification queries

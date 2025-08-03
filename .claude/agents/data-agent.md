---
name: data-agent
description: Specialized agent for data structures, database conventions, business logic standards, and MongoDB document schemas
tools: Read, Edit, Grep
---

You are a specialized agent for data structures, database conventions, and business logic standards.

## Video Status Constants
```js
const VIDEO_STATUS = {
  PENDING: 'pending',   // Default for new videos
  LIKED: 'liked',
  UNLIKED: 'unliked', 
  SKIPPED: 'skipped'
};
```

## Document Structures

### Channel Documents
```js
{
  _id: string,
  channelId: string,   // YouTube channel ID
  userId: string,      // Owner's Meteor user ID
  title: string,
  description: string,
  lastSync: Date
}
```

### Video Documents
```js
{
  _id: string,
  videoId: string,     // YouTube video ID
  channelId: string,   // Reference to channel
  userId: string,      // Owner's Meteor user ID
  title: string,
  status: string,      // "pending", "liked", "unliked", "skipped"
  thumbnailUrl: string,
  publishedAt: Date
}
```

## Data Validation
- Use SimpleSchema for all data structures
- Validate all inputs in methods and publications
- Ensure required fields are present
- Validate data types and formats

## Business Rules
- Default status for new videos is "pending"
- Always associate data with userId for security
- Maintain referential integrity between collections
- Use consistent date formats (Date objects)

## Data Access Patterns
- Filter all queries by userId for security
- Use indexes for frequently queried fields
- Limit data returned by publications
- Validate user permissions before data access
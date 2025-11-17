# Database Seeding Guide

## Overview

The LinkedIn Clone now includes a comprehensive database seeding script that populates your database with realistic fake data for testing and development purposes.

## What Gets Seeded

The seed script creates:

- **30 Users** with complete profiles including:
  - Names, emails, avatars, cover images
  - Professional titles and locations
  - Bios and work experience
  - Education history
  - 5-10 skills per user with endorsements
  - Multiple languages with proficiency levels

- **356 Connections** between users
  - Mix of accepted and pending connections
  - 10-25 connections per user

- **117 Posts** from various users
  - Mix of text-only and image posts
  - Realistic professional content
  - Created within the last 30 days

- **20 Articles** with:
  - Technical topics and comprehensive content
  - Cover images
  - View counts
  - Created within the last 60 days

- **440 Comments** on posts
  - Engaging and realistic comments
  - Distributed across all posts

- **1,659 Likes** total:
  - 1,304 post likes
  - 355 article likes
  - Various reaction types (like, celebrate, support, love, insightful)

- **50 Job Postings** with:
  - Diverse titles and companies
  - Complete job descriptions
  - Requirements and benefits
  - Different job types (Full-time, Part-time, Contract, Internship)
  - Various experience levels

- **215 Job Applications**
  - Cover letters
  - Different statuses (pending, reviewed, interview, rejected, accepted)

- **273 Messages** between users
  - Professional networking messages
  - Created within the last 20 days

- **344 Notifications** for users
  - Mix of likes, comments, connections, messages, and job notifications
  - Created within the last 7 days

- **15 Stories**
  - Mix of image and text stories
  - Active for 24 hours

## How to Run the Seed Script

### First Time Setup

1. Ensure your database is set up and migrations are applied:
   ```bash
   npx prisma migrate dev
   ```

2. Run the seed script:
   ```bash
   npx prisma db seed
   ```

### Re-seeding the Database

If you want to reset and re-populate the database with fresh fake data:

```bash
npx prisma db seed
```

**Note:** The seed script will automatically delete all existing data before creating new fake data.

## Login Credentials

After seeding, you can log in with any of the generated user emails using the password `password123`.

Example logins:
- sarah.johnson@example.com / password123
- michael.chen@example.com / password123
- emily.rodriguez@example.com / password123
- david.kim@example.com / password123
- ... and 26 more users

## Sample Companies

The seed data includes users from major tech companies:
- Google, Microsoft, Apple, Amazon, Meta, Netflix, Tesla
- Salesforce, Adobe, Oracle, IBM, Intel, Cisco
- Uber, Airbnb, Stripe, Spotify, LinkedIn
- And many more

## Sample Skills

Users have various skills including:
- JavaScript, TypeScript, React, Node.js, Python, Java, C++
- AWS, Docker, Kubernetes, MongoDB, PostgreSQL, GraphQL
- Machine Learning, Data Science, Cloud Computing
- UI/UX Design, Figma, Product Strategy
- And many more

## Sample Locations

Users are distributed across global locations:
- San Francisco, New York, Seattle, Austin, Boston
- Los Angeles, Chicago, Denver, Portland, Atlanta
- Toronto, London, Berlin, Paris, Tokyo
- Singapore, Sydney, Amsterdam, Barcelona, Dublin

## Customization

To customize the fake data:

1. Open `prisma/seed.ts`
2. Modify the data arrays at the top:
   - `names` - User names
   - `titles` - Job titles
   - `locations` - User locations
   - `companies` - Company names
   - `skills` - Technical skills
   - `bios` - User bio templates
   - `postContents` - Post content templates
   - `jobTitles` - Job posting titles
   - And more...

3. Adjust the quantities:
   - Change the loop limits to create more/fewer items
   - Modify random ranges for likes, comments, etc.

4. Run the seed script again:
   ```bash
   npx prisma db seed
   ```

## Troubleshooting

### "Unable to compile TypeScript" error

Make sure you have installed the necessary dependencies:
```bash
npm install --save-dev ts-node @types/node @types/bcryptjs
```

### Database connection errors

Verify your `.env` file has the correct `DATABASE_URL`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/linkedin_db"
```

### Seed script takes too long

The script creates a lot of data and relationships. It's normal for it to take 30-60 seconds to complete. If it takes longer, you may want to reduce the number of items being created.

## Next Steps

After seeding the database:

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000`

3. Log in with any seeded user credentials

4. Explore the fully populated LinkedIn clone with realistic data!

---

For more information, see the main [USER_GUIDE.md](./USER_GUIDE.md) for how to use all features of the application.

# Audit Note — linkedin

**Date**: 2026-05-06
**Bucket**: A. DETECTOR_FALSE_POSITIVE (also flagged as junk-name)

## Summary

The whole-project LLM scan returned exactly one hit, but inspection confirms
it is a string literal in seed/demo data, not a real LLM integration:

```
app/hashtag/[tag]/page.tsx:37:    title: 'Senior AI Researcher at OpenAI',
```

This is a job-title string in a hashtag/feed mock page — no API client, no
SDK, no chat/completions call.

## True project state

- **Stack**: Next.js (App Router), Prisma, TypeScript.
- **Source files**: 110 (.ts/.tsx).
- **API routes**: 41 route handlers under `app/api/` (messages, posts,
  articles, groups, search, connections, stories, courses, register,
  profile, etc.).
- **Domain**: LinkedIn-clone social networking — a junk/clone product
  name per the apply-batch policy.

## Disposition

- The detector's single hit is a **false positive** (string literal only).
- The project name `linkedin` is a **junk/clone name** per the workflow:
  trademark-conflicting clones are flagged for archive consideration rather
  than scaffolding.
- **No code changes** applied. No `ai.js` scaffolded:
  - The project is a Next.js App Router project, not the Express backend
    pattern the apply workflow scaffolds.
  - Domain (social-network clone of a trademarked product) makes new AI
    features inadvisable without product-direction review.

## Recommendation

Archive or rename this project before adding new AI surfaces. If retained,
add LLM endpoints natively as Next.js route handlers under `app/api/ai/...`
in a future targeted pass (not this apply batch).

## Audit recommendations applied this batch

**None.** This project is a trademark-conflicting clone with zero genuine
AI integration. Per the apply-batch playbook for junk-names, no scaffolding
or feature work is performed until the rename / archive decision is made
upstream. Investing implementation effort here would only entrench a
clone-product name that the audit policy says should not survive review.

## Backlog (deferred, prioritised by what should happen *before* any AI work)

1. **Rename / archive decision** — TOP PRIORITY. The `linkedin` directory
   should be renamed to a real domain (e.g. `professional-network` or
   moved out of the projects tree if abandoned). Until then, no new
   features should be added.
2. **Mock-data hygiene** — `app/hashtag/[tag]/page.tsx` and similar pages
   contain hard-coded seed strings ("Senior AI Researcher at OpenAI",
   etc.) that explicitly reference trademarked competitors. Replace with
   neutral placeholders.
3. **Add `app/api/ai/*` once the rename happens** — common Next.js
   patterns for a professional-network clone (post-summarisation,
   profile-bio generator, connection suggestion explanations) follow the
   sibling `repairShop` / `salesforce` pattern in this batch.
4. **Add `.env.example`** — none currently exists. Should include
   `DATABASE_URL` (Prisma is already configured), and the sentinel
   `OPENROUTER_API_KEY` placeholder so future AI work is unblocked.

## Files touched this batch

None.

## Apply pass 3 (frontend)

- **Action:** SKIPPED-NO-DOMAIN.
- **Reason:** No backend AI endpoints exist (the single detector hit is a string literal in seed data); the project is also a junk/clone trademark-conflicting name flagged for archive/rename. Per audit policy no FE scaffolding is performed.
- **Files modified:** none.

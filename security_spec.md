# Security Specification for GitPilot AI

## Data Invariants
1. `Analysis` documents MUST belong to a valid user (`userId`).
2. `Analysis` documents MUST be readable only by their owner.
3. `Analysis` documents MUST be created with a `createdAt` timestamp equal to the server time.
4. `UserProfile` documents MUST be readable and writable only by the user themselves (`userId` in path matches `auth.uid`).

## The "Dirty Dozen" Payloads (Red Team Test Cases)

1. **Identity Spoofing (Create Analysis as Other User)**: try to create a doc in `analyses` with a `userId` that doesn't match `request.auth.uid`.
2. **Identity Spoofing (Read Analysis of Other User)**: try to read a doc in `analyses` where `userId` is someone else's.
3. **Identity Spoofing (Update Analysis of Other User)**: try to update a doc in `analyses` where `userId` is someone else's.
4. **State Poisoning (Malformed ID)**: try to create a doc with an ID that is 2KB of random characters.
5. **PII Leak (List All Users)**: try to list the `users` collection without a filter.
6. **PII Leak (Read Other User Profile)**: try to `get` `/users/someone-else`.
7. **Resource Exhaustion (1MB String)**: try to save a 1MB string into the `name` field.
8. **Immortality Bypass (Overwrite createdAt)**: try to update the `createdAt` field on an existing analysis.
9. **Timestamp Spoofing (Client Timestamp)**: try to create an analysis with a `createdAt` value from the client's past/future.
10. **Shadow Update (Ghost Fields)**: try to update an analysis with a forbidden field like `isAdmin: true`.
11. **Unauthenticated Access**: try to read any collection without being signed in.
12. **Malicious Profile Type**: try to set `photoURL` to a number instead of a string.

## Test Runner (Conceptual firestore.rules.test.ts)
```typescript
// Test suites for the above cases would go here.
// Each test would simulate a specific auth context and payload.
```

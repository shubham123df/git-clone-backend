# Secure Token Storage Strategy

This document describes how the system stores and uses **Git provider personal access tokens (PATs)** for private repository access (GitHub, GitLab).

## Principles

1. **Encrypt at rest** – Tokens are never stored in plaintext.
2. **Never expose in API** – Raw tokens are never returned in any API response (list, get, or error payloads).
3. **Server-side use only** – Decryption happens only in backend services when calling the Git provider API (e.g. to fetch branches or PR metadata).
4. **Key from environment** – Encryption key is provided via `TOKEN_ENCRYPTION_KEY` and must be kept secret and rotated with care.

## Implementation

### Storage

- **Table**: `repository_tokens` (Prisma model `RepositoryToken`).
- **Fields**: `userId`, `provider` (GITHUB | GITLAB), `encryptedToken`, optional `scopeHint`, timestamps.
- **Uniqueness**: One token per user per provider (`userId`, `provider`).

### Encryption

- **Algorithm**: AES-256-GCM (authenticated encryption).
- **Key**:
  - **Production**: Set `TOKEN_ENCRYPTION_KEY` to a 64-character hex string (32 bytes). Generate with:  
    `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
  - **Development**: If unset or not 64 hex chars, a key is derived from the env value (or a default) via scrypt/sha256 for local dev only.
- **Process**: On create/update, the backend encrypts the token and stores only the ciphertext. Decryption is performed only when the backend needs to call GitHub/GitLab (e.g. in a future “fetch branches” or “sync PR” flow).

### API Behavior

| Endpoint | Behavior |
|----------|----------|
| `POST /api/v1/repository-tokens` | Body: `{ provider, token }`. Token is encrypted and stored. Response: `{ provider, message }` – no token. |
| `GET /api/v1/repository-tokens` | Returns list of configured tokens with `provider`, `scopeHint`, `createdAt`, `updatedAt`, and `hasToken: true`. No raw token. |
| `DELETE /api/v1/repository-tokens/:provider` | Revokes (deletes) the token for that provider. |

### Safeguards

- Only the authenticated user can create, list, or revoke their own tokens (JWT `sub` = `userId`).
- Tokens are never logged or included in error messages.
- Use HTTPS in production so tokens are not sent in clear text on the wire.

## Key Management (Production)

1. Generate a 32-byte key: `openssl rand -hex 32` or the Node one-liner above.
2. Set `TOKEN_ENCRYPTION_KEY` in the server environment (e.g. Render env vars, Kubernetes secret).
3. **Rotation**: To rotate the key, you must re-encrypt existing tokens with the new key (implement a migration or admin script that reads each row, decrypts with old key, re-encrypts with new key, then updates the row and switches the env to the new key).

## Token Scope Guidance (for users)

- **GitHub**: Create a PAT with scopes such as `repo` (for private repos), and optionally `read:org` if needed. Document in UI or help text.
- **GitLab**: Use a PAT with `read_repository` (and optionally `api`) for reading branches and PR metadata. Document in UI or help text.

The application may store an optional `scopeHint` (e.g. "repo, read:org") for display only – it is not used for validation; it helps users remember what they configured.

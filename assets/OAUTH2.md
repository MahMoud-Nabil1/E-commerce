# OAuth2 Social Login — Implementation Guide

This document covers everything you need to know to configure, run, and extend the Google and GitHub OAuth2 login integration added to this project.

---

## Table of Contents

1. [Overview](#overview)
2. [How It Works — The Full Flow](#how-it-works--the-full-flow)
3. [Files Changed / Added](#files-changed--added)
4. [Provider Setup](#provider-setup)
   - [Google](#google)
   - [GitHub](#github)
5. [Environment Variables](#environment-variables)
6. [Database Changes](#database-changes)
7. [Frontend Integration](#frontend-integration)
8. [Account Linking Logic](#account-linking-logic)
9. [GitHub Private Email Handling](#github-private-email-handling)
10. [Session Policy Note](#session-policy-note)
11. [Adding a New Provider](#adding-a-new-provider)
12. [Production Checklist](#production-checklist)

---

## Overview

The project previously used only username/password login with JWT cookies. OAuth2 has been layered on top of that existing system — the JWT cookie mechanism is **unchanged and reused**. After a successful OAuth2 login, the user receives the exact same `ecommerce-cookie` JWT that a regular login produces, so the rest of the application (protected endpoints, `@AuthenticationPrincipal`, etc.) requires zero changes.

---

## How It Works — The Full Flow

```
Browser                     Backend                        Provider (Google/GitHub)
  │                            │                                    │
  │  GET /oauth2/authorization/google                               │
  │ ─────────────────────────► │                                    │
  │                            │  redirect to Google consent screen │
  │ ◄──────────────────────────│ ──────────────────────────────────►│
  │                            │                                    │
  │  (user approves)           │                                    │
  │                            │ ◄──── authorization code ──────────│
  │                            │                                    │
  │                            │  exchange code for access token    │
  │                            │ ──────────────────────────────────►│
  │                            │ ◄──── access token ────────────────│
  │                            │                                    │
  │                            │  fetch user info (name, email, id) │
  │                            │ ──────────────────────────────────►│
  │                            │ ◄──── user attributes ─────────────│
  │                            │                                    │
  │                            │  CustomOAuth2UserService           │
  │                            │  → find or create local User       │
  │                            │  → return UserDetailsImpl          │
  │                            │                                    │
  │                            │  OAuth2AuthenticationSuccessHandler│
  │                            │  → generate JWT cookie             │
  │                            │  → redirect to frontend callback   │
  │ ◄──── Set-Cookie + 302 ────│                                    │
  │                            │                                    │
  │  GET /oauth2/callback?success=true
  │  (frontend reads cookie, user is logged in)
```

Spring Security handles steps 1–5 automatically. You only write the code for steps 6–8.

---

## Files Changed / Added

### New files

| File | Purpose |
|------|---------|
| `Security/OAuth2/OAuth2UserInfo.java` | Abstract base class normalising provider attributes |
| `Security/OAuth2/GoogleOAuth2UserInfo.java` | Extracts `sub`, `name`, `email` from Google's attributes |
| `Security/OAuth2/GithubOAuth2UserInfo.java` | Extracts `id`, `login`, `email` from GitHub's attributes |
| `Security/OAuth2/OAuth2UserInfoFactory.java` | Factory — returns the right subclass for a given provider |
| `Security/OAuth2/CustomOAuth2UserService.java` | Core service — finds/creates the local User record |
| `Security/OAuth2/OAuth2AuthenticationSuccessHandler.java` | Issues JWT cookie, redirects to frontend |
| `Security/OAuth2/OAuth2AuthenticationFailureHandler.java` | Redirects to frontend with error message |

### Modified files

| File | What changed |
|------|-------------|
| `pom.xml` | Added `spring-boot-starter-oauth2-client` dependency |
| `Models/User.java` | Added `provider` (default `"local"`) and `providerId` fields; `password` is now nullable |
| `Repositories/UserRepository.java` | Added `findByEmail` and `findByProviderAndProviderId` query methods |
| `Security/SecurityConfig.java` | Wired `oauth2Login()`, changed session policy to `IF_REQUIRED`, added OAuth2 URL permit rules |
| `application.properties` | Added Google/GitHub registration config and `app.oauth2.redirect-uri` |
| `.env` | Added placeholder keys for all four OAuth2 credentials |

---

## Provider Setup

### Google

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project (or select an existing one).
3. Navigate to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**.
4. Set **Application type** to **Web application**.
5. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:8080/login/oauth2/code/google
   ```
   For production, also add your production URL:
   ```
   https://yourdomain.com/login/oauth2/code/google
   ```
6. Copy the **Client ID** and **Client Secret** into your `.env`:
   ```
   GOOGLE_CLIENT_ID=your-client-id-here
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   ```
7. Enable the **Google+ API** (or **People API**) in the API Library if prompted.

### GitHub

1. Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Fill in:
   - **Application name**: anything (e.g. `E-commerce Dev`)
   - **Homepage URL**: `http://localhost:8080`
   - **Authorization callback URL**:
     ```
     http://localhost:8080/login/oauth2/code/github
     ```
3. Click **Register application**, then **Generate a new client secret**.
4. Copy the **Client ID** and **Client Secret** into your `.env`:
   ```
   GITHUB_CLIENT_ID=your-client-id-here
   GITHUB_CLIENT_SECRET=your-client-secret-here
   ```

---

## Environment Variables

Add these to your `.env` file (already scaffolded with placeholders):

```dotenv
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# The frontend URL Spring redirects to after OAuth2 login.
# Change this to your production frontend URL when deploying.
OAUTH2_REDIRECT_URI=http://localhost:5173/oauth2/callback
```

---

## Database Changes

Two new columns are added to the `Users` table via Hibernate's `ddl-auto=update`:

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `provider` | `VARCHAR(20)` | No | `"local"` | `"local"`, `"google"`, or `"github"` |
| `provider_id` | `VARCHAR(255)` | Yes | `NULL` | The unique ID from the provider |

Existing rows will have `provider = NULL` after the migration. Run this SQL once to backfill them:

```sql
UPDATE Users SET provider = 'local' WHERE provider IS NULL;
```

The `password` column constraint is also relaxed from `NOT NULL` to nullable to support OAuth2-only accounts.

---

## Frontend Integration

### Initiating login

Add login buttons that navigate to these backend URLs:

```html
<!-- Google -->
<a href="http://localhost:8080/oauth2/authorization/google">Sign in with Google</a>

<!-- GitHub -->
<a href="http://localhost:8080/oauth2/authorization/github">Sign in with GitHub</a>
```

These URLs are handled entirely by Spring Security — no backend controller needed.

### Handling the callback

After login, Spring redirects to your `OAUTH2_REDIRECT_URI` (default: `http://localhost:5173/oauth2/callback`) with query parameters:

| Scenario | URL |
|----------|-----|
| Success | `/oauth2/callback?success=true` |
| Failure | `/oauth2/callback?success=false&error=<encoded-message>` |

The JWT cookie is already set in the browser at this point. Your callback page just needs to read the query params and redirect the user:

```javascript
// Example React callback page
const params = new URLSearchParams(window.location.search);
if (params.get('success') === 'true') {
  // Cookie is already set — just navigate to the home page
  navigate('/');
} else {
  const error = decodeURIComponent(params.get('error') || 'Login failed');
  showErrorMessage(error);
  navigate('/login');
}
```

---

## Account Linking Logic

`CustomOAuth2UserService` uses a three-step resolution strategy:

1. **Match by (provider, providerId)** — the most reliable match. Used on every subsequent login after the first.
2. **Match by email** — if a user previously registered locally with the same email, their account is automatically linked to the OAuth2 provider. The `provider` and `providerId` fields are updated so future logins use step 1.
3. **Create new user** — if no match is found, a new `User` record is created with `ROLE_USER`, a sanitized username derived from the provider's display name, and no password.

This means a user who signed up with `john@gmail.com` and then clicks "Sign in with Google" (using the same Gmail address) will be seamlessly logged into their existing account.

---

## GitHub Private Email Handling

GitHub allows users to hide their email address. When this happens, the `email` attribute in the OAuth2 response is `null`.

The `CustomOAuth2UserService` handles this by generating a deterministic placeholder email:

```
<githubUserId>@github.oauth2.noemail
```

For example: `12345678@github.oauth2.noemail`

This satisfies the `NOT NULL` constraint on the `email` column. The user can update their email later through a profile settings endpoint if you add one.

---

## Session Policy Note

The original project used `SessionCreationPolicy.STATELESS`. This has been changed to `IF_REQUIRED`.

**Why:** OAuth2's authorization code flow requires a brief server-side session to store the `state` parameter (CSRF protection) and `nonce` (replay protection) during the redirect. Spring Security creates this session automatically and discards it after the success handler runs.

**Impact:** Regular API calls still don't create sessions — the `IF_REQUIRED` policy only creates a session when Spring Security itself needs one (i.e. during the OAuth2 redirect). JWT-authenticated requests are unaffected.

---

## Adding a New Provider

To add a third provider (e.g. Facebook):

1. Add the Spring registration config to `application.properties`:
   ```properties
   spring.security.oauth2.client.registration.facebook.client-id=${FACEBOOK_CLIENT_ID}
   spring.security.oauth2.client.registration.facebook.client-secret=${FACEBOOK_CLIENT_SECRET}
   spring.security.oauth2.client.registration.facebook.scope=email,public_profile
   spring.security.oauth2.client.registration.facebook.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}
   ```

2. Create `FacebookOAuth2UserInfo.java` extending `OAuth2UserInfo`, mapping Facebook's attribute keys.

3. Add a `case "facebook"` to `OAuth2UserInfoFactory.getOAuth2UserInfo()`.

4. Add the credentials to `.env` and register the callback URL in the Facebook developer console.

That's it — no other files need to change.

---

## Production Checklist

- [ ] Replace all `.env` placeholder values with real credentials
- [ ] Set `OAUTH2_REDIRECT_URI` to your production frontend URL
- [ ] Register the production callback URLs in Google Cloud Console and GitHub OAuth App settings:
  - `https://yourdomain.com/login/oauth2/code/google`
  - `https://yourdomain.com/login/oauth2/code/github`
- [ ] Set `secure(true)` in `JwtUtils.generateJwtCookie()` (currently `false` for local HTTP dev)
- [ ] Set `sameSite("Strict")` in `JwtUtils.generateJwtCookie()` (currently `Lax` for Vite proxy compatibility)
- [ ] Run the SQL backfill for existing users: `UPDATE Users SET provider = 'local' WHERE provider IS NULL;`
- [ ] Ensure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` are set as environment variables in your deployment environment (not committed to source control)

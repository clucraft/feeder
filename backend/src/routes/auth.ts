import { Router } from "express";
import crypto from "crypto";
import axios from "axios";

const router = Router();

function getRedirectUri(req: import("express").Request): string {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.headers["x-forwarded-host"] || req.get("host");
  return `${protocol}://${host}/api/auth/linkedin/callback`;
}

// In-memory stores with expiry
const stateStore = new Map<string, { createdAt: number }>();
const tempTokenStore = new Map<
  string,
  { accessToken: string; expiresIn: number; createdAt: number }
>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of stateStore) {
    if (now - value.createdAt > 10 * 60 * 1000) stateStore.delete(key);
  }
  for (const [key, value] of tempTokenStore) {
    if (now - value.createdAt > 10 * 60 * 1000) tempTokenStore.delete(key);
  }
}, 5 * 60 * 1000);

// GET /api/auth/linkedin — Redirect to LinkedIn authorization
router.get("/linkedin", (req, res) => {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = getRedirectUri(req);

  if (!clientId) {
    res.status(500).json({ error: "LINKEDIN_CLIENT_ID is not configured" });
    return;
  }

  const state = crypto.randomUUID();
  stateStore.set(state, { createdAt: Date.now() });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "openid profile email w_member_social",
    state,
  });

  res.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params}`);
});

// GET /api/auth/linkedin/callback — Handle OAuth callback
router.get("/linkedin/callback", async (req, res) => {
  const { code, state, error, error_description } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  if (error) {
    console.error("LinkedIn OAuth error:", error, error_description);
    res.redirect(`${frontendUrl}/admin/organizations?auth=error&message=${encodeURIComponent(String(error_description || error))}`);
    return;
  }

  if (!code || !state) {
    res.redirect(`${frontendUrl}/admin/organizations?auth=error&message=missing_params`);
    return;
  }

  // Validate state
  const stateEntry = stateStore.get(state as string);
  if (!stateEntry || Date.now() - stateEntry.createdAt > 10 * 60 * 1000) {
    stateStore.delete(state as string);
    res.redirect(`${frontendUrl}/admin/organizations?auth=error&message=invalid_state`);
    return;
  }
  stateStore.delete(state as string);

  try {
    const clientId = process.env.LINKEDIN_CLIENT_ID!;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;
    const redirectUri = getRedirectUri(req);

    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code as string,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { access_token, expires_in } = tokenResponse.data;

    // Store token temporarily
    const tempTokenId = crypto.randomUUID();
    tempTokenStore.set(tempTokenId, {
      accessToken: access_token,
      expiresIn: expires_in,
      createdAt: Date.now(),
    });

    res.redirect(`${frontendUrl}/admin/organizations?auth=success&token=${tempTokenId}`);
  } catch (err) {
    console.error("LinkedIn token exchange failed:", err);
    res.redirect(`${frontendUrl}/admin/organizations?auth=error&message=token_exchange_failed`);
  }
});

// POST /api/auth/linkedin/token — Exchange code manually (alternative flow)
router.post("/linkedin/token", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    res.status(400).json({ error: "code is required" });
    return;
  }

  try {
    const clientId = process.env.LINKEDIN_CLIENT_ID!;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;
    const redirectUri = getRedirectUri(req);

    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { access_token, expires_in } = tokenResponse.data;

    const tempTokenId = crypto.randomUUID();
    tempTokenStore.set(tempTokenId, {
      accessToken: access_token,
      expiresIn: expires_in,
      createdAt: Date.now(),
    });

    res.json({ temp_token_id: tempTokenId, expires_in });
  } catch (err) {
    console.error("LinkedIn token exchange failed:", err);
    res.status(500).json({ error: "Failed to exchange code for token" });
  }
});

// Helper to retrieve and consume a temp token
export function consumeTempToken(
  tempTokenId: string
): { accessToken: string; expiresIn: number } | null {
  const entry = tempTokenStore.get(tempTokenId);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > 10 * 60 * 1000) {
    tempTokenStore.delete(tempTokenId);
    return null;
  }
  tempTokenStore.delete(tempTokenId);
  return { accessToken: entry.accessToken, expiresIn: entry.expiresIn };
}

export default router;
